import { Router } from "express";
import { createFormValidator } from "../models/Payments.mjs"
import handleRequestWithValidation from "../utils/routeHandler.mjs"
import mainController from "../controllers/mainController.mjs"
const router = Router();

router.post('/login', mainController.login);
router.post('/payment', createFormValidator, handleRequestWithValidation(mainController.payment))
router.post('/paymentWithTrial', createFormValidator, handleRequestWithValidation(mainController.paymentWithTrialPeriod))

router.post('/paymentCheck', createFormValidator, handleRequestWithValidation(mainController.paymentQuick))
router.get('/subscriptions/list/active', handleRequestWithValidation(mainController.getSubcriptionsActive))
router.get('/subscriptions/list/inactive', handleRequestWithValidation(mainController.getSubcriptionsInactive))
router.get('/user/:id_user/payments/', mainController.getPaymentsByUser)
router.get('/payment/total', handleRequestWithValidation(mainController.getTotalPayment))


export default router;