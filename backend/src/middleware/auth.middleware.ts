import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
    userData?: {id: string, userType: string};
}

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"
        if(token) {
            const decodedToken = jwt.verify(token, 'SUPER_SECRET_KEY');
            req.userData = {id: (decodedToken as any).id, userType: (decodedToken as any).userType};
            next();
        } else {
            return res.status(404).json({message: "Token not found."});
        }
    } catch(error) {
        return res.status(401).json({message: "Authentication failed."});
    }
}