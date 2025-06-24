import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

const router = Router();

// GET /api/users - Get all users with pagination
router.get("/", UserController.index);

// GET /api/users/:id - Get user by ID
router.get("/:id", UserController.show);

// POST /api/users - Create a new user
router.post("/", UserController.create);

// PUT /api/users/:id - Update user
router.put("/:id", UserController.update);

// DELETE /api/users/:id - Delete user
router.delete("/:id", UserController.delete);

export default router;
