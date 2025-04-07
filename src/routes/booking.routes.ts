import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { bookARestaurant } from "../controllers/booking.controller"





const router = Router()

router.route("/book/:restaurantID").post(verifyJWT,bookARestaurant)

export default router