import { HydratedDocument } from "mongoose";
import { IRestaurant, Restaurant } from "../model/restaurant.model";
import { CustomRequest } from "../types/user";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

const openRestaurant = asyncHandler(async (req: CustomRequest, res) => {
  const {
    restaurantName,
    location,
    cuisine,
    capcity,
  }: {
    restaurantName: string;
    location: string;
    cuisine: string[];
    capcity: number;
  } = req.body;

  if ([restaurantName, location].some((field: string) => field.trim() === "")) {
    throw new ApiError("All field are required", 404);
  }

  if (cuisine.length === 0) {
    throw new ApiError("At least one cuisine is required", 404);
  }

  if (!capcity) {
    throw new ApiError("capacity is required", 400);
  }

  const restaurant: HydratedDocument<IRestaurant> = new Restaurant({
    restaurantName,
    location,
    cuisine,
    capcity,
    owner: req.user,
  });

  await restaurant.save();

  res
    .status(201)
    .json(
      new ApiResponse<HydratedDocument<IRestaurant>>(
        "Restaurant created successfully",
        restaurant
      )
    );
});

interface RestaurantsDetailsType {
  restaurantName: string,
  location: string,
  capacity: number,
  totalCustomer: number,
  freeSeat: number 
}

const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurantDetails:RestaurantsDetailsType[] = await Restaurant.aggregate([
    {
      $lookup: {
        from: "books",
        localField: "booking",
        foreignField: "_id",
        as: "booking",
      },
    },
    {
      $addFields: {
        activeBooking: {
          $filter: {
            input: "$booking",
            as: "b",
            cond: {
              $and: [
                { $lte: ["$$b.bookedAt", "$$NOW"] },
                { $gte: ["$$b.dispatchTime", "$$NOW"] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        totalCustomer: {
          $reduce: {
            input: "$activeBooking",
            initialValue: 0,
            in: { $add: ["$$value", "$$this.numberOfGuest"] },
          },
        },
      },
    },
    {
      $project: {
        restaurantName: 1,
        location: 1,
        capacity: "$capcity",
        totalCustomer: 1,
        freeSeat: {
          $subtract: ["$capcity", { $ifNull: ["$totalCustomer", 0] }],
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse<RestaurantsDetailsType[]>("all restaurants are shown", restaurantDetails)
    );
});

export { openRestaurant, getAllRestaurants };
