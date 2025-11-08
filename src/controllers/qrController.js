const dayjs = require("dayjs");

const getTime = async (req, res) => {
  try {
    const now = dayjs().format("M/D/YYYY h:mm:ss A"); // e.g., 11/6/2025 3:45:20 PM
    res.json({
      status: 1,
      timer: now,
    });
  } catch (error) {
    console.error("Error getting time:", error);
    res.status(500).json({
      status: 0,
      error: "Failed to get time",
    });
  }
};

module.exports = { getTime };
