import { Request, Response } from "express";
import Review from '../models/review.model';
import Cottage from '../models/cottage.model';
import Reservation from '../models/reservation.model';

export const getReviewsForCottage = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find({cottageId: req.params.cottageId}).populate('touristId', 'name surname').sort({date: -1});
        res.status(200).json(reviews);
    } catch(error) {
        res.status(500).json({message: "Gathering reviews error."});
    }
};

export const createReview = async (req: any, res: Response) => {
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
};

