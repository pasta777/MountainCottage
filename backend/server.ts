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
import Cottage from './src/models/cottage.model';
import Reservation from './src/models/reservation.model';
import Review from './src/models/review.model';

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

const cottageUpload = multer({dest: 'uploads/cottages/'});

app.get('/api/test', (req: Request, res: Response) => {
    res.json({message: 'Pozzz'});
});

app.get('/api/admin/registration-requests', async (_req: Request, res: Response) => {
    const requests = await User.find({status: 'awaiting_approval'});
    res.status(200).json(requests);
});

app.get('/api/admin/users', checkAuth, async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const users = await User.find({userType: {$ne: 'administrator'}});
        res.json(users);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.get('/api/admin/cottages', checkAuth, async (req: any, res: Response) => {
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
});

app.get('/api/users/profile', checkAuth, async (req: any, res: Response) => {
    const user = await User.findById(req.userData.id).select('-password');
    if(!user) {
        return res.status(404).json({message: "User not found."});
    }
    res.status(200).json(user);
});

app.get('/api/cottages/my-cottages', checkAuth, async (req: any, res: Response) => {
    const cottages = await Cottage.find({ownerId: req.userData.id});
    res.status(200).json(cottages);
});

app.get('/api/cottages/:id', async (req: Request, res: Response) => {
    try {
        const cottage = await Cottage.findById(req.params.id);
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }
        res.status(200).json(cottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.get('/api/cottages', async (req: Request, res: Response) => {
    try {
        const { name, location, sortBy, sortOrder } = req.query;

        const filter: any = {};
        if(name) {
            filter.name = {$regex: name, $options: 'i'};
        }
        if(location) {
            filter.location = {$regex: location, $options: 'i'};
        }

        const sort: any = {};
        if(sortBy && (sortBy === 'name' || sortBy === 'location')) {
            sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort['name'] = 1;
        }

        const cottages = await Cottage.find(filter).sort(sort);
        res.json(cottages);
    } catch(error) {
        res.status(500).json({message: "Gathering cottages error."});
    }
});

app.get('/api/stats/general', async (req: Request, res: Response) => {
    try {
        const allCottages = await Cottage.countDocuments();
        const allOwners = await User.countDocuments({userType: 'owner', status: 'active'});
        const allTourists = await User.countDocuments({userType: 'tourist', status: 'active'});

        const now = new Date();
        const before24h = new Date(now.getDate() - 24 * 60 * 60 * 1000);
        const before7d = new Date(now.getDate() - 7 * 24 * 60 * 60 * 1000);
        const before30d = new Date(now.getDate() - 30 * 24 * 60 * 60 * 1000);

        const reservations24h = await Reservation.countDocuments({createdAt: {$gte: before24h}});
        const reservations7d = await Reservation.countDocuments({createdAt: {$gte: before7d}});
        const reservations30d = await Reservation.countDocuments({createdAt: {$gte: before30d}});

        res.json({
            allCottages,
            allOwners,
            allTourists,
            reservations24h,
            reservations7d,
            reservations30d
        });
    } catch(error) {
        res.status(500).json({message: "Gathering statistics error."});
    }
});

app.get('/api/reviews/cottage/:cottageId', async (req, res) => {
    try {
        const reviews = await Review.find({cottageId: req.params.cottageId}).populate('touristId', 'name surname').sort({date: -1});
        res.status(200).json(reviews);
    } catch(error) {
        res.status(500).json({message: "Gathering reviews error."});
    }
});

app.get('/api/reservations/owner', checkAuth, async (req: any, res: Response) => {
    try {
        const myCottages = await Cottage.find({ownerId: req.userData.id}).select('_.id');
        const idsCottages = myCottages.map(c => c._id);

        const reservations = await Reservation.find({cottageId: {$in: idsCottages}})
            .populate('cottageId', 'name')
            .populate('touristId', 'name surname')
            .sort({createdAt: -1});
        res.json(reservations);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.get('/api/reservations/my', checkAuth, async (req: any, res: Response) => {
    try {
        if(req.userData.userType !== 'tourist') {
            return res.status(403).json({message: "Access denied. Only tourists can access this page."});
        }

        const reservations = await Reservation.find({touristId: req.userData.id})
            .populate('cottageId', 'name location')
            .sort({startDate: -1});

        res.json(reservations);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.get('/api/stats/owner', checkAuth, async (req: any, res: Response) => {
    try {
        const myCottages = await Cottage.find({ownerId: req.userData.id}).select('_id name');
        const idsCottages = myCottages.map(c => c._id);

        const reservationsByMonth = await Reservation.aggregate([
            {$match: {cottageId: {$in: idsCottages}, status: 'approved'}},
            {
                $group: {
                    _id: {
                        cottageId: "$cottageId",
                        year: {$year: "$startDate"},
                        month: {$month: "$startDate"}
                    },
                    numOfReservations: {$sum: 1}
                }
            },
            {
                $lookup: {
                    from: "cottages",
                    localField: "_id.cottageId",
                    foreignField: "_id",
                    as: "cottageInfo"
                }
            },
            {$unwind: "$cottageInfo"},
            {
                $project: {
                    _id: 0,
                    cottageName: "$cottageInfo.name",
                    year: "$_id.year",
                    month: "$_id.month",
                    numOfReservations: "$numOfReservations"
                }
            }
        ]);

        const weekendWorkingDay = await Reservation.aggregate([
            {$match: {cottageId: {$in: idsCottages}, status: 'approved'}},
            {
                $project: {
                    cottageId: "$cottageId",
                    dayInWeek: {$dayOfWeek: "$startDate"},
                }
            },
            {
                $group: {
                    _id: {
                        cottageId: "$cottageId",
                        dayType: {
                            $cond: {if: {$in: ["$dayInWeek", [1, 7]]}, then: "Weekend", else: "Working Day"}
                        }
                    },
                    number: {$sum: 1}
                }
            },
            {
                $group: {
                    _id: "$_id.cottageId",
                    data: {$push: {type: "$_id.dayType", number: "$number"}}
                }
            },
            {
                $lookup: {
                    from: "cottages",
                    localField: "_id",
                    foreignField: "_id",
                    as: "cottageInfo"
                }
            },
            {$unwind: "$cottageInfo"},
            {
                $project: {
                    _id: 0,
                    cottageName: "$cottageInfo.name",
                    data: "$data"
                }
            }
        ]);

        res.json({
            reservationsByMonth: reservationsByMonth,
            weekendWorkingDay: weekendWorkingDay
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Server error."});
    }
});

app.put('/api/admin/users/:id', checkAuth, async (req: any, res: Response) => {
    if(req.userData.userType !== 'administrator') {
        return res.status(403).json({message: "The access is allowed only for admins."});
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(updatedUser);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.put('/api/users/profile', checkAuth, async (req: any, res: Response) => {
    const updatedUser = await User.findByIdAndUpdate(req.userData.id, req.body, {new: true});
    res.status(200).json(updatedUser);
});

app.put('api/cottages/:id', checkAuth, cottageUpload.array('pictures', 10), async (req: any, res: Response) => {
    try {
        const cottage = await Cottage.findById(req.params.id);
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }

        if(cottage.ownerId.toString() !== req.userData.id) {
            return res.status(403).json({message: "Permission denied."});
        }

        const data = req.body;

        const updatedCottage = await Cottage.findByIdAndUpdate(req.params.id, data, {new: true});
        res.status(200).json(updatedCottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/admin/users/:id/toggle-status', checkAuth, async (req: any, res: Response) => {
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
});

app.post('/api/admin/cottages/:id/block', checkAuth, async (req: any, res: Response) => {
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
});

app.post('/api/reservations/:id/cancel', checkAuth, async (req: any, res: Response) => {
    try {
        const reservation = await Reservation.findOne({_id: req.params.id, touristId: req.userData.id});

        if(!reservation) {
            return res.status(404).json({message: "Reservation not found."});
        }

        const today = new Date();
        const dayBeforeStart = new Date(reservation.startDate.getTime() - (24 * 60 * 60 * 1000));

        if(today > dayBeforeStart) {
            return res.status(400).json({message: "Cancelation is not allowed 24h before start of the reservation."});
        }

        reservation.status = 'canceled';
        await reservation.save();

        res.json({message: "Reservation canceled successfully."});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/cottages', checkAuth, cottageUpload.array('pictures', 10), async (req: any, res: Response) => {
    try {
        const data = req.body;
        const picturesFiles = req.files as Express.Multer.File[];

        const picturesPaths = picturesFiles.map(file => file.path);

        const newCottage = new Cottage({
            ...data,
            pictures: picturesPaths,
            ownerId: req.userData.id
        });

        await newCottage.save();
        res.status(201).json(newCottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/auth/change-password', checkAuth, async (req: any, res: Response) => {
    const {oldPassword, newPassword} = req.body;
    
    const passwordRegex = /^(?=.*[A-Z])(?=(?:.*[a-z]){3})(?=.*\d)(?=.*[\W_]).{6,10}$/;

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

app.post('/api/reservations', checkAuth, async (req: any, res: Response) => {

    if(req.userData.userType !== 'tourist') {
        return res.status(403).json({message: "Only tourists are authorized for this action."});
    }

    const data = req.body;

    const overlappingReservations = await Reservation.find({
        cottageId: data.cottageId,
        status: {$in: ['approved', 'unresolved']},
        $or: [
            {startDate: {$lt: data.endDate}, endDate: {$gt: data.startDate}}
        ]
    });

    if(overlappingReservations.length > 0) {
        return res.status(400).json({message: "The cottage is not available for selected period."})
    }

    const newReservation = new Reservation({
        ...data,
        touristId: req.userData.id,
        status: 'unresolved'
    });

    await newReservation.save();
    res.status(201).json(newReservation);
});

app.post('/api/reviews', checkAuth, async (req: any, res: Response) => {
    try {
        const {cottageId, rating, comment, reservationId} = req.body;

        const touristId = req.userData.id;

        const newReview = new Review({
            cottageId,
            touristId,
            rating,
            comment
        });

        await newReview.save();

        if(reservationId) {
            await Reservation.findByIdAndUpdate(reservationId, {isReviewed: true});
        }

        const allReviews = await Review.find({cottageId: cottageId});
        const average = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Cottage.findByIdAndUpdate(cottageId, {averageRating: average});

        res.status(201).json(newReview);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/reservations/:id/approve', checkAuth, async (req: any, res: Response) => {
    try {
        if(req.userData.userType !== 'owner') {
            return res.status(401).json({message: "Only owner can approve a reservation."});
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, {status: 'approved'}, {new: true});
        if(!updatedReservation) {
            return res.status(404).json({message: "Reservation not found."});
        }
        res.json(updatedReservation);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.post('/api/reservations/:id/deny', checkAuth, async (req: any, res: Response) => {
    try {
        const {denyComment} = req.body;
        if(!denyComment) {
            return res.status(400).json({message: "The comment is required for denying the reservation."});   
        }

        if(req.userData.userType !== 'owner') {
            return res.status(401).json({message: "Only owner can approve a reservation."});
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, {status: 'denied', denyComment: denyComment}, {new: true});
        if(!updatedReservation) {
            return res.status(404).json({message: "Reservation not found."});
        }
        res.json(updatedReservation);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.delete('/api/admin/users/:id', checkAuth, async (req: any, res: Response) => {
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
});

app.delete('/api/cottages/:id', checkAuth, async (req: any, res: Response) => {
    try {
        const cottage = await Cottage.findOne({_id: req.params.id, ownerId: req.userData.id});
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found or you are not its owner"});
        }

        const picturesForDeleting = cottage.pictures;

        await cottage.deleteOne();

        if(picturesForDeleting && picturesForDeleting.length > 0) {
            picturesForDeleting.forEach(relativePath => {
                const fullPath = path.join(__dirname, '..', relativePath);
                fs.unlink(fullPath, (err) => {
                    if(err) {
                        console.error(`Error while deleting file ${fullPath}`, err);
                    }
                });
            });
        }

        res.status(200).json({message: "Cottage has been successfully removed."});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
});

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});