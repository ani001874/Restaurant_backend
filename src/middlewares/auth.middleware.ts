import { JwtPayload, Secret, verify } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../model/user.model";
import ApiError from "../utils/apiError";
import { CookieOptions, NextFunction, Response } from "express";
import { CustomRequest } from "../types/user";

const verifyJWT = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const accessToken: string | undefined = req.cookies.accessToken;
 
   // check for access Token
    if (accessToken) {
 
      const decodeAccessToken = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as Secret
      ) as JwtPayload;
      const user = await User.findById(decodeAccessToken.id);
      req.user = user;
      return next();
    }

    //if access token is not found then check for refreshToken

    const refreshToken: string | undefined = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError("Token is expired! please login", 400);
    }

    const decodeRefreshToken = verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as Secret
    ) as JwtPayload;
    const user = await User.findById(decodeRefreshToken.id);

    if (!user) {
      throw new ApiError("No user found", 404);
    }

    if (refreshToken !== user.refreshToken) {
      throw new ApiError("Unauthorized Access!", 400);
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("accessToken", newAccessToken, {
      ...options,
      maxAge:  60 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...options,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    req.user = user;

    return next();
  }
);

export { verifyJWT };
