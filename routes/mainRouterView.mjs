import { Router } from "express";

import mainController from "../controllers/mainController.mjs"
const router = Router();

router.get('/login', async (req,res) => {
    res.render('login')
});

router.get('/api/v1/payment', async (req, res) => {
    res.render('payment')
})


export default router;