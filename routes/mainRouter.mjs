import { Router } from "express";
import {createFormValidator} from "../models/Payments.mjs"
import handleRequestWithValidation from "../utils/routeHandler.mjs"
import mainController from "../controllers/mainController.mjs"
const router = Router();

router.post('/login', mainController.login);
router.post('/payment',createFormValidator,  handleRequestWithValidation(mainController.payment))


export default router;