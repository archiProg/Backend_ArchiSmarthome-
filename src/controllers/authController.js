const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { querysAsync, excutesAsync } = require("../db/sqlasync"); // adjust the path if needed
require("dotenv").config();
const dayjs = require("dayjs");

const loginUser = async (req, res) => {
  const { Username, Password } = req.body;

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

    const payload = {
      id: user.id,
      username: user.username,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token_type: "Bearer",
      access_token,
      refresh_token,
      expires_in: 3600,
      status: 1,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const loginUserv2 = async (req, res) => {
  const { Username, Password, Action, Platform, Enable, DevicesID, PlayerID } =
    req.body;

    

  try {
    return res.json({
      status: 200,
      message: "",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const loginUserv3 = async (req, res) => {
  const { Username, Password } = req.body;

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

    return res.json({
      status: 1,
      message: "",
      member: {
        State: 1,
      },
      expires_in: 3600,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const registerUser = async (req, res) => {
  const { Username, Password, Name, Email } = req.body;
  console.log(req.body);

  try {
    const sql =
      "SELECT * FROM member WHERE Username = :username OR Email = :email LIMIT 1";
    const { response } = await querysAsync(sql, {
      username: Username,
      email: Email,
    });

    if (response.length > 0) {
      if (response[0].Username === Username) {
        return res.status(401).json({
          status: 401,
          message: `Cannot use "${Username}". Please choose another one.`,
        });
      }

      if (response[0].Email === Email) {
        return res.status(401).json({
          status: 401,
          message: `Cannot use "${Email}". Please choose another one.`,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    const sql2 = `
  INSERT INTO member (Username, MemberName, Email, Password, DeviceType, Created, IsFriendAddUnlimit, HistoryLimit)
  VALUES (:username, :name, :email, :password, 1, :created, 0, 10)
`;
    const response2 = await excutesAsync(sql2, {
      username: Username,
      name: Name,
      email: Email,
      password: hashedPassword,
      created: now,
    });
    // console.log(response2.affectedRows);

    if (response2.affectedRows && response2.affectedRows > 0) {
      console.log("Insert successful!");
      res.json({ status: 1, message: "User registered successfully" });
    } else {
      console.log("Insert failed!");
      res.json({ status: 0, error: "Failed to insert user" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  loginUser,
  loginUserv2,
  loginUserv3,
  registerUser,
};
