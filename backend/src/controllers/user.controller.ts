import { Request, Response } from "express";
import User from '../models/user.model';

export const getUser = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.userData.id).select('-password');
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }
        res.status(200).json(user);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const updateUser = async (req: any, res: Response) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.userData.id, req.body, {new: true});
        res.status(200).json(updatedUser);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
}