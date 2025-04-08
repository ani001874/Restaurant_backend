import { Document, model, Schema, Types } from "mongoose"
import { IUser } from "./user.model";
import { IBooking } from "./booking.model";

export interface IRestaurant extends Document {
    restaurantName:string
    location:string
    cuisine:string[]
    capcity:number
    size:number
    owner:IUser
    booking:Types.ObjectId[] | IBooking[];
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
    size:{
        type:Number,
        default:0
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },

    booking:[{type:Schema.Types.ObjectId, ref:"Book"}]
},

{
    timestamps:true
}
);


export  const Restaurant = model<IRestaurant>("Restaurant",restaurantSchema)

