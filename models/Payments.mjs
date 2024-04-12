'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';
import { check, param } from "express-validator";
import Users from "./Users.mjs";
// module.exports = (sequelize, DataTypes) => {
class Payments extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
    Payments.belongsTo(Users, {foreignKey: 'id_user'})
  }
}
Payments.init({
  id_credit_card: DataTypes.INTEGER,
  id_user: DataTypes.INTEGER,

  invoice: DataTypes.STRING,
  transaction_id: DataTypes.STRING,
  description: DataTypes.STRING,
  amount: DataTypes.FLOAT,

  billing_customer_id:{
    type:DataTypes.STRING,
    allowNull: true
  },
  billing_first_name :DataTypes.STRING,
  billing_last_name :DataTypes.STRING,
  billing_company :DataTypes.STRING,
  billing_address :DataTypes.STRING,
  billing_city :DataTypes.STRING,
  billing_state_providence :DataTypes.STRING,
  billing_zip_code :DataTypes.INTEGER,
  billing_country :DataTypes.STRING,
  billing_phone :DataTypes.STRING,
  billing_fax :{
    type:DataTypes.STRING,
    allowNull: true
  },
  billing_email :DataTypes.STRING,

  shipping_first_name :DataTypes.STRING,
  shipping_last_name :DataTypes.STRING,
  shipping_company :DataTypes.STRING,
  shipping_address :DataTypes.STRING,
  shipping_city :DataTypes.STRING,
  shipping_state_providence :DataTypes.STRING,
  shipping_zip_code :DataTypes.INTEGER,
  shipping_country :DataTypes.STRING,
  type: DataTypes.STRING,

}, {
  sequelize: db.connection(),
  modelName: 'Payments',
  tableName:'payments'
});
// return Agents;
// };

const requiredFields = [
  'invoice.amount',
  'invoice.description',
  'invoice.number',
  'billing.first_name',
  'billing.last_name',
  'billing.company',
  'billing.address',
  'billing.city',
  'billing.state',
  'billing.zip_code',
  'billing.country',
  'billing.phone_number',
  'billing.email',
  'shipping.first_name',
  'shipping.last_name',
  'shipping.company',
  'shipping.address',
  'shipping.city',
  'shipping.state',
  'shipping.zip_code',
  'shipping.country']

const fieldNumber = [
  'billing.zip_code',
  'shipping.zip_code',
  'card.number',
  'card.cvc',
  'card.expiration'
]

export const createFormValidator = [
  check(requiredFields)
    .notEmpty().withMessage("El campo es requerido."),
  
  check('billing.email')
    .isEmail().withMessage("El formato del correo no es el correcto."),
  
  check(fieldNumber)
    .isNumeric().withMessage("El tipo de dato debe ser numerico"),

  check('invoice.amount')
    .isNumeric().withMessage("El tipo de dato debe ser numerico")
    .isFloat({min:0.00, max: 800.00}).withMessage("El monto de cobro debe estar entre $0.00 y $800.00"),

  check('card.number')
    .isLength({min: 16, max:16}).withMessage("El número de tarjeta debe ser de  16 dígitos"),
  
  check('card.expiration')
    .isLength({min:4, max:4}).withMessage("La fecha de expiración debe ser en formato MMYY"),
  
  check('card.cvc')
    .isLength({min:3, max: 3}).withMessage("El código de seguridad debe ser de 3 dígitos")

]

export default Payments