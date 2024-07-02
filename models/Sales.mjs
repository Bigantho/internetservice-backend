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
    // Payments.belongsTo(Users, {foreignKey: 'id_user'})
  }
}
Payments.init({
  id_sale: DataTypes.INTEGER,
  id_credit_card: DataTypes.INTEGER,
  charged_by: DataTypes.INTEGER,
  amount: DataTypes.FLOAT,
  status: DataTypes.STRING
}, {
  sequelize: db.connection(),
  modelName: 'Payments',
  tableName:'payments',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
// return Agents;
// };

// const requiredFields = [
//   'invoice.amount',
//   'invoice.description',
//   'invoice.number',
//   'billing.first_name',
//   'billing.last_name',
//   'billing.company',
//   'billing.address',
//   'billing.city',
//   'billing.state',
//   'billing.zip_code',
//   'billing.country',
//   'billing.phone_number',
//   'billing.email',
//   'shipping.first_name',
//   'shipping.last_name',
//   'shipping.company',
//   'shipping.address',
//   'shipping.city',
//   'shipping.state',
//   'shipping.zip_code',
//   'shipping.country',
//   'user_id']

// const fieldNumber = [
//   'billing.zip_code',
//   'shipping.zip_code',
//   'card.number',
//   'card.cvc',
//   'card.expiration'
// ]

// export const createFormValidator = [
//   check(requiredFields)
//     .notEmpty().withMessage("El campo es requerido."),
  
//   check('billing.email')
//     .isEmail().withMessage("El formato del correo no es el correcto."),
  
//   check(fieldNumber)
//     .isNumeric().withMessage("El tipo de dato debe ser numerico"),

//   check('invoice.amount')
//     .isNumeric().withMessage("El tipo de dato debe ser numerico")
//     .isFloat({min:0.00, max: 800.00}).withMessage("El monto de cobro debe estar entre $0.00 y $800.00"),

//   check('card.number')
//     .isLength({min: 16, max:16}).withMessage("El número de tarjeta debe ser de  16 dígitos"),
  
//   check('card.expiration')
//     .isLength({min:4, max:4}).withMessage("La fecha de expiración debe ser en formato MMYY"),
  
//   check('card.cvc')
//     .isLength({min:3, max: 3}).withMessage("El código de seguridad debe ser de 3 dígitos")

// ]
 export const createFormValidator = []
export default Payments