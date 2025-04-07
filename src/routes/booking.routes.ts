import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { bookARestaurant, cancelTheReservation } from "../controllers/booking.controller"





const router = Router()

router.route("/book/:restaurantID").post(verifyJWT,bookARestaurant)
router.route("/cancel/:restaurantID/:bookedAt").delete(verifyJWT,cancelTheReservation)

export default router