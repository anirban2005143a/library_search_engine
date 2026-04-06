import express from "express";
import {
  addToFavorites,
  deleteManyFavorites,
  getFavorites,
  updateFavoriteItem,
} from "../../controllers/favoritesController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  addToFavoritesSchema,
  deleteFavoritesSchema,
  updateFavoriteItemSchema,
  updateFavoriteParamsSchema,
} from "../../validators/favoritesValidator.js";

const router = express.Router();

router.use(authenticate);


router.get("/", getFavorites);

router.post("/", validateRequest(addToFavoritesSchema), addToFavorites);
router.delete(
  "/delete-many",
  validateRequest(deleteFavoritesSchema),
  deleteManyFavorites,
);
router.put(
  "/:id",
  validateRequest({
    body: updateFavoriteItemSchema,
    params: updateFavoriteParamsSchema,
  }),
  updateFavoriteItem,
);

export default router;
