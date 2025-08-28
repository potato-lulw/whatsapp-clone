import User from "../models/user.js"
import { createJWT } from "../utils/jwt.js"


export const getUsers = async (req, res) => {
    const users = await User.find()
    if (users.length === 0) {
        res.status(404).json({ message: "No users found" })
    }
    res.status(200).json({ message: "Users found", users })
}

export const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)
    if (!user) {
        res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ message: "User found", user })
}

export const createUser = async (req, res) => {
    const { name, email, password, isAdmin = false } = req.body
    const userExists = await User.findOne({ email })
    if (userExists) {
        return res.status(400).json({ message: "User already exists" })
    }
    const user = await User.create({ name, email, password, isAdmin })
    if (!user) {
        res.status(400).json({ message: "User not created" })
    }
    req.user = user
    const token = createJWT(res, user)

    res.status(201).json({ message: "User created", user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, token })
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        if (!user.matchPassword(password)) {
            return res.status(400).json({ message: "Incorrect password" })
        }
        const token = createJWT(res, user)
        req.user = user
        res.status(200).json({ message: "User logged in", user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, token })
    } catch (error) {
        console.error("❌ Error logging in:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const logoutUser = async (req,res) => {
    try {
        res.clearCookie("token"); 
        req.user = null;
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (e) {
        console.error("❌ Error logging out:", e);
        return res.status(500).json({ message: "Server error", error: e.message });
    }
}