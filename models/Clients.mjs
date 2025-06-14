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
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    zipcode: DataTypes.INTEGER,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING, 
    status: DataTypes.BOOLEAN
}, {
    sequelize: db.connection(),
    modelName: 'Clients',
    tableName: 'clients',
});
// return Agents;
// };

export default Clients