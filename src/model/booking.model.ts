import { model, Schema, Types } from "mongoose";
import { IRestaurant } from "./restaurant.model";
import { IUser } from "./user.model";
import { ref } from "process";

interface IBooking {
  restaurant: IRestaurant;
  user: IUser;
  bookedAt: Date;
  numberOfGuest: number;
  bookedTime: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    bookedAt: {
      type: Date,
      required: true,
    },
    numberOfGuest: {
      type: Number,
      required: true,
    },
    bookedTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);


export const Book = model("Book",bookingSchema)
