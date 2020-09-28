require("dotenv").config()
const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")
const passport = require("passport")

// load user model
const db = require("../../models")
const User = require("../../models/User")

// POST route api/users/register (Public)
router.post("/register", (req, res) => {
  db.User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ msg: "Email already exists." })
      } else if (req.body.password === req.body.confirmPassword) {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        })

        bcrypt.genSalt(10, (error, salt) => {
          bcrypt.hash(newUser.password, salt, (error, hash) => {
            if (error) throw error

            newUser.password = hash
            newUser
              .save()
              .then((createdUser) => res.json(createdUser))
              .catch((error) => console.log(error))
          })
        })
      } else {
        return res.status(400).json({
          msg: "Password and Confirm Password Doesn't match. Please try again",
        })
      }
    })
    .catch((err) => {
      console.log("Error while creating a user ", err)
      res.status(503).send({ message: "Server Error" })
    })
})
