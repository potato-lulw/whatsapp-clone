import { verifyJWT } from '../utils/jwt.js';
import User from '../models/user.js';


export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // console.log("token:",token)
        if (token) {
            
            const decode = verifyJWT(token);
            if(decode === null){
                return res.status(401).json({ message: 'Unauthorized - This is a protected route' });
            }
            const user = await User.findById(decode.id).select('isAdmin email name');
            req.user = {
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                id: decode.id,
            }
            // console.log("requser:",req.user)
            next();
        } else {
            res.status(401).json({ message: 'Unauthorized - This is a protected route' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized - This is a protected route' });
    }
}