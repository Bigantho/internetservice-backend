import Users from '../models/Users.mjs'
import CreditCards from '../models/CreditCards.mjs';
import Payments from '../models/Payments.mjs';
import Clients from '../models/Clients.mjs'
// import { chargeCreditCard } from '../utils/chargedCreditCard.cjs'
// const AuthorizeNet = require('authorize-net');
import card from '../utils/chargedCreditCard.mjs'
import { Op } from 'sequelize'
import pkg from 'authorizenet';
const { APIContracts, APIControllers, Constants: SDKConstants } = pkg;
export default class mainController {

  static async login(req, res) {
    const { user, password } = req.body
    // console.log(user, password)
    try {
      const agentData = await Users.findOne({
        where: {
           email: user ,
          password
        }
      })

      if (!agentData) {
        return res.status(500).json({message:"Credenciales invalidas"})
      }
      res.status(200).json({ message: "Credenciales correctas.", user:agentData })
    } catch (error) {
      res.status(500).json(error)
    }
  }

  static async payment(req, res) {
    try {
      const r = req.body
      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(process.env.LOGIN_ID);
      merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(r.card.number);
      creditCard.setExpirationDate(r.card.expiration);
      creditCard.setCardCode(r.card.cvc);

      const paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

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
      transactionRequestType.setBillTo(billTo);
      transactionRequestType.setShipTo(shipTo);

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
              const trxID = response.getTransactionResponse().getTransId()
              const resClient = await saveClient(req.body.billing)
              const resCard = await saveCard(req.body.card, resClient.id)
              const resPayment = await savePayment(req.body, resCard.id, trxID, req.body.user_id)
              res.status(200).json({
                message: response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
                client: resClient,
                card: resCard,
                payment: resPayment
              })
              // res.status(200).json(JSON.stringify(response, null, 2))
            } else {
              // console.log('Failed Transaction.');
              if (response.getTransactionResponse().getErrors() != null) {
                // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                res.status(500).json({ message: response.getTransactionResponse().getErrors().getError()[0].getErrorText() })

              }
            }
          } else {
            // console.log('Failed Transaction. ');
            if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

              // console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
              // console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
              res.status(500).json({ message: response.getTransactionResponse().getErrors().getError()[0].getErrorText() })

            } else {
              // console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
              // console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
              res.status(500).json({ message: response.getMessages().getMessage()[0].getText() })
            }
          }
        } else {
          // console.log('Null Response.');
          res.status(500).json({ message: "Contacte con el soporte técnico" })
        }
      });

    } catch (error) {
      return res.status(500).json({ message: "Contacte con el soporte técnico", mainError: error })

    }

    async function saveCard(cardObject, clientID) {
      try {
        const currentCard = await checkCardExist(cardObject)
        if (currentCard == null) {
          const cardSaved = await CreditCards.create({
            number: cardObject.number,
            exp_date: cardObject.expiration,
            cvc: cardObject.cvc,
            brand: cardObject.brand,
            id_client: clientID,
          })
          return cardSaved
        } else {
          return currentCard
        }
       
      } catch (error) {
        console.log(error);
        return "Error al guardar tarjeta";
      }
    }

    async function savePayment(paymentObject, cardID, trxID, userID) {
      try {
        const paymentSaved = await Payments.create({

          id_user: userID,
          id_credit_card: cardID,
  
          transaction_id: trxID,
          invoice: paymentObject.invoice.number,
          description: paymentObject.invoice.description,
          amount:  paymentObject.invoice.amount,

          billing_first_name: paymentObject.billing.first_name,
          billing_last_name: paymentObject.billing.last_name,
          billing_company: paymentObject.billing.company,
          billing_address: paymentObject.billing.address,
          billing_city: paymentObject.billing.city,
          billing_state_providence: paymentObject.billing.state,
          billing_zip_code: paymentObject.billing.zip_code,
          billing_country: paymentObject.billing.country,
          billing_phone: paymentObject.billing.phone_number,
          billing_fax: paymentObject.billing.fax,
          billing_email: paymentObject.billing.email,
  
          shipping_first_name: paymentObject.shipping.first_name,
          shipping_last_name: paymentObject.shipping.last_name,
          shipping_company: paymentObject.shipping.company,
          shipping_address: paymentObject.shipping.address,
          shipping_city: paymentObject.shipping.city,
          shipping_state_providence: paymentObject.shipping.state,
          shipping_zip_code: paymentObject.shipping.zip_code,
          shipping_country: paymentObject.shipping.country,
        })
        return paymentSaved
      } catch (error) {
        console.log(error);
        return "Error al guardar el pago";
      }
    }

    async function saveClient(clientObject){
      try {

        const currentClient = await checkClientExist(clientObject);
        if (flagClient == null) {
          const clientSaved = await Clients.create({
            name: clientObject.first_name, 
            last_name: clientObject.last_name, 
            email: clientObject.email,
            phone_number: clientObject.phone_number
          })
          return clientSaved
        }else{
          return currentClient
        }
        
      } catch (error) {
        console.log(error);
        return "Error al guardar el cliente."
      }
    }

    async function checkClientExist(clientObject){
      const existClient = await Clients.findOne ({
        where: {
          name: clientObject.first_name, 
          last_name: clientObject.last_name, 
          // email: clientObject.email,
          phone_number: clientObject.phone_number
        }
      })
      return existClient
    }

    async function checkCardExist(cardObject){
      const existClient = await CreditCards.findOne ({
        where: {
          number: cardObject.number,
          exp_date: cardObject.expiration,
          cvc: cardObject.cvc,
        }
      })
      return existClient
    }
  }


  static async paymentTest(req,res){
    const paymentObject = req.body
    const cardID = 2
    const trxID = 252525252525
    try {
      const paymentSaved = await Payments.create({

        id_user: 1,
        id_credit_card: cardID,

        transaction_id: trxID,
        invoice: paymentObject.invoice.number,
        description: paymentObject.invoice.description,
        amount:  paymentObject.invoice.amount,

        billing_first_name: paymentObject.billing.first_name,
        billing_last_name: paymentObject.billing.last_name,
        billing_company: paymentObject.billing.company,
        billing_address: paymentObject.billing.address,
        billing_city: paymentObject.billing.city,
        billing_state_providence: paymentObject.billing.state,
        billing_zip_code: paymentObject.billing.zip_code,
        billing_country: paymentObject.billing.country,
        billing_phone: paymentObject.billing.phone_number,
        billing_fax: paymentObject.billing.fax,
        billing_email: paymentObject.billing.email,

        shipping_first_name: paymentObject.shipping.first_name,
        shipping_last_name: paymentObject.shipping.last_name,
        shipping_company: paymentObject.shipping.company,
        shipping_address: paymentObject.shipping.address,
        shipping_city: paymentObject.shipping.city,
        shipping_state_providence: paymentObject.shipping.state,
        shipping_zip_code: paymentObject.shipping.zip_code,
        shipping_country: paymentObject.shipping.country,
      })
      res.status(200).json( paymentSaved)
    } catch (error) {
      res.status(500).json( error)
    }
  }
}
