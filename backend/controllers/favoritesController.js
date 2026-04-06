import { prisma } from "../config/db.js";

// const addToFavorites = async (req, res) => {
//   const { bookId, notes } = req.body;

//   // Verify book exists in the Book table
//   const book = await prisma.book.findUnique({
//     where: { id: bookId },
//   });

//   if (!book) {
//     return res.status(404).json({
//       error: `Book with id: ${bookId} not found`,
//     });
//   }

//   // Check if already added
//   const added = await prisma.favorites.findUnique({
//     where: {
//       userId_bookId: {
//         userId: req.user.id,
//         bookId: bookId,
//       },
//     },
//   });

//   if (added) {
//     return res.status(400).json({
//       error: "Book already in Favorites",
//     });
//   }

//   const favoriteItem = await prisma.favorites.create({ <- .create() throws an error if the record is not existing, this can occur in a race condition so using try catch is good
//     data: {
//       userId: req.user.id,
//       bookId,
//       notes,
//     },
//   });

//   res.status(201).json({
//     status: "Success",
//     data: {
//       favoriteItem,
//     },
//   });
// };

const addToFavorites = async (req, res) => {
  const { bookId, notes } = req.body;
  const userId = req.user.id;

  // 1. Check book exists (good UX)
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    error.code = "BOOK_NOT_FOUND";
    throw error;
  }

  try {
    // 2. Just try to create it directly
    const favoriteItem = await prisma.favorites.create({
      data: { userId, bookId, notes },
    });

    res.status(201).json({ status: "Success", data: { favoriteItem } });
  } catch (error) {
    // 3. Handle the duplicate case if it happens
    if (error.code === "P2002") {
      const prismaError = new Error("Book already in Favorites");
      prismaError.status = 400;
      prismaError.code = "DUPLICATE_FAVORITE";
      throw prismaError;
    }
    throw error;
  }
};

const deleteManyFavorites = async (req, res) => {
  const { ids } = req.body; // Expecting ["id1", "id2"]
  const currentUserId = req.user.id;

  // 1. Zod validation (optional but recommended)
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error("Please provide an array of Favorite IDs.");
    error.status = 400;
    error.code = "INVALID_INPUT";
    throw error;
  }

  // 2. Perform the deletion
  // Security: We filter by BOTH the provided IDs AND the logged-in user's ID
  const deleted = await prisma.favorites.deleteMany({
    where: {
      id: { in: ids },
      userId: currentUserId,
    },
  });

  // 3. Response
  return res.status(200).json({
    status: "success",
    message: `${deleted.count} items removed from Favorites.`,
    requestedCount: ids.length,
    deletedCount: deleted.count,
  });
};

const updateFavoriteItem = async (req, res) => {
  const favId = req.params.id;
  const { notes } = req.body;
  const currentUserId = req.user.id; // From your auth middleware

  try {
    const updatedItem = await prisma.favorites.update({
      // The "where" can include multiple unique constraints or the ID
      where: {
        id: favId,
        userId: currentUserId,
      },
      data: { notes },
    });

    // Manual ownership check (seems redundant but keeping)
    if (updatedItem.userId !== currentUserId) {
      const error = new Error("Not allowed");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    res.status(200).json({
      status: "success",
      data: {
        favoriteItem: updatedItem,
      },
    });
  } catch (error) {
    // Prisma throws a P2025 error if the record is not found
    if (error.code === "P2025") {
      const prismaError = new Error("Item not found");
      prismaError.status = 404;
      prismaError.code = "FAVORITE_NOT_FOUND";
      throw prismaError;
    }
    throw error;
  }
};

const getFavorites = async (req, res) => {
  const userId = req.user.id;

  const favorites = await prisma.favorites.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      notes: true,
      createdAt: true,
      book: {
        select: {
          title: true,
        },
      },
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      favorites,
    },
  });
};

export {
  addToFavorites,
  deleteManyFavorites,
  updateFavoriteItem,
  getFavorites,
};

/*
1. The "Find" Methods (Returns null)
When you are just searching, Prisma assumes "not finding anything" is a valid outcome.

findUnique() and findFirst() return null if no match is found.

findMany() returns an empty array [].

Your logic worked here: if (!favoriteItem) was perfectly correct for your findUnique call.

2. The "Mutation" Methods (Throws Error)
When you tell Prisma to Update or Delete, you are giving it a specific command. Prisma assumes that if you're asking to delete ID 123, that ID should exist. If it doesn't, Prisma considers the operation a failure.

update(), delete(), and upsert() will throw an exception (specifically error code P2025) if the record isn't found.

Your logic would fail here: The code would crash (or hit your catch block) before it ever reached an if (!deletedItem) check.
*/
