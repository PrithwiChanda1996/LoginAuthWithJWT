const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const User = require("../models/User");
const Token = require("../models/Token");

//@route    POST api/auth/register
//@desc     Register user
//@access   Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more character"
    ).isLength({ min: 6 }),
    check("contact", "Contact is required").not().isEmpty(),
    check("contact", "Please enter a valid mobile number").isMobilePhone(),
    check("address", "Address is required").not().isEmpty(),
    check("gender", "Gender is required").not().isEmpty(),
    check("country", "Country is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contact, address, gender, country } =
      req.body;

    try {
      //Check if user exists

      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password,
        contact,
        address,
        gender,
        country,
      });

      //Encrypt password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      res.status(200).send(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

//@route    POST api/auth
//@desc     Authenticate user and get token
//@access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //Check if user exists

      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Validating password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });

      // Return JWT

      const payload = {
        user: {
          id: user.id,
        },
      };

      let accessToken = jwt.sign(payload, config.get("jwtSecret"), {
        expiresIn: 20,
      });

      //Token save in
      token = new Token({
        token: accessToken,
      });
      await token.save();
      res.json({ accessToken: accessToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/auth
//@desc     Delete API token
//@access   Public
router.delete("/", auth, async (req, res) => {
  await Token.findOneAndDelete({ token: req.token });
  res.json({ msg: "Deleted" });
});

module.exports = router;
