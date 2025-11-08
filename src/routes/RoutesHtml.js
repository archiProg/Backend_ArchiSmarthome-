const express = require("express");
const router = express.Router();
const path = require("path")

router.get("/policy.html", (req,res) => {
 res.sendFile(path.join(__dirname, 'public', 'policy.html'));
})

router.get("/conditions.html", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'conditions.html'));
});

 
module.exports = router;