import express, { Express, Request, Response } from "express";
import cors from 'cors';
import mongoose from "mongoose";
import path from "path";

import authRoutes from './src/routers/auth.routes';
import userRoutes from './src/routers/user.routes';
import adminRoutes from './src/routers/admin.routes';
import cottageRoutes from './src/routers/cottage.routes';
import reservationRoutes from './src/routers/reservation.routes';
import reviewRoutes from './src/routers/review.routes';
import statsRoutes from './src/routers/stats.routes';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port: number = 3000;

const mongoURI = 'mongodb://localhost:27017/mountain_cottage';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB.'))
    .catch(err => console.error('MongoDB connection failed: ', err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads/';
//         if(!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath);
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cottages', cottageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});