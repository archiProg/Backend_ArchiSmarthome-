const express = require("express");
const router = express.Router();
const { getFloorPlan } = require("../controllers/getFloorPlanController");
const { getStateAccount } = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");

// POST /app/v3s/getFloorPlan
router.post("/GetFloorPlan",authenticate, getFloorPlan);
router.post("/stateaccount",authenticate, getStateAccount);

module.exports = router;