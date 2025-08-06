import { Request, Response } from "express";
import Reservation from '../models/reservation.model';
import Cottage from '../models/cottage.model';

export const getMyReservations = async (req: any, res: Response) => {
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
};

export const getOwnerReservations = async (req: any, res: Response) => {
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
};

export const createReservation = async (req: any, res: Response) => {
    try {
        if(req.userData.userType !== 'tourist') {
            return res.status(403).json({message: "Only tourists are authorized for this action."});
        }
    
        const data = req.body;

        const startDateWithTime = new Date(data.startDate);
        startDateWithTime.setHours(14, 0, 0, 0);

        const endDateWithTime = new Date(data.endDate);
        endDateWithTime.setHours(10, 0, 0, 0);

        if(startDateWithTime >= endDateWithTime) {
            return res.status(400).json({message: "End date must be after start date."});
        }
    
        const overlappingReservations = await Reservation.find({
            cottageId: data.cottageId,
            status: {$in: ['approved', 'unresolved']},
            startDate: {$lt: endDateWithTime},
            endDate: {$gt: endDateWithTime}
        });
    
        if(overlappingReservations.length > 0) {
            return res.status(400).json({message: "The cottage is not available for selected period."})
        }
    
        const newReservation = new Reservation({
            ...data,
            touristId: req.userData.id,
            startDate: startDateWithTime,
            endDate: endDateWithTime,
            status: 'unresolved'
        });
    
        await newReservation.save();
        res.status(201).json(newReservation);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const approveReservation = async (req: any, res: Response) => {
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
};

export const denyReservation = async (req: any, res: Response) => {
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
};

export const cancelReservation = async (req: any, res: Response) => {
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
};