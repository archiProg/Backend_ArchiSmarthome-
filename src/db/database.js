const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelizeConfig = {
  host: process.env.DB_Host || "localhost",
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    port: process.env.DB_Port ? Number(process.env.DB_Port) : 3306,
  },
};

if (process.env.DB_Type === "mssql") {
  sequelizeConfig.dialect = "mssql";
  sequelizeConfig.dialectOptions = {
    options: {
      encrypt: true,
      trustServerCertificate: process.env.DB_TrustServerCert === "true",
    },
  };
}

const sequelize = new Sequelize(
  process.env.DB_Name,
  process.env.DB_User,
  process.env.DB_Pass,
  sequelizeConfig
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

module.exports = { sequelize, connectDB };
