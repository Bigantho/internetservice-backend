import { Router } from "express";
import { createFormValidator } from "../models/Payments.mjs"
import handleRequestWithValidation from "../utils/routeHandler.mjs"
import mainController from "../controllers/mainController.mjs"
import handleRequestPhoneNumber from "../utils/phoneNumberHandler.mjs";
const router = Router();

router.post('/login', mainController.login);
router.post('/payment', createFormValidator, handleRequestPhoneNumber(),  handleRequestWithValidation(mainController.payment));
router.post('/paymentWithTrial', createFormValidator,  handleRequestPhoneNumber(), handleRequestWithValidation(mainController.paymentWithTrialPeriod));
router.post('/paymentCheck', createFormValidator,handleRequestPhoneNumber(),  handleRequestWithValidation(mainController.paymentQuick))


router.get('/subscriptions/list/inactive', handleRequestWithValidation(mainController.getSubcriptionsInactive))
router.get('/subscriptions/list/active', handleRequestWithValidation(mainController.getSubcriptionsActive))
router.get('/subscriptions/info/:id_subscription', handleRequestWithValidation(mainController.getSubcriptionDetail))
router.get('/user/:id_user/payments/', mainController.getPaymentsByUser)
router.get('/payment/total', handleRequestWithValidation(mainController.getTotalPayments))

export default router;