import { Router } from "express";
import { createFormValidator } from "../models/Payments.mjs"
import handleRequestWithValidation from "../utils/routeHandler.mjs"
import mainController from "../controllers/mainController.mjs"
const router = Router();

router.post('/login', mainController.login);
router.post('/payment', createFormValidator, handleRequestWithValidation(mainController.payment))
router.post('/paymentWithTrial', createFormValidator, handleRequestWithValidation(mainController.paymentWithTrialPeriod))
router.get('/user/:id_user/payments/', mainController.getPaymentsByUser)


export default router;