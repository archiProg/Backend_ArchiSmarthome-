const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { querysAsync, excutesAsync } = require("../db/sqlasync"); // adjust the path if needed
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const path = require("path");
dayjs.extend(utc);

const sendEmail = async (req, res) => {
  const { Email, Subject, Message } = req.body;
  let ResetToken = `${Email}-${crypto.randomUUID()}`;
  // configure your mail transporter
  const transporter = nodemailer.createTransport({
    host: "mail.architronic-th.com", // ⚙️ replace with your SMTP host
    port: 587, // SSL port
    secure: false, // true for 465, false for 587
    auth: {
      user: "dev@architronic-th.com", // your email login
      pass: "Archi_123456", // your email password or app password
    },
  });

  // email content

  try {
    const now = dayjs.utc();

    const sql = "SELECT * FROM member WHERE Email = :email";
    const { response: checkEmailRes } = await querysAsync(sql, {
      email: Email,
    });

    if (checkEmailRes.length === 0) {
      return res.status(401).json({
        status: 401,
        message: `Email '${Email}' not found`,
      });
    }

    const sql2 = "SELECT * FROM memberresetpassword WHERE Email = :email";
    const { response: checkEmailRes2 } = await querysAsync(sql2, {
      email: Email,
    });

    if (checkEmailRes2.length === 0) {
      const LastTimeReset = now;
      const ExpireAt = now.add(10, "minute").format("YYYY-MM-DD HH:mm:ss.SSS");
      const ResetTotal = 1;
      const sql3 =
        "INSERT INTO memberresetpassword (Email, ResetToken, Expires_in, ResetTotal, LastTimeReset, LastUpdate) VALUES (:email, :resetToken, :expireAt, :resetTotal, :lastTimeReset, CURRENT_TIMESTAMP)";
      const { responseSql3 } = await excutesAsync(sql3, {
        email: Email,
        resetToken: ResetToken,
        expireAt: ExpireAt,
        resetTotal: ResetTotal,
        lastTimeReset: LastTimeReset.format("YYYY-MM-DD HH:mm:ss.SSS"),
      });
      if (responseSql3.affectedRows > 0) {
        // console.log("Insert successful");
        // Send email
        const info = await transporter.sendMail(mailOptions);
        // console.log("Email sent:", info.messageId);

        return res.json({
          status: 1,
          message: `Reset password email sent to ${Email}`,
        });
      } else {
        // console.log("Insert failed or no rows affected");
        return res.json({
          status: 401,
          message: "Insert failed or no data changed",
        });
      }
    } else {
      ResetToken = checkEmailRes2[0].ResetToken;
      const lastUpdateTime = dayjs(
        checkEmailRes2[0].LastUpdate,
        "YYYY-MM-DD HH:mm:ss.SSS"
      );
      const expireTime = dayjs(
        checkEmailRes2[0].Expires_in,
        "YYYY-MM-DD HH:mm:ss.SSS"
      );

      const diffMinutesLastUpdate = now.diff(lastUpdateTime, "minute");
      const diffMinutesExpireTime = now.diff(expireTime, "minute");
      // console.log(diffMinutesLastUpdate);

      if (diffMinutesLastUpdate >= 1) {
        //1 min
        const LastTimeReset = now;
        const ExpireAt = now
          .add(10, "minute")
          .format("YYYY-MM-DD HH:mm:ss.SSS");

        const ResetTotal = checkEmailRes2[0].ResetTotal;
        let sql3 = "";
        let cmd;

        if (diffMinutesExpireTime >= 0) {
          sql3 =
            "UPDATE  memberresetpassword  SET ResetToken= :resetToken, Expires_in=:expireAt, ResetTotal=:resetTotal, LastTimeReset=:lastTimeReset, LastUpdate=CURRENT_TIMESTAMP   WHERE Email = :email";
          cmd = {
            resetToken: ResetToken,
            expireAt: ExpireAt,
            resetTotal: ResetTotal + 1,
            lastTimeReset: LastTimeReset.format("YYYY-MM-DD HH:mm:ss.SSS"),
            email: Email,
          };
        } else {
          sql3 =
            "UPDATE  memberresetpassword  SET   ResetTotal=:resetTotal, LastTimeReset=:lastTimeReset, LastUpdate=CURRENT_TIMESTAMP   WHERE Email = :email";
          cmd = {
            resetTotal: ResetTotal + 1,
            lastTimeReset: LastTimeReset.format("YYYY-MM-DD HH:mm:ss.SSS"),
            email: Email,
          };
        }
        const responseSql3 = await excutesAsync(sql3, cmd);
        if (responseSql3.metadata.affectedRows > 0) {
          // console.log("Insert successful");
        } else {
          return res.json({
            status: 401,
            message: `Insert data fail`,
          });
        }
      } else {
        return res.json({
          status: 401,
          message: `Plaese wait a moment`,
        });
      }
    }

    const mailOptions = {
      from: '"Archi SmartHome" <dev@architronic-th.com>',
      to: Email || "dev.architronic@gmail.com",
      subject: Subject || "Reset Your Password",
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to create a new one:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="https://archismartsolution.com/app/checktokennewpassword?token=${ResetToken}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p><strong>Note:</strong> This link will expire in <strong>10 minutes</strong> for your security.</p>
      <p>If you didn’t request a password reset, please ignore this email.</p>
      <p>Thank you,<br><strong>Archi SmartHome</strong></p>
    </div>
  `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.messageId);
    return res.json({
      status: 1,
      message: `Reset password email sent to ${Email}`,
    });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({
      status: 500,
      message: `Email send failed: ${err.message}`,
    });
  }
};

const checkTokenNewPassword = async (req, res) => {
  const token = req.query.token;
  // console.log("Reset token from URL:", token);

  try {
    const now = dayjs.utc();
    const sql =
      "SELECT * FROM memberresetpassword WHERE ResetToken = :resetToken";
    const { response: checkEmailRes } = await querysAsync(sql, {
      resetToken: token,
    });

    if (checkEmailRes.length === 0) {
      // console.log(0);
      return res.sendFile(path.join(__dirname, "../public/notoken.html"));
    }

    const expireTime = dayjs(
      checkEmailRes[0].Expires_in,
      "YYYY-MM-DD HH:mm:ss.SSS"
    );

    const diffMinutes = now.diff(expireTime, "minute");

    if (diffMinutes >= 0) {
      return res.sendFile(path.join(__dirname, "../public/notoken.html"));
    } else {
      // console.log(2);
      res.sendFile(path.join(__dirname, "../public/newpassword.html"));
    }
  } catch (err) {
    // console.log(3);
    return res.sendFile(path.join(__dirname, "../public/notoken.html"));
  }
};

const setNewPassword = async (req, res) => {
  const { token, password } = req.body;
  // console.log("Reset token from URL:", token);

  try {
    const sql =
      "SELECT * FROM memberresetpassword WHERE ResetToken = :resetToken";
    const { response: checkEmailRes } = await querysAsync(sql, {
      resetToken: token,
    });

    // console.log(checkEmailRes);

    if (checkEmailRes.length === 0) {
      return res.status(401).json({
        status: 0,
        error: "Failed to get time",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql2 = "UPDATE  member  SET  Password=:password   WHERE Email = :email";
    const { response: checkEmailRes2 } = await excutesAsync(sql2, {
      password: hashedPassword,
      email: checkEmailRes[0].Email,
    });

    
    // console.log(hashedPassword);
    
    return res.status(200).json({
      status: 1,
      error: "Failed to get time",
    });
  } catch (err) {
    res.status(500).json({
      status: 0,
      error: "Failed to get time",
    });
  }
};

module.exports = { sendEmail, checkTokenNewPassword, setNewPassword };
