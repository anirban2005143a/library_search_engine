import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { createLog } from "../utils/logging.js";

const registerUsersBulk = async (req, res) => {
  // 1. Authorization Check (Still required for the requester)
  if (req.user.role !== "ADMIN" && req.user.role !== "ROOT_ADMIN") {
    const error = new Error("Access denied.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  // Expecting an array of users in req.body
  const usersArray = req.body;

  if (!Array.isArray(usersArray) || usersArray.length === 0) {
    const error = new Error("Invalid input: Expected an array of users.");
    error.status = 400;
    throw error;
  }

  const results = {
    success: [],
    errors: [],
  };

  // 2. Process each user
  // We use a for...of loop to handle async/await properly for each record
  for (const userData of usersArray) {
    const { firstName, lastName, email, password, role } = userData;

    try {
      // dont allow admin to create a root_admin
      if (req.user.role === "ADMIN" && role === "ROOT_ADMIN") {
        results.errors.push({ email, message: "Access denied" });
      }
      // Check if email is already taken
      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        results.errors.push({ email, message: "User already exists" });
        continue; // Skip to next user
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create User
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName: lastName || "",
          email,
          password: hashedPassword,
          role: role || "READER",
          createdBy: req.user.id,
        },
      });

      results.success.push({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (err) {
      results.errors.push({ email, message: err.message });
    }
  }

  createLog({
    action: "USER_BULK_UPLOAD",
    entity: "User",
    req,
    details: {
      count: results.success.length,
      failed: results.errors.length,
    },
  });

  // sendMail(user.email)

  // 3. Final Response
  res.status(201).json({
    status: "Process Completed",
    summary: {
      total: usersArray.length,
      successful: results.success.length,
      failed: results.errors.length,
    },
    data: results,
  });
};

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      createdBy: true,
      // We omit 'password' here for security
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params; // Target user to delete
  const currentUser = req.user; // Requester (from JWT middleware)

  try {
    // 1. Prevent Self-Deletion
    if (id === currentUser.id) {
      const error = new Error("You cannot delete your own account.");
      error.status = 400;
      error.code = "SELF_DELETION_NOT_ALLOWED";
      throw error;
    }

    // 2. Fetch the target user to check their role
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      const error = new Error("User not found.");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // 3. RBAC Hierarchy Protection
    // - No one can delete a ROOT_ADMIN (System Safety)
    // - ADMINS can only delete READERS
    // - ROOT_ADMINS can delete ADMINS and READERS

    if (targetUser.role === "ROOT_ADMIN") {
      const error = new Error(
        "Security Restriction: Root Admins cannot be deleted.",
      );
      error.status = 403;
      error.code = "ROOT_ADMIN_PROTECTED";
      throw error;
    }

    if (currentUser.role === "ADMIN" && targetUser.role === "ADMIN") {
      const error = new Error(
        "Access Denied: Admins cannot delete other Admins.",
      );
      error.status = 403;
      error.code = "INSUFFICIENT_PERMISSION";
      throw error;
    }

    // 4. Perform the deletion
    await prisma.user.delete({
      where: { id },
    });

    createLog({
      action: "USER_DELETION",
      entity: "User",
      req,
    });

    return res.status(200).json({
      status: "success",
      message: `User ${targetUser.email} has been permanently deleted.`,
    });
  } catch (error) {
    throw error;
  }
};

const deleteManyUsers = async (req, res) => {
  // 1. Extract the validated data
  const { emails } = req.body;
  const currentUser = req.user;
  console.log("In the delete many users");
  // 2. Safety Check: Filter out self
  console.log("Filetering users");
  const filteredEmails = emails.filter((email) => email !== currentUser.email);

  // 3. Role Hierarchy Logic (as we discussed before)
  let rolesCanDelete = ["READER"];
  if (currentUser.role === "ROOT_ADMIN") {
    rolesCanDelete.push("ADMIN");
  }

  console.log("Deleting users");
  // 4. Execute Delete
  const deleted = await prisma.user.deleteMany({
    where: {
      email: { in: filteredEmails },
      role: { in: rolesCanDelete },
      NOT: { role: "ROOT_ADMIN" },
    },
  });

  console.log("Creating logs");
  createLog({
    action: "USER_BULK_DELETION",
    entity: "User",
    req,
  });
  console.log("Exiting deleteMany contoller");

  return res.status(200).json({
    message: `Deleted ${deleted.count} users successfully.`,
  });
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  // const { firstName, lastName, email, role } = req.body;
  const { role } = req.body;

  try {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // 2. Authorization Logic
    // Regular ADMINs shouldn't be able to change a ROOT_ADMIN's role
    if (req.user.role === "ADMIN" && existingUser.role === "ROOT_ADMIN") {
      const error = new Error("Admins cannot modify Root Admin accounts.");
      error.status = 403;
      error.code = "INSUFFICIENT_PERMISSION";
      throw error;
    }

    // 3. Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
      },
    });

    createLog({
      action: "USER_ROLE_CHANGE",
      entity: "User",
      req,
      details: {
        message: `ROLE CHANGED FROM ${existingUser.role} TO ${updatedUser.role}`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser.id,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

const resetPasswordByAdmin = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // 1. Basic validation (You can also use a mini Zod schema here)
    if (!newPassword || newPassword.length < 8) {
      const error = new Error(
        "New password must be at least 8 characters long.",
      );
      error.status = 400;
      error.code = "INVALID_PASSWORD";
      throw error;
    }

    // 2. Check if the target user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error("User not found.");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // 3. Security Check: Protect Root Admins from other Admins
    // (Only a Root Admin should be able to reset another Root Admin's password)
    if (user.role === "ROOT_ADMIN" && req.user.role !== "ROOT_ADMIN") {
      const error = new Error(
        "Permission denied. Only Root Admins can reset other Root Admin passwords.",
      );
      error.status = 403;
      error.code = "INSUFFICIENT_PERMISSION";
      throw error;
    }

    // 4. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. Update the user
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        // we need to work on this: Force them to change it on next login
        // mustChangePassword: true
      },
    });

    createLog({
      action: "USER_PASSWORD_UPDATE_BY_ADMIN",
      entity: "User",
      req,
    });

    res.status(200).json({
      status: "success",
      message: `Password for ${user.email} has been reset successfully.`,
    });
  } catch (error) {
    throw error;
  }
};

export {
  registerUsersBulk,
  getAllUsers,
  deleteUser,
  deleteManyUsers,
  resetPasswordByAdmin,
  updateRole,
};

/*
Separation of Concerns.

In a production app, you generally want three distinct ways 
to change a password, and they should almost never be in the same "General Update" route:

1. Forgot Password: (Unauthenticated) Uses email + Token/OTP.

2. Change Password: (Authenticated) User is logged in and provides oldPassword + newPassword. (need to work on this, remove this bracket if its already implemented ;-> )

3. Admin Reset: (Admin Only) Admin forces a new password because the user is locked out or it's a new account.
*/
