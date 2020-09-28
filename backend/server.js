require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 8000
const passport = require("passport")
const users = require('./routes/api/users')
const http = require("http");
const socketIo = require("socket.io");

// middleware
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// passport middleware
app.use(passport.initialize())

// importing passport file into server
require("./config/passport")(passport)

const server = http.createServer(app);
const io = socketIo(server);

var MongoClient = require('mongodb').MongoClient;
var MONGO_URI = process.env.MONGO_URI;

io.on("connection", (socket) => {

  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on('newQuiz', function(data){
    MongoClient.connect(MONGO_URI, function(err, db){
        if (err) throw err;
        var dbo = db.db('quizzy');
        dbo.collection('quizzyGames').find({}).toArray(function(err, result){
            if(err) throw err;
            var num = Object.keys(result).length;
            if(num == 0){
              data.id = 1
              num = 1
            }else{
              data.id = result[num -1 ].id + 1;
            }
            var game = data;
            dbo.collection("quizzyGames").insertOne(game, function(err, res) {
                if (err) throw err;
                db.close();
            });
            db.close();
            socket.emit('startGameFromCreator', num);
        });
        
    });

  });
});

// <<<<<<<<  SERVER HOME ROUTE >>>>>>>>>>>
app.get("/", (req, res) => {
  res.status(200)
    .json({ message: "Smile, You are being watched by the Backend Team" })
})

// api/users route middleware
app.use('/api/users', users)

// SERVER PORT TO LISTEN
server.listen(port, () => {
  console.log(`You are lisening smooth to port ${port}`)
})
