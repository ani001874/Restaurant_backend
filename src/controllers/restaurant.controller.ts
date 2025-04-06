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

  res.status(201).json(
    new ApiResponse<HydratedDocument<IRestaurant>>(
      "Restaurant created successfully",
      restaurant
    )
  );
});

export { openRestaurant };
