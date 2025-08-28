import express from "express";
import {createUser, getUserById, getUsers, loginUser, logoutUser} from "../controllers/userController.js";


const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/login", loginUser);
router.post("/register", createUser);
router.post("/logout", logoutUser)




export default router



// POST   /api/v1/users/register      → Register user
// POST   /api/v1/users/login         → Login
// GET    /api/v1/users/:id           → Get user by ID
// GET    /api/v1/users               → Get all users (for search, friends list)
// TODO PATCH  /api/v1/users/:id           → Update user profile
// TODO DELETE /api/v1/users/:id           → Soft-delete user