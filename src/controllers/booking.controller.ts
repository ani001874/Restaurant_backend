import { HydratedDocument, Types } from "mongoose";
import { Book, IBooking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import { CustomRequest } from "../types/user";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../model/user.model";
import generateReservationEmail from "../utils/email";
import { sendReservationSucessfullEmail } from "../utils/mailtrap";

const createReservationEmail = (
  bookedAt: string,
  name: string,
  restaurantName: string,
  guests: number
) => {
  const bookingDate = new Date(bookedAt).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const bookingTime = new Date(bookedAt).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return generateReservationEmail({
    name, // Fixed typo from 'usernaem' to 'username'
    restaurantName,
    bookingDate,
    bookingTime,
    guests,
  });
};

// Book a resturant
const bookARestaurant = asyncHandler(async (req: CustomRequest, res) => {
  const { restaurantID } = req.params;

  const {
    numberOfGuest,
    duration,
    bookedAt,
  }: { numberOfGuest: number; duration: number; bookedAt: string } = req.body;

  // if user try to book before the current time then throw an error
  if (new Date(bookedAt).getTime() < Date.now()) {
    throw new ApiError("This time is gone", 400);
  }

  // find the how many booking is done

  const totalBooking: HydratedDocument<IBooking>[] = await Book.find({
    restaurant: restaurantID,
  }).populate("user");

  // find  capacity of restaurants

  const restaurant = await Restaurant.findById(restaurantID, {
    restaurantName: 1,
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

  // check number of Guest at  given time slot , if number of guest is greater than capcity then throw an error otherwise proceed the booking
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

  const confimationEmail = createReservationEmail(
    bookedAt,
    req.user.username,
    restaurant.restaurantName,
    numberOfGuest
  )


  await sendReservationSucessfullEmail("ironmantoni131@gmail.com",confimationEmail)

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

  const isUserVisit = user.restaurants.some(
    (id) => id.toString() === new Types.ObjectId(restaurantID).toString()
  );
  console.log(isUserVisit);
  if (!isUserVisit) {
    user.restaurants.push(new Types.ObjectId(restaurantID));
    await user.save({ validateBeforeSave: false });
  }


  


  //send a Response
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
