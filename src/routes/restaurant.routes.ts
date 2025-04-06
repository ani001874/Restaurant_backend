import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { openRestaurant } from "../controllers/restaurant.controller";


const router = Router()

router.route("/open").post(verifyJWT,openRestaurant)

export default router


