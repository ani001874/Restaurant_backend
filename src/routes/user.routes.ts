import { Router } from "express";
import { createAccount, getReservationDetails, getUserDetails, loginAccount, userLogout } from "../controllers/user.controller";
import {  verifyJWT } from "../middlewares/auth.middleware";



const router = Router()

router.route('/createAccount').post(createAccount);
router.route('/login').post(loginAccount)
router.route('/userLogout').post(verifyJWT,userLogout)
router.route('/profile').get(verifyJWT,getUserDetails)
router.route('/reservation-details').get(verifyJWT,getReservationDetails)
export default router