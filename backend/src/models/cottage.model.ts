import mongoose, {Schema} from "mongoose";

const cottageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: {type: String, required: true},
    services: {type: String, required: true},
    tariff: {
        summer: {type: Number, required: true},
        winter: {type: Number, required: true},
    },
    phoneNumber: {type: String, required: true},
    coordinates: {
        lat: {type: Number, required: true},
        lon: {type: Number, required: true},
    },
    pictures: [{type: String}],
    ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    averageRating: {type: Number, default: 0}
});

export default mongoose.model('Cottage', cottageSchema, 'cottages');