import mongoose, { Schema } from "mongoose";

const reservationSchema = new mongoose.Schema({
    touristId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    cottageId: {type: Schema.Types.ObjectId, ref: 'Cottage', required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    status: {type: String, required: true},
    denyComment: {type: String},
    isReviewed: {type: Boolean, default: false}
}, {
    timestamps: true
});

export default mongoose.model('Reservation', reservationSchema, 'reservations');