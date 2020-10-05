require("dotenv").config()
const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")
const passport = require("passport")
const JWT_SECRET = process.env.JWT_SECRET

// load user model
const db = require("../../models")

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

// POST api/users/login (Public)
router.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  // find user using email
  db.User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User not found" })
      } else {
        // check input password and saved password with bcrypt
        bcrypt.compare(password, user.password).then((isMatch) => {
          // if matchs generate a token using user saved information
          if (isMatch) {
            const payload = {
              id: user.id,
              name: user.name,
              email: user.email,
              imageId: user.imageId
            }

            // sign in token
            jwt.sign(
              payload,
              JWT_SECRET,
              { expiresIn: 3600 },
              (error, token) => {
                res.json({ success: true, token: `Bearer ${token}` })
              }
            )
          } else {
            return res
              .status(400)
              .json({ password: "Password or email is incorrect" })
          }
        })
      }
    })
    .catch((err) => {
      console.log("Error while creating a user ", err)
      res.status(503).send({ message: "Server Error" })
    })
})

// update route for profile data
router.post("/updateData", (req, res) => {
  const email = req.body.email
  const name = req.body.name

  // find user using email
  db.User.findOneAndUpdate({ email }, { name })
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User not found" })
      } else {
        res.json(user)
      }
    })
    .catch((err) => {
      console.log("Error while creating a user ", err)
      res.status(503).send({ message: "Server Error" })
    })
})

// update route for image
router.post("/updateImage", (req, res) => {
  const email = req.body.email
  const imageId = req.body.imageId

  // find user using email
  db.User.findOneAndUpdate({ email }, { imageId })
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User not found" })
      } else {
        res.json(user)
      }
    })
    .catch((err) => {
      console.log("Error while creating a user ", err)
      res.status(503).send({ message: "Server Error" })
    })
})

// GET api/user/current (Private)
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json({
      id: req.user.is,
      name: req.user.name,
      email: req.user.email,
      imageId: res.user.imageId
    })
  }
)

module.exports = router
