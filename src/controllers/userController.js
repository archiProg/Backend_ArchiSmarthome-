const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { querysAsync, queryUpdateAsync, excutesAsync } = require("../db/sqlasync"); // adjust the path if needed
require("dotenv").config();

const getRoleUser = async (req, res) => {
  const { MemberID, HomeID } = req.body;

  try {
    const sql = `
    SELECT * FROM iotserver.friends where MemberID=:memberID AND Friend=:friendId;
  `;
    const { response } = await querysAsync(sql, {
      memberID: MemberID,
      friendId: HomeID,
    });

    if (response.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid MemberID",
      });
    }

    return res.json({
      Status: 1,
      Role: response[0].FRID,
      Message: "Success",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const getStateAccount = async (req, res) => {
  const { Username, Password, State } = req.body;

  try {
    const sql = "SELECT * FROM member WHERE Username = :username";
    const { response } = await querysAsync(sql, { username: Username });

    if (response.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid username or password",
      });
    }

    const user = response[0];

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Invalid username or password",
      });
    }

    const sql2 = "UPDATE member SET State = :state WHERE MemberID= :memberID ";
    const { response2 } = await queryUpdateAsync(sql2, {
      state: State,
      memberID: user.MemberID,
    });

    return res.json({
      Status: 1,
      Error: "",
      Message: "Success",
    });
  } catch (error) {
    console.error("getStateAccount error:", error);
    return res.status(500).json({
      status: 500,
      Error: "getStateAccount error:",
      error,
      message: "Internal server error",
    });
  }
};

const UpdateStatusAccount = async (req, res) => {
  const { Action, Enable, MemberID, DevicesID, PlayerID } = req.body;
  
  try {
    const sql =
      "UPDATE onesignal SET Enable = :enable WHERE MemberID=:memberID AND DevicesID=:devicesID AND PlayerID=:playerID";
    const { response } = await excutesAsync(sql, {
      enable: Enable,
      memberID: MemberID,
      devicesID: DevicesID,
      playerID: PlayerID
    });

    return res.json({
      Status: 200,
      Message: "Success",
    });
  } catch (error) {
    console.error("getStateAccount error:", error);
    return res.status(500).json({
      status: 500,
      Error: "getStateAccount error:",
      error,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getRoleUser,
  getStateAccount,
  UpdateStatusAccount,
};
