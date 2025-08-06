import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
    userData?: {id: string, userType: string};
}

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({message: "Authentication failed: No token provided."});
        }

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY as string);
        req.userData = {id: (decodedToken as any).id, userType: (decodedToken as any).userType};

        next();
    } catch(error) {
        return res.status(401).json({message: "Authentication failed: Invalid token."});
    }
}