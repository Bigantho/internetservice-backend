import { Router } from "express";

import mainController from "../controllers/mainController.mjs"
const router = Router();

router.post('/login', mainController.login);



export default router;