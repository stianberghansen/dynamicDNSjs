const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  //sends array of objects with all domains
  res.json({ subdomain: "name" });
});

router.post("/add", (req, res) => {
  if (req.body.add) {
    console.log(req.body.add);
  }

  res.json("success");
});

module.exports = router;
