import express, { Express, Request, Response } from "express";
import cors from 'cors';
import mongoose from "mongoose";
import User from './src/models/user.model'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from "path";
import fs from 'fs';
import jwt from 'jsonwebtoken'
import { checkAuth } from "./src/middleware/auth.middleware";

const mongoURI = 'mongodb://localhost:27017/mountain_cottage';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection failed: ', err));

const app: Express = express();
const port: number = 3000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if(!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

app.get('/api/test', (req: Request, res: Response) => {
    res.json({message: 'Pozzz'});
});

app.get('/api/admin/registration-requests', async (_req: Request, res: Response) => {
    const requests = await User.find({status: 'awaiting_approval'});
    res.status(200).json(requests);
});

app.get('/api/users/profile', checkAuth, async (req: any, res: Response) => {
    const user = await User.findById(req.userData.id).select('-password');
    if(!user) {
        return res.status(404).json({message: "User not found."});
    }
    res.status(200).json(user);
});

app.put('/api/users/profile', checkAuth, async (req: any, res: Response) => {
    const updatedUser = await User.findByIdAndUpdate(req.userData.id, req.body, {new: true});
    res.status(200).json(updatedUser);
});

app.post('/api/auth/change-password', checkAuth, async (req: any, res: Response) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.userData.id);
    if(!user) {
        return res.status(404).json({message: "User not found."});
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if(!isPasswordCorrect) {
        return res.status(401).json({message: "Old password isn't correct"});
    }

    // TODO: Dodati validaciju nove lozinke (regex)

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({message: "The password is changed successfully."});
});

app.post('/api/auth/register', upload.single('profilePicture'), async (req: Request, res: Response) => {
    try {
        const {
            username, password, name, surname, gender, address, phoneNumber, email, creditCardNumber, userType
        } = req.body;

        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser) {
            return res.status(409).json({message: "Username or email already exist."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            name,
            surname,
            password: hashedPassword,
            gender,
            address,
            phoneNumber,
            email,
            creditCardNumber,
            userType,
            profilePicture: req.file ? req.file.path : 'uploads/default.png'
        });

        await newUser.save();

        res.status(201).json({message: "Request for registration is successfully sent and is awaiting for approval."});
    } catch(error) {
        console.error('Registration error: ', error);
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/auth/admin/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const admin = await User.findOne({ username: username, userType: 'administrator' });
    if(!admin) {
        return res.status(401).json({message: "Incorrect credentials"});
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if(!isPasswordCorrect) {
        return res.status(401).json({message: "Incorrect credentials"});
    }

    const token = jwt.sign(
        {id: admin._id, username: admin.username, userType: admin.userType},
        'SUPER_SECRET_KEY',
        {expiresIn: '3h'}
    );

    res.status(200).json({token: token});
});

app.post('/api/admin/approve-request/:userId', async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.userId, {status: 'active'}, {new: true});
    if(!user) {
        return res.status(404).json({message: "User not found."});
    }

    res.status(200).json({message: "The user is approved"});
});

app.post('/api/admin/reject-request/:userId', async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.userId);
    if(!user) {
        return res.status(404).json({message: "User not found"});
    }

    res.status(200).json({message: "The user is rejected"});
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await User.findOne({
        username: username,
        userType: {$in: ['tourist', 'owner']}
    });

    if(!user) {
        return res.status(401).json({message: "Incorrect credentials."});
    }

    if(user.status !== 'active') {
        return res.status(403).json({message: "The account is awaiting approval from admin."});
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
        return res.status(401).json({message: "Incorrect credentials."});
    }

    const token = jwt.sign(
        {id: user._id, username: user.username, userType: user.userType},
        'SUPER_SECRET_KEY',
        {expiresIn: '3h'}
    );

    res.status(200).json({token: token, userType: user.userType});
});

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});