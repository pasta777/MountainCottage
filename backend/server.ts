import express, { Express, Request, Response } from "express";
import cors from 'cors';
import mongoose from "mongoose";
import User from './src/models/user.model'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from "path";
import fs from 'fs';

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

app.post('/api/auth/register', upload.single('profilePicture'), async (req: Request, res: Response) => {
    try {
        const {
            username, password, name, surname, gender, address, phoneNumber, email, creditCardNumber, userType
        } = req.body;

        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser) {
            return res.status(409).json({message: 'Username or email already exist.'});
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

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});