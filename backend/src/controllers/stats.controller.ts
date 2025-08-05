import { Request, Response } from "express";
import User from '../models/user.model';
import Cottage from '../models/cottage.model';
import Reservation from '../models/reservation.model';

export const getGeneralStats = async (req: Request, res: Response) => {
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
};

export const getOwnerStats = async (req: any, res: Response) => {
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
};