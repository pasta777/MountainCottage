import { Request, Response } from "express";
import User from '../models/user.model';
import Cottage from '../models/cottage.model';
import Reservation from '../models/reservation.model';
import Review from '../models/review.model';
import path from "path";
import fs from "fs";
import bcrypt from 'bcrypt'

export const getUsers = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const users = await User.find({userType: {$ne: 'administrator'}, status: {$ne: 'waiting_for_approval'}});
        res.json(users);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const getUserById = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }
        res.json(user);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const getRegistrationRequests = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const requests = await User.find({status: 'waiting_for_approval'});
        res.status(200).json(requests);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const getCottages = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const allCottages = await Cottage.find().populate('ownerId', 'name surname');
        const cottagesWithStatus = [];

        for(const cottage of allCottages) {
            const lastReviews = await Review.find({cottageId: cottage._id}).sort({date: -1}).limit(3);

            let haveToColor = false;
            if(lastReviews.length === 3) {
                const allLessThan2 = lastReviews.every(rating => rating.rating < 2);
                if(allLessThan2) {
                    haveToColor = true;
                }
            }

            cottagesWithStatus.push({...cottage.toObject(), haveToColor});
        }

        res.json(cottagesWithStatus);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const createUser = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const { username, email, password, ...otherData } = req.body;

        const existingUser = await User.findOne({username: username});
        if(existingUser) {
            return res.status(409).json({message: "Username already exists."});
        }

        const existingEmail = await User.findOne({email: email});
        if(existingEmail) {
            return res.status(409).json({message: "Email already exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            ...otherData,
            username,
            email,
            password: hashedPassword,
            profilePicture: 'uploads/default.png',
            status: 'active'
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const updateUser = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const { username, email } = req.body;
        const userId = req.params.id;

        const existingUser = await User.findOne({username: username, _id: {$ne: userId}});
        if(existingUser) {
            return res.status(409).json({message: "Username already exists."});
        }

        const existingEmail = await User.findOne({email: email, _id: {$ne: userId}});
        if(existingEmail) {
            return res.status(409).json({message: "Email already exists."});
        }
        
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(updatedUser);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const toggleStatus = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }
        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();
        res.json({message: `User status changed to '${user.status}'`});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const blockCottage = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const today = new Date();
        const blockedUntil = new Date(today.getTime() + 48 * 60 * 60 * 1000); // blocked for 48 hours

        const cottage = await Cottage.findByIdAndUpdate(req.params.id, {blockedUntil: blockedUntil}, {new: true});

        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }
        res.json({message: `Cottage "${cottage.name}" is blocked until ${blockedUntil.toLocaleString()}`});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const approveRequest = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, {status: 'active'}, {new: true});
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }

        res.status(200).json({message: "The user is approved"});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const rejectRequest = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, {status: 'rejected'}, {new: true});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
    
        res.status(200).json({message: "The user is rejected"});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const deleteUser = async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const userId = req.params.id;
        const userToDelete = await User.findById(userId);

        if(!userToDelete) {
            return res.status(404).json({message: "User not found."});
        }

        if(userToDelete.userType === 'owner') {
            const cottages = await Cottage.find({ownerId: userId});
            for(const cottage of cottages) {
                if(cottage.pictures && cottage.pictures.length > 0) {
                    cottage.pictures.forEach(relativePath => {
                        const fullPath = path.join(__dirname, '..', relativePath);
                        fs.unlink(fullPath, err => {
                            if(err) console.error(`Error while deleting file ${fullPath}: `, err);
                        });
                    })
                }
                await Reservation.deleteMany({cottageId: cottage._id});
                await Review.deleteMany({cottageId: cottage._id});
            }

            await Cottage.deleteMany({ownerId: userId});
        }

        if(userToDelete.userType === 'tourist') {
            await Reservation.deleteMany({touristId: userId});
            await Review.deleteMany({touristId: userId});
        }

        await User.findByIdAndDelete(userId);

        res.json({message: "The user is deleted successfully."});
    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Server error."});
    }
};