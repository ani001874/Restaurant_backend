import { Document, model, Schema, Types } from "mongoose"
import { IUser } from "./user.model";

export interface IRestaurant extends Document {
    restaurantName:string
    location:string
    cuisine:string[],
    capcity:number
    user:IUser,
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
},

{
    timestamps:true
}
);


export  const Restaurant = model<IRestaurant>("Restaurant",restaurantSchema)

