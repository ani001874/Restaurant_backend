import { HydratedDocument, Types } from "mongoose";
import { Book, IBooking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import { CustomRequest } from "../types/user";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../model/user.model";

// Book a resturant
const bookARestaurant = asyncHandler(async (req: CustomRequest, res) => {
  const { restaurantID } = req.params;

  const {
    numberOfGuest,
    duration,
    bookedAt,
  }: { numberOfGuest: number; duration: number; bookedAt: string } = req.body;

  if (new Date(bookedAt).getTime() < Date.now()) {
    throw new ApiError("This time is gone0", 400);
  }

  // Delete that particulatr booking which dispacting time is over
  // find total number of booking in that restaurant
  // get the restaurant capacity value
  //if anyone want to book at reserved time slot then cancel the reservation
  // if total guest exceeds the capacity limit then check for time slot

  const totalBooking: HydratedDocument<IBooking>[] = await Book.find({
    restaurant: restaurantID,
  }).populate("user");

  // find  capacity of restaurants

  const restaurant = await Restaurant.findById(restaurantID, {
    capcity: 1,
    booking: 1,
  }).populate("booking");

  if (!restaurant) {
    throw new ApiError("Restaurant not found", 404);
  }

  const { capcity }: { capcity: number | null } = restaurant;

  // Delete that particulatr booking which dispacting time is over

  for (let bookingDel of totalBooking) {
    const now = Date.now();
    const dispatchMs = bookingDel.dispatchTime.getTime();

    if (dispatchMs <= now) {
      await Restaurant.findByIdAndUpdate(restaurantID, {
        $pull: { booking: bookingDel._id },
      });
      await bookingDel.deleteOne();
    }
  }

  // find total number of booking in that restaurant
  const numberofGuestAtAnyTime = totalBooking.reduce((accu, bookingObj) => {
    let x = accu + bookingObj.numberOfGuest;
    return x;
  }, 0);

  // check for duplicate user who have booked alreday the given time slot

  //if anyone want to book at reserved time slot then cancel the reservation

  for (let booking of totalBooking) {
    if (
      new Date(booking.bookedAt).getTime() <= new Date(bookedAt).getTime() &&
      new Date(bookedAt).getTime() < new Date(booking.dispatchTime).getTime()
    ) {
      if (booking.user._id.toString() === req.user._id.toString()) {
        throw new ApiError("You have alreday reserved in this time slot", 503);
      }
    }
  }

  let totalGuestAtGivenTimeSlot = 0;

  if (numberofGuestAtAnyTime >= capcity) {
    for (let booking of totalBooking) {
      if (
        new Date(booking.bookedAt).getTime() <= new Date(bookedAt).getTime() &&
        new Date(bookedAt).getTime() < new Date(booking.dispatchTime).getTime()
      ) {
        totalGuestAtGivenTimeSlot += booking.numberOfGuest;
      }
    }
  }

  if (totalGuestAtGivenTimeSlot + numberOfGuest > capcity) {
    throw new ApiError(
      "The time slot is reserved already. You can't reserved in this time slot . please chosse another time slot",
      503
    );
  }

  // calculate dispacth time

  const dispatchTime = new Date(bookedAt).getTime() + duration * 60 * 60 * 1000;

  const newBooking = await Book.create({
    restaurant: restaurant._id,
    user: req.user?._id,
    bookedAt: bookedAt,
    numberOfGuest,
    duration,
    dispatchTime: new Date(dispatchTime),
  });

  //  Push booking _id to restaurant's booking array
  (restaurant.booking as Types.ObjectId[]).push(
    new Types.ObjectId(newBooking._id)
  );
  await restaurant.save();
 
  // restaurants are alloted to req.user
  const user = await User.findById(req.user._id);
 
  if (!user) {
    throw new ApiError("No such user found", 404);
  }

 const isUserVisit = user.restaurants.some((id) => id.toString() === new Types.ObjectId(restaurantID).toString())
 console.log(isUserVisit)
 if(!isUserVisit) {
   user.restaurants.push(new Types.ObjectId(restaurantID))
   await user.save({validateBeforeSave:false})
 }
  res
    .status(200)
    .json(
      new ApiResponse<HydratedDocument<IBooking>>(
        "Restaurant is booked successfully",
        newBooking
      )
    );
});

// Cancel the reservation

const cancelTheReservation = asyncHandler(async (req: CustomRequest, res) => {
  const { restaurantID, bookedAt } = req.params;
  console.log(req.user._id);

  const bookedRestaurants = await Book.findOneAndDelete({
    restaurant: restaurantID,
    user: req.user._id,
    bookedAt,
  });
  if (!bookedRestaurants) {
    throw new ApiError("No matching booking found to cancel", 404);
  }

  await Restaurant.findByIdAndUpdate(restaurantID, {
    $pull: { booking: bookedRestaurants._id },
  });

  res
    .status(200)
    .json(new ApiResponse<null>("Your reseravation cancel suceecfully", null));
});

export { bookARestaurant, cancelTheReservation };
