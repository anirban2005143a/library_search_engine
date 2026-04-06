import express from "express";
import {
  getAllUsers,
  deleteUser,
  resetPasswordByAdmin,
  deleteManyUsers,
  updateRole,
  registerUsersBulk,
} from "../../controllers/crudReaderController.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  adminResetPasswordSchema,
  adminUpdateUserSchema,
  deleteUsersSchema,
  registerBulkSchema,
  userIdParamsSchema,
} from "../../validators/crudReaderValidator.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { upload, excelToJsonMiddleware } from "../../middleware/excelToJson.js";
const router = express.Router();

// need a middleware here to verify that the user sending this request has role: ADMIN || role: ROOT_ADMIN

router.use(authenticate);

router.get("/", authorize(["ROOT_ADMIN", "ADMIN"]), getAllUsers);

/*
A Note on Frontend Implementation:
1. For the File: The frontend must use FormData and append('file', yourFile).

2. For the Form: The frontend can send a standard JSON Content-Type: application/json with the array [{...}, {...}].

3. Multer Tip: By putting upload.single("file") first, if the request is JSON, Multer simply does nothing and passes it to the next middleware. It won't crash the request.
*/
router.post(
  "/register-users",
  authorize(["ROOT_ADMIN"]),
  upload.single("file"),      // 1. Grab file from 'file' field in form-data
  excelToJsonMiddleware,      // 2. Turn file or raw body into a unified array
  validateRequest({ body: registerBulkSchema}),
  registerUsersBulk,
);
router.post(
  "/delete-many",
  authorize(["ROOT_ADMIN"]),
  validateRequest({body: deleteUsersSchema}),
  deleteManyUsers,
);
router.delete(
  "/:id",
  authorize(["ROOT_ADMIN"]),
  validateRequest({params: userIdParamsSchema}),
  deleteUser,
);
router.put(
  "/reset-password/:id",
  authorize(["ROOT_ADMIN"]),
  validateRequest({
    body: adminResetPasswordSchema,
    params: userIdParamsSchema,
  }),
  resetPasswordByAdmin,
);
router.put(
  "/:id",
  authorize(["ROOT_ADMIN"]),
  validateRequest({ body: adminUpdateUserSchema, params: userIdParamsSchema }),
  updateRole,
);


export default router;
