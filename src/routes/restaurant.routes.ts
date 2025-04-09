import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getAllRestaurants, openRestaurant } from "../controllers/restaurant.controller";


const router = Router()

router.route("/open").post(verifyJWT,openRestaurant)
router.route("/all").get(getAllRestaurants)

export default router


