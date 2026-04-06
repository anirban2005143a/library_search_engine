import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import "dotenv/config";

// Read the token from the request
// Check if token is valid

// client making these requests should also be sending the jwt token with the header or the cookie

const authenticate = async (req, res, next) => {
  console.log("Auth middleware reached...");
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // ["Bearer", "afjdkjafsafd"]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated, invalid token",
    });
  }

  try {
    // verify token and extract user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      // happens when the user is logged in, but deletes account and then try to access some feature
      return res.status(401).json({
        error: "User no longer exists",
      });
    }

    req.user = user; // attach user to the request so that other routes can access it
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Not authenticated, invalid token",
    });
  }
};

export { authenticate };
