import jwt from "jsonwebtoken";

export const createJWT = (res, user) => {
    const token = jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET || "secret123",
        {
            expiresIn: "30d",
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge:  7 * 24 * 60 * 60 * 1000, // 7 day
    });
    return token;
};

export const verifyJWT = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
        return decoded;
    } catch (error) {
        console.log(error)
        return null;
    }
};