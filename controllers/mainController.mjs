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
const { APIContracts, APIControllers, Constants: SDKConstants } = pkg;
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



  static async processPayment(req, res) {
    try {
      const r = req.body

      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(process.env.LOGIN_ID);
      merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

      // **************** EL NUVO CODIGO
      // const customer = new APIContracts.CustomerType();
      // customer.setType(APIContracts.CustomerTypeEnum.INDIVIDUAL);
      // // customer.setId(utils.getRandomString('Id'));
      // customer.setEmail(r.billing.email);
      // customer.setPhoneNumber(r.billing.phone_number);
      // customer.setFaxNumber('1232122122');
      // customer.setTaxId('911011011');
      // / **************** EL NUVO CODIGO

      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(r.card.number);
      creditCard.setExpirationDate(r.card.expiration);
      creditCard.setCardCode(r.card.cvc);

      const paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      var orderDetails = new APIContracts.OrderType();
      orderDetails.setInvoiceNumber(r.invoice.number);
      orderDetails.setDescription(r.invoice.description);

      const billTo = new APIContracts.CustomerAddressType();
      billTo.setFirstName(r.billing.first_name);
      billTo.setLastName(r.billing.last_name);
      billTo.setCompany(r.billing.company);
      billTo.setAddress(r.billing.address);
      billTo.setCity(r.billing.city);
      billTo.setState(r.billing.state);
      billTo.setZip(r.billing.zip_code);
      billTo.setCountry(r.billing.country);

      const shipTo = new APIContracts.CustomerAddressType();
      shipTo.setFirstName(r.shipping.first_name);
      shipTo.setLastName(r.shipping.last_name);
      shipTo.setCompany(r.shipping.company);
      shipTo.setAddress(r.shipping.address);
      shipTo.setCity(r.shipping.city);
      shipTo.setState(r.shipping.state);
      shipTo.setZip(r.shipping.zip_code);
      shipTo.setCountry(r.shipping.country);

      const transactionRequestType = new APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setAmount(r.invoice.amount);
      transactionRequestType.setOrder(orderDetails)
      transactionRequestType.setBillTo(billTo);
      transactionRequestType.setShipTo(shipTo);
      // transactionRequestType.setCustomer(customer)

      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      // pretty print request
      // console.log(JSON.stringify(createRequest.getJSON(), null, 2));

      const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
      // Defaults to sandbox

      ctrl.setEnvironment(SDKConstants.endpoint.production);
      ctrl.execute(async function () {
        const apiResponse = ctrl.getResponse();

        const response = new APIContracts.CreateTransactionResponse(apiResponse);

        // pretty print response
        // console.log(JSON.stringify(response, null, 2));

        if (response != null) {
          if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
            if (response.getTransactionResponse().getMessages() != null) {
              // console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
              // console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
              // console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
              console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
              // const trxID = response.getTransactionResponse().getTransId()
              // const resClient = await mainController.saveClient(req.body.billing)
              // const resCard = await mainController.saveCard(req.body.card, resClient.id)
              // const resPayment = await mainController.savePayment(req.body, resCard.id, trxID, req.body.user_id, "Payment")
              // res.status(200).json({
              //   message: response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
              //   client: resClient,
              //   card: resCard,
              //   payment: resPayment
              // })
              // res.status(200).json(JSON.stringify(response, null, 2))
              res.status(200).json("Pago procesado")

            } else {
              if (response.getTransactionResponse().getErrors() != null) {
                // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                // console.log(response.getTransactionResponse().getErrors());
                let errMsg = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                let errCode = response.getTransactionResponse().getErrors().getError()[0].getErrorCode()
                res.status(500).json({
                  mainError: errMsg,
                  errorCode: errCode
                })

              }
            }
          } else {
            // console.log('Failed Transaction. ');
            if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

              // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
              // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
              // console.log(response.getTransactionResponse());

              let errCode = response.getTransactionResponse().getErrors().getError()[0].getErrorCode()
              let errMsg = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
              res.status(500).json({ mainError: errMsg, errorCode: errCode })

            } else {
              // console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
              // console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
              let errCode = response.getMessages().getMessage()[0].getCode()
              let errMsg = response.getMessages().getMessage()[0].getText()
              res.status(500).json({ mainError: errMsg, errorCode: errCode })

            }
          }
        } else {
          // console.log('Null Response.');
          res.status(500).json({ mainError: "Contacte con el soporte técnico" })
        }
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ messageClient: "Contacte con el soporte técnico", mainError: error })

    }
  }

}
