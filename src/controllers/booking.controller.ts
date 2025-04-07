import { HydratedDocument } from "mongoose";
import { Book, IBooking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import { CustomRequest } from "../types/user";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// Book a resturant
const bookARestaurant = asyncHandler(async (req: CustomRequest, res) => {
  const { restaurantID } = req.params;
  const user = req.user;

  //check for user
  if (!user) {
    throw new ApiError("User is not found", 404);
  }

  const {
    numberOfGuest,
    duration,
    bookedAt,
  }: { numberOfGuest: number; duration: number; bookedAt: string } = req.body;

  // find total number of booking and total guest at that restaurant  at requested time
  // check duplicate user reserved at same time if yes cancel the reservation otherwise do proceed
  // check number of  reservation at that time always less than capcity - TotalGuestThat tiem

  const TotalBookingAtGivenTime: HydratedDocument<IBooking>[] = await Book.find(
    { restaurant: restaurantID, bookedAt }
  ).populate("user");

  const isDuplicateUser: boolean = TotalBookingAtGivenTime.some((booking) => {
    return (
      (booking.user as { _id: string })._id.toString() ===
      req.user._id.toString()
    );
  });

  if (isDuplicateUser) {
    throw new ApiError(
      "You have alreday reserved. You couldn't reserve again . if you want you can update the reservation",
      503
    );
  }

  const numberofGuestAtThatTime = TotalBookingAtGivenTime.reduce(
    (accu, bookingObj) => {
      let x = accu + bookingObj.numberOfGuest;
      return x;
    },
    0
  );

  const restaurant = await Restaurant.findById(restaurantID, {
    _id: 0,
    capcity: 1,
  });

  if (!restaurant) {
    throw new ApiError("Restaurant not found", 404);
  }

  const { capcity }: { capcity: number | null } = restaurant;

  const vacentSeat = capcity - numberofGuestAtThatTime;

  if (vacentSeat < numberOfGuest) {
    throw new ApiError(
      `we are sorry for now . we have ${vacentSeat} seats for now`,
      503
    );
  }

  const newBook = new Book({
    restaurant: restaurantID,
    bookedAt,
    duration,
    user: req.user._id,
    numberOfGuest,
  });

  await newBook.save();

  res
    .status(200)
    .json(
      new ApiResponse<HydratedDocument<IBooking>>(
        "Restaurant is booked successfully",
        newBook
      )
    );
});

export { bookARestaurant };
