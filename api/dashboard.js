const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

//@route    GET api/dashboard
//@desc     Get all users
//@access   Private
router.get("/", auth, paginatedResults(User), async (req, res) => {
  try {
    res.json(res.paginatedResults);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const keyWord = req.query.keyWord || "";
    const limit = 5;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    const pages = await model.countDocuments().exec();
    let token = pages / limit;
    if (token > parseInt(token)) token = parseInt(token) + 1;

    try {
      if (keyWord.length > 0) {
        results.results = await model
          .find({ name: { $regex: keyWord, $options: "$i" } })
          .select("-password")
          .limit(limit)
          .skip(startIndex)
          .exec();
        if (results.results == 0) {
          results.results = await model
            .find({ contact: { $regex: keyWord, $options: "$i" } })
            .select("-password")
            .limit(limit)
            .skip(startIndex)
            .exec();
        }
      } else {
        if (endIndex < (await model.countDocuments().exec())) {
          results.next = {
            page: page + 1,
            limit: limit,
          };
        } else {
          results.next = {
            page: 0,
            limit: limit,
          };
        }

        results.previous = {
          page: page - 1,
          limit: limit,
        };

        results.page = page;
        results.token = token;
        results.results = await model
          .find()
          .select("-password")
          .limit(limit)
          .skip(startIndex)
          .exec();
      }
      res.paginatedResults = results;

      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

module.exports = router;
