require("dotenv").config()
const mongoose = require("mongoose")

// mongo connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
})

//mongoose connection object
const db = mongoose.connection

db.once("open", () => {
  console.log(`Connected to MongoDB ${db.host}:${db.port}`)
})

db.on("error", (error) => {
  console.log(`Database error\n${error}`)
})

module.exports.User = require("./User")
