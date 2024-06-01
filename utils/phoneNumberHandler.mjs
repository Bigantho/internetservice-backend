// import {validationResult, Result} from "express-validator";
import Clients from "../models/Clients.mjs";
import {constants} from "node:http2";
import logger from "./logger.mjs";

const handleRequestPhoneNumber = function () {
  return async (req, res, next) => {
    const phoneNumber = req.body.billing.phone_number
    const amountToCharge = req.body.invoice.amount 
    try {
        const existClientWithNumber = await Clients.findOne({where: {
            phone_number: phoneNumber
        }})
        if ((existClientWithNumber == null || existClientWithNumber == "") &&  (amountToCharge != "0.01" || amountToCharge != 0.01 )) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                mainError:  'Ese numero de télefono no existe. Realiza el cobro de $0.01 primero.',
              });
        }
     next()
    } catch (error) {
        logger.error(error)   
    }
  };
};

export default handleRequestPhoneNumber;