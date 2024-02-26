import  Sequelize from 'sequelize';
let  dbConfig = {
    connections: {
      mysql: {
        motor: 'mysql', // mysql, mariadb, sqlite, postgres
        options: {
          db_host: 'localhost',
          db_port: '3306',
          db_name: process.env.DB_NAME,
          db_username: process.env.DB_USERNAME,
          db_password: process.env_DB_PASSWORD,
        },
      },
    },
    default: 'mysql',
  };

export default  class DB {
  static connection(connection = null) {
    const predefinida = dbConfig.default;
    let config = {};
    if (connection) config = dbConfig.connections[connection];
    else config = dbConfig.connections[predefinida];

    return new Sequelize(config.options.db_name, config.options.db_username, config.options.db_password, {
      host: config.options.db_host,
      port: config.options.db_port,
      dialect: config.motor,
      logging: false,
    });
  }

  static async testing(connection = null) {
    try {
      await this.connection(connection).authenticate();
      return true;
    } catch (e) {
      return false;
    }
  }
}
