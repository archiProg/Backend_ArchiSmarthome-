const { Sequelize } = require("sequelize");
const { sequelize } = require("./database");

async function queryAsync(_sql) {
  try {
    const res = await sequelize.query(_sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return Promise.resolve({ response: res });
  } catch (error) {
    console.error("Error executing query:", error);
    return Promise.reject({ error });
  }
}

async function querysAsync(_sql, _param) {
  try {
    const res = await sequelize.query(_sql, {
      replacements: _param,
      type: Sequelize.QueryTypes.SELECT,
    });
    return Promise.resolve({ response: res });
  } catch (error) {
    console.error("Error executing query with params:", error);
    return Promise.reject({ error });
  }
}

async function excuteAsync(_sql) {
  try {
    const res = await sequelize.query(_sql);
    return Promise.resolve({ response: res });
  } catch (error) {
    console.error("Error executing query:", error);
    return Promise.reject({ error });
  }
}

async function excutesAsync(_sql, _param) {
  try {
    const [results, metadata] = await sequelize.query(_sql, {
      replacements: _param,
    });
    return Promise.resolve({ response: results, metadata: metadata });
  } catch (error) {
    console.error("Error executing query with params:", error);
    return Promise.reject({ error });
  }
}

module.exports = { queryAsync, querysAsync, excuteAsync, excutesAsync };
