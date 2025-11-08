// src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const morgan = require("morgan") 

const { connectDB } = require("./db/database");
const authRoutes = require("./routes/authRoutes");
const v3sRoutes = require("./routes/v3sRoutes");
const v3Routes = require("./routes/v3Routes");
const Routes = require("./routes/Routes");
const RoutesHtml = require("./routes/RoutesHtml");
// const userRoutes = require("./routes/userRoutes");
// const { errorHandler } = require("./middleware/errorHandler");
 
const app = express();
 
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

connectDB();


 
app.use("/app/auth", authRoutes);
app.use("/app", Routes);
app.use("/app/v3s", v3sRoutes);
app.use("/app/v3", v3Routes);
app.use("/", RoutesHtml)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
