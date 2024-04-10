'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';
import Payments from "./Payments.mjs";

// module.exports = (sequelize, DataTypes) => {
class Users extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    Users.hasMany(Payments, {foreignKey: 'id_user'})
  }
}
Users.init({
  user: DataTypes.STRING,
  password: DataTypes.STRING,
  email: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM,
    values: ['Active','Desactived'],
  }
}, {
  sequelize: db.connection(),
  modelName: 'Users',
  tableName: 'users'
});
// return Agents;
// };

export default Users