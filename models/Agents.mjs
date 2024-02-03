'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';

// module.exports = (sequelize, DataTypes) => {
class Agents extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}
Agents.init({
  user: DataTypes.STRING,
  password: DataTypes.STRING,
  email: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM,
    values: ['Active','Desactived'],
  }
}, {
  sequelize: db.connection(),
  modelName: 'Agents',
});
// return Agents;
// };

export default Agents