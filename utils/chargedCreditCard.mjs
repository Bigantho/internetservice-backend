'use strict';

// import { APIContracts, APIControllers, Constants as SDKConstants } from 'authorizenet';
import pkg from 'authorizenet';
const { APIContracts, APIControllers, Constants: SDKConstants } = pkg;


const card =  function chargeCreditCard(r, callback) {
 
  const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

  const creditCard = new APIContracts.CreditCardType();
  creditCard.setCardNumber(r.card.number);
  creditCard.setExpirationDate(r.card.expiration);
  creditCard.setCardCode(r.card.cvc);

  const paymentType = new APIContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  // const orderDetails = new APIContracts.OrderType();
  // orderDetails.setInvoiceNumber('INV-12345');
  // orderDetails.setDescription('Product Description');

  // const tax = new APIContracts.ExtendedAmountType();
  // tax.setAmount('4.26');
  // tax.setName('level2 tax name');
  // tax.setDescription('level2 tax');

  // const duty = new APIContracts.ExtendedAmountType();
  // duty.setAmount('8.55');
  // duty.setName('duty name');
  // duty.setDescription('duty description');

  // const shipping = new APIContracts.ExtendedAmountType();
  // shipping.setAmount('8.55');
  // shipping.setName('shipping name');
  // shipping.setDescription('shipping description');

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

  // const lineItem_id1 = new APIContracts.LineItemType();
  // lineItem_id1.setItemId('1');
  // lineItem_id1.setName('vase');
  // lineItem_id1.setDescription('cannes logo');
  // lineItem_id1.setQuantity('18');
  // lineItem_id1.setUnitPrice(45.00);

  // const lineItem_id2 = new APIContracts.LineItemType();
  // lineItem_id2.setItemId('2');
  // lineItem_id2.setName('vase2');
  // lineItem_id2.setDescription('cannes logo2');
  // lineItem_id2.setQuantity('28');
  // lineItem_id2.setUnitPrice('25.00');

  // const lineItemList = [lineItem_id1, lineItem_id2];

  // const lineItems = new APIContracts.ArrayOfLineItem();
  // lineItems.setLineItem(lineItemList);

  // const userField_a = new APIContracts.UserField();
  // userField_a.setName('A');
  // userField_a.setValue('Aval');

  // const userField_b = new APIContracts.UserField();
  // userField_b.setName('B');
  // userField_b.setValue('Bval');

  // const userFieldList = [userField_a, userField_b];

  // const userFields = new APIContracts.TransactionRequestType.UserFields();
  // userFields.setUserField(userFieldList);

  // const transactionSetting1 = new APIContracts.SettingType();
  // transactionSetting1.setSettingName('duplicateWindow');
  // transactionSetting1.setSettingValue('120');

  // const transactionSetting2 = new APIContracts.SettingType();
  // transactionSetting2.setSettingName('recurringBilling');
  // transactionSetting2.setSettingValue('false');

  // const transactionSettingList = [transactionSetting1, transactionSetting2];

  // const transactionSettings = new APIContracts.ArrayOfSetting();
  // transactionSettings.setSetting(transactionSettingList);

  const transactionRequestType = new APIContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount('0.01');
  // transactionRequestType.setLineItems(lineItems);
  // transactionRequestType.setUserFields(userFields);
  // transactionRequestType.setOrder(orderDetails);
  // transactionRequestType.setTax(tax);
  // transactionRequestType.setDuty(duty);
  // transactionRequestType.setShipping(shipping);
  transactionRequestType.setBillTo(billTo);
  transactionRequestType.setShipTo(shipTo);
  // transactionRequestType.setTransactionSettings(transactionSettings);

  const createRequest = new APIContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  // pretty print request
  console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
  // Defaults to sandbox
  ctrl.setEnvironment(SDKConstants.endpoint.production);
  ctrl.execute(function () {
    const apiResponse = ctrl.getResponse();

    const response = new APIContracts.CreateTransactionResponse(apiResponse);

    // pretty print response
    console.log(JSON.stringify(response, null, 2));

    // if (response != null) {
    //   if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
    //     if (response.getTransactionResponse().getMessages() != null) {
    //       console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
    //       console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
    //       console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
    //       console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
    //     } else {
    //       console.log('Failed Transaction.');
    //       if (response.getTransactionResponse().getErrors() != null) {
    //         console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
    //         console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
    //       }
    //     }
    //   } else {
    //     console.log('Failed Transaction. ');
    //     if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

    //       console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
    //       console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
    //     } else {
    //       console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
    //       console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
    //       responseQuery = response.getMessages().getMessage()[0].getText()
    //     }
    //   }
    // } else {
    //   console.log('Null Response.');
    // }
    callback(response);

  });  
}



// if (import.meta.main) {
//   chargeCreditCard(function () {
//     console.log('chargeCreditCard call complete.');
//   });
// }

export default card
