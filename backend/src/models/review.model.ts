import mongoose, { Schema } from 'mongoose';

const reviewSchema = new mongoose.Schema({
    touristId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    cottageId: {type: Schema.Types.ObjectId, ref: 'Cottage', required: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    comment: {type: String},
    date: {type: Date, default: Date.now}
});

export default mongoose.model('Review', reviewSchema, 'reviews');