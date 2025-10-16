import { Request, Response } from 'express'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { passwordRegex } from '../utils/constants';

export const register = async (req: Request, res: Response) => {
    try {
        const {
            password, username, email, ...otherData
        } = req.body;

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
            username,
            email,
            ...otherData,
            password: hashedPassword,
            profilePicture: req.file ? req.file.path : 'uploads/default.png'
        });

        await newUser.save();

        res.status(201).json({message: "Request for registration is successfully sent and is awaiting for approval."});
    } catch(error: any) {
        if(error.code === 11000) {
            return res.status(409).json({message: "Username or email already exist."});
        }
        res.status(500).json({message: "Server error."});
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({
            username: username,
            userType: {$in: ['tourist', 'owner']}
        });

        if(!user) {
            return res.status(401).json({message: "Incorrect credentials."});
        }

        if(user.status !== 'active') {
            return res.status(403).json({message: "The account is awaiting approval from admin or is deactivated."});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(401).json({message: "Incorrect credentials."});
        }

        const token = jwt.sign(
            {id: user._id, username: user.username, userType: user.userType},
            process.env.SECRET_KEY as string,
            {expiresIn: '3h'}
        );

        res.status(200).json({token: token, userType: user.userType});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        const admin = await User.findOne({ username: username, userType: 'administrator' });
        if(!admin) {
            return res.status(404).json({message: "Incorrect credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if(!isPasswordCorrect) {
            return res.status(401).json({message: "Incorrect credentials"});
        }
    
        const token = jwt.sign(
            {id: admin._id, username: admin.username, userType: admin.userType},
            process.env.SECRET_KEY as string,
            {expiresIn: '3h'}
        );
    
        res.status(200).json({token: token});
    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Server error."});
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const {oldPassword, newPassword} = req.body;

        if(oldPassword === newPassword) {
            return res.status(400).json({message: "New password cannot be the same as the old one."});
        }
    
        if(!passwordRegex.test(newPassword)) {
            return res.status(400).json({message: "New password doesn't meet required conditions."});
        }
    
        const user = await User.findById(req.userData.id);
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }
    
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordCorrect) {
            return res.status(401).json({message: "Old password isn't correct"});
        }
    
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
    
        res.status(200).json({message: "The password is changed successfully."});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};