'use strict';

import { Model, DataTypes } from "sequelize";
import db from '../config/db.mjs';

// module.exports = (sequelize, DataTypes) => {
class Clients extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // define association here
    }
}
Clients.init({
    name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING
}, {
    sequelize: db.connection(),
    modelName: 'Clients',
});
// return Agents;
// };

export default Clients