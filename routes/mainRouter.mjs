import { Router } from "express";
import { createFormValidator } from "../models/Payments.mjs"
import handleRequestWithValidation from "../utils/routeHandler.mjs"
import mainController from "../controllers/mainController.mjs"
import handleRequestPhoneNumber from "../utils/phoneNumberHandler.mjs";
const router = Router();

router.get('/payment/total', handleRequestWithValidation(mainController.getTotalPayments))
router.get('/payment/xfinity/total', handleRequestWithValidation(mainController.getTotalXfinityPayment))
router.get('/payment/xfinity/total/batch/:date', handleRequestWithValidation(mainController.getBatchListXfinity))


router.post('/login', mainController.login);
router.post('/payment/save/xfinity',  handleRequestWithValidation(mainController.processPayment));
router.post('/payment/save/wireless', handleRequestWithValidation(mainController.processPaymentWireless))

router.post('/mail/send', mainController.sendMail )

export default router;