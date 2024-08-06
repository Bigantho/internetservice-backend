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
import { sendMailt } from '../services/sendMail.mjs'
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
      merchantAuthenticationType.setName(process.env.LOGIN_ID_XFINITY);
      merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY_XFINITY);

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
              // console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());

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
              const trxId = response.getTransactionResponse().getTransId()
              const clientName = ([r.billing.first_name, r.billing.last_name]).join(' ')
              const clientEmail = r.billing.email
              const amount = r.invoice.amount
              const emailSend = await mainController.sendMail(trxId, clientName, clientEmail, amount, "Xfinity")
              res.status(200).json({ message: "Pago procesado", mailSend: emailSend })

            } else {
              if (response.getTransactionResponse().getErrors() != null) {
                // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                // console.log(response.getTransactionResponse().getErrors());
                let errMsg = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                let errCode = response.getTransactionResponse().getErrors().getError()[0].getErrorCode()
                logger.error(errMsg)
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
              logger.error(errMsg)

              res.status(500).json({ mainError: errMsg, errorCode: errCode })

            }
          }
        } else {
          // console.log('Null Response.');
          logger.error("contacte soporte tecnico")
          res.status(500).json({ mainError: "Contacte con el soporte técnico" })
        }
      });

    } catch (error) {
      console.log(error);
      logger.error(error)

      return res.status(500).json({ messageClient: "Contacte con el soporte técnico", mainError: error })

    }
  }

  static async sendMail(trxId, clientName, clientEmail, amount, flagCompany) {
    const to = `${clientEmail}`
    const subject = "Payment confirmation"
    const text = ""
    const bcc = "sales@fortified.one"

    let imgUrl = ""
    let phrase = ""
    if (flagCompany == "Xfinity") {
        imgUrl = "https://bussinternet.us/assets/internet_services_logo_new.png"
        phrase = "Internet Service"
    } else if(flagCompany == "Wireless") {
        imgUrl = "https://mobilesupport.services/assets/Wireless-Mobile_logo.png"
        phrase = "Mobile Service"
    }
    const html= `
    <!doctypehtml><html xmlns=http://www.w3.org/1999/xhtml><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport><body bgcolor=#ffffff class=body style=margin:0!important;padding:0!important;word-wrap:normal;word-spacing:normal><div role=article><table style=border:0><tr style=border:0><td align=center style=font-size:0;padding:0;background-color:#fff;border:0 valign=top><table style=width:600px;border:0 cellpadding=0 cellspacing=0 role=presentation><tr style=border:0><td align=center style=border:0 valign=middle><img class=img-logo height=150 src=${imgUrl} width=270></table><tr style=border:0><td align=center style=padding:0;border:0><p style=color:#777>Hello, <strong style=color:#000!important>${clientName}</strong>!<tr style=border:0><td align=center style="padding:0 35px 20px 15px;border:0"><table style=width:600px;border:0 cellpadding=0 cellspacing=0 role=presentation border=0 class=w100p><tr style=border:0><td align=center style=padding:20px;border:0><h2 style=font-size:25px;font-weight:400;line-height:36px;color:#000;margin:0>Thank you for your payment!<br>We are glad to notify you that we have successfully received your payment of <strong>$${amount}</strong> for:<tr style=border:0><td align=center style="padding:20px 0;border:0"><tr style=border:0><td align=center style=padding:20px;border:0><button class=button-40 role=button style="background-color:#111827;border:1px solid transparent;border-radius:.75rem;box-sizing:border-box;color:#fff;cursor:pointer;flex:0 0 auto;font-family:'Inter var',ui-sans-serif,system-ui,-apple-system,system-ui,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';font-size:1.125rem;font-weight:600;line-height:1.5rem;padding:.75rem 1.2rem;text-align:center;text-decoration:none #6b7280 solid;text-decoration-thickness:auto;transition-duration:.2s;transition-property:background-color,border-color,color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);user-select:none;-webkit-user-select:none;touch-action:manipulation;width:auto">Support and Asistance Service</button><tr style=border:0><td align=center style=padding:20px;border:0 valign=top class=footer><p style=font-size:15px;line-height:24px;mso-line-height-rule:exactly>Thank you for choose us!<p style=font-size:10px;line-height:10px;mso-line-height-rule:exactly;margin-bottom:5px>By accepting this payment, you authorize the specified amount described to be charged to your credit card. This authorization confirms your agreement to the transaction and acceptance of the terms associated with this payment. Our company provides assistance and support services to ensure the proper hiring and installation of ${phrase}; however, we are not responsible for the final service delivered by each contracted company.</table><tr style=border:0><td align=center style=background-color:#eee;border:0 valign=top class=footer><p style=padding:15px;font-size:10px;line-height:24px;mso-line-height-rule:exactly>©2024 ${phrase}. All the rights reserved!<br><span>Transaction ID: ${trxId}</span></tr></table></div>
    `
   
    try {
      const ret = await sendMailt(to,bcc , subject, text, html)
      return 'Correo enviado'
    } catch (error) {
      console.log(error);
      // return res.status(500).json({message: 'Fallo'})
      return "Correo fallo"
    }
  }

  static async processPaymentWireless(req, res){
    try {
      const r = req.body

      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(process.env.LOGIN_ID_WIRELESS);
      merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY_WIRELESS);

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
              // console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());

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
              const trxId = response.getTransactionResponse().getTransId()
              const clientName = ([r.billing.first_name, r.billing.last_name]).join(' ')
              const clientEmail = r.billing.email
              const amount = r.invoice.amount
              const emailSend = await mainController.sendMail(trxId, clientName, clientEmail, amount, "Wireless")
              res.status(200).json({ message: "Pago procesado", mailSend: emailSend })

            } else {
              if (response.getTransactionResponse().getErrors() != null) {
                // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                // console.log(response.getTransactionResponse().getErrors());
                let errMsg = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                let errCode = response.getTransactionResponse().getErrors().getError()[0].getErrorCode()
                logger.error(errMsg)
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
              logger.error(errMsg)

              res.status(500).json({ mainError: errMsg, errorCode: errCode })

            }
          }
        } else {
          // console.log('Null Response.');
          logger.error("contacte soporte tecnico")
          res.status(500).json({ mainError: "Contacte con el soporte técnico" })
        }
      });

    } catch (error) {
      console.log(error);
      logger.error(error)

      return res.status(500).json({ messageClient: "Contacte con el soporte técnico", mainError: error })

    }
  }
}

