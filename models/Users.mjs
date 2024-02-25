'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';

// module.exports = (sequelize, DataTypes) => {
class Users extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
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