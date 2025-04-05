import { Document, Schema, Types } from "mongoose"

interface IRestaurant extends Document {
    restaurantName:string
    location:string
    cuisine:string[],
    capcity:number
    user:Object,
}



const restaurantSchema = new Schema<IRestaurant>({
    restaurantName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    cuisine: {
        type: [String], // Define cuisine as an array of strings
        required: true
    },
    capcity: {
        type: Number,
        required: true,
    },
    user: {
        type: Types.ObjectId,
        ref:"User"
    }
});

