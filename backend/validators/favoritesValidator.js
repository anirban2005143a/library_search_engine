import { z } from "zod";

const addToFavoritesSchema = z.object({
  bookId: z.string().uuid(),
  notes: z.string().optional(),
});

const updateFavoriteItemSchema = z.object({
  notes: z.string().optional(),
});

const deleteFavoritesSchema = z.object({
  ids: z
    .array(
      z.string().uuid("One or more IDs have an invalid format"), // Matches @default(uuid())
    )
    .min(1, "You must select at least one item to delete"),
});

const deleteFavoriteParamsSchema = z.object({
  id: z.string().uuid("Invalid favorite ID format"),
});

const updateFavoriteParamsSchema = z.object({
  id: z.string().uuid("Invalid favorite ID format"),
});

export {
  addToFavoritesSchema,
  updateFavoriteItemSchema,
  deleteFavoritesSchema,
  deleteFavoriteParamsSchema,
  updateFavoriteParamsSchema,
};
