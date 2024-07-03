'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';

// module.exports = (sequelize, DataTypes) => {
class CreditCards extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}
CreditCards.init({
  id_client: DataTypes.STRING,
  created_by: DataTypes.INTEGER,
  number: DataTypes.STRING,
  exp_date: DataTypes.INTEGER,
  cvc: DataTypes.INTEGER,
  brand: {
    type: DataTypes.ENUM,
    values: ['Visa','Master Card', 'American Express'],
  },
  billing_address: DataTypes.STRING, 
  billing_city: DataTypes.STRING,
  billing_state: DataTypes.STRING,
  billing_country: DataTypes.STRING,
  billing_zipcode: DataTypes.STRING,
  status: DataTypes.BOOLEAN,
  id_client: DataTypes.INTEGER
}, {
  sequelize: db.connection(),
  modelName: 'CreditCards',
  tableName: 'credit_cards',
});
// return Agents;
// };

export default CreditCards