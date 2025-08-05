import { Request, Response } from "express";
import User from '../models/user.model';
import path from "path";
import fs from 'fs';

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
        const updateData = req.body;
        const user = await User.findById(req.userData.id);

        if(!user) {
            return res.status(404).json({message: "User not found."});
        }

        if(req.file) {
            if(user.profilePicture && user.profilePicture !== 'uploads/default.png') {
                const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
                fs.unlink(oldPicturePath, (err) => {
                    if(err) console.error("Error while deleting old picture:", err);
                });
            }

            updateData.profilePicture = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(req.userData.id, updateData, {new: true}).select('-password');
        res.status(200).json(updatedUser);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
}