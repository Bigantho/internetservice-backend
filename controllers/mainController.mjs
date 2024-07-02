import Users from '../models/Users.mjs'
import CreditCards from '../models/CreditCards.mjs';
// import Payments from '../models/Payments.mjs';
// import Clients from '../models/Clients.mjs'
import { Payments, Clients } from '../models/index.mjs';
// import { chargeCreditCard } from '../utils/chargedCreditCard.cjs'
// const AuthorizeNet = require('authorize-net');
import card from '../utils/chargedCreditCard.mjs'
import { Op } from 'sequelize'
import pkg from 'authorizenet';
import logger from '../utils/logger.mjs';
const { APIContracts, APIControllers, Constants: SDKConstants} = pkg;
export default class mainController {

  static async login(req, res) {
    const { user, password } = req.body
    // console.log(user, password)
    try {
      const agentData = await Users.findOne({
        where: {
          user: user,
          password, 
          status: '1'
        }
      })

      if (!agentData) {
        logger.error(agentData)
        return res.status(500).json({ message: "Credenciales invalidas o usuario desactivado" })
      }
      return res.status(200).json({ message: "Credenciales correctas." })
    } catch (error) {
      logger.error(error)
      return res.status(500).json(error)
    }
  }


  static async savePayment(req, res) {
    const paymentData = req.body
    try {
        const paymentSaved = await Payments.create({
          id_sale: paymentData.id_sale,
          id_credit_card: paymentData.id_credit_card,
          charged_by: paymentData.charged_by,
          amount: paymentData.amount,
          status: paymentData.status
        })
        res.status(200).json(paymentSaved)
    } catch (error) {
      logger.error(error);
      res.status(400).json({
        messageError: "Error al guardar el cliente."
      })
    }
  }

  static async checkClientExist(clientObject) {
    const existClient = await Clients.findOne({
      where: {
        name: clientObject.first_name,
        last_name: clientObject.last_name,
        email: clientObject.email,
        phone_number: clientObject.phone_number
      }
    })
    return existClient
  }



  static async getPaymentsByUser(req, res) {

    try {
      const paymentsByUser = await Payments.findAll({
        logging: console.log,
        where: {
          id_user: req.params.id_user
        }
      })

      const paymentsByUser2 = await Users.findAll({
        logging: console.log,
        // where: {
        //   id_user: req.params.id_user
        // }
      })

      let paymentsFormatted = []
      paymentsByUser.forEach((x, i) => {
        paymentsFormatted.push({
          id: i + 1,
          trx_id: x.transaction_id,
          client_name: [x.billing_first_name, x.billing_last_name].join(' '),
          amount: x.amount,
          date_created: x.createdAt,
          phone_number: x.billing_phone
        })
      })

      return res.json(paymentsFormatted)
    } catch (error) {
      // console.log(error);
      logger.error(error)
      return res.status(500).json({ mainError: error })
    }


  }



  static async getTotalPayments(req, res) {
    try {
      const totalPayments = await Payments.findAll()

      let paymentsFormatted = []
      // totalPayments.forEach((x, i) => {
      //   paymentsFormatted.push({
      //     id: i + 1,
      //     trx_id: x.transaction_id,
      //     client_name: [x.billing_first_name, x.billing_last_name].join(' '),
      //     amount: x.amount,
      //     date_created: x.createdAt,
      //     phone_number: x.billing_phone,
      //     email_user_charged: x.User.email,
      //     user_name_charged: x.User.user,
      //     type_payment: x.type
      //   })
      // })
      return res.json(totalPayments)
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ mainError: error })
    }
  }

 

}
