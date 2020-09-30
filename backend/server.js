require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 8000
const passport = require("passport")
const users = require("./routes/api/users")
const http = require("http")
const socketIO = require("socket.io")

// import classes
const { LiveGames } = require("./utils/liveGames")
const { Players } = require("./utils/players")

// middleware
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// passport middleware
app.use(passport.initialize())

// importing passport file into server
require("./config/passport")(passport)

const server = http.createServer(app)
const io = socketIO(server)
var games = new LiveGames()
var players = new Players()

var MongoClient = require("mongodb").MongoClient
var MONGO_URI = process.env.MONGO_URI

io.on("connection", (socket) => {
  console.log("New client connected")

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })

  socket.on("host-join", (data) => {

    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err
      var dbo = db.db("quizzy")
      var query = { id: parseInt(data.id) }
      dbo
        .collection("quizzyGames")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err

          // if finds a game using the id passed in url
          if (result[0] !== undefined) {
            var gamePin = Math.floor(Math.random() * 89753 + 10000) // set game pin
            games.addGame(gamePin, socket.id, false, {
              playersAnswered: 0,
              questionLive: false,
              gameid: data.id,
              question: 1,
            })

            var game = games.getGame(socket.id)
            socket.join(game.pin)
            console.log("Game pin: ", game.pin)

            socket.emit("showGamePin", {
              pin: game.pin,
            })
          } else {
            socket.emit("noGameFound")
          }
          db.close()
        })
    })
  })

  socket.on('host-join-game', (data) => {
    var oldHostId = data.id
    var game = games.getGame(oldHostId)
    if(game) {
      game.hostId = socket.id
      socket.join(game.pin)
      var playerData = players.getPlayers(oldHostId)
      for (let i = 0; i < Object.keys(players.players).length; i++){
        if(players.players[i].hostId == oldHostId){
          players.players[i].hostId = socket.id
        }
      }
      var gameId = game.gameData.gameid
      MongoClient.connect(MONGO_URI, function(err, db) {
        if (err) throw err

        var dbo = db.db('quizzy')
        dbo.collection('quizzyGames').find({id: parseInt(gameId)}).toArray(function(err,res) {
          if (err) throw err;
          
          var question = res[0].questions[0].question;
          var answer1 = res[0].questions[0].answers[0];
          var answer2 = res[0].questions[0].answers[1];
          var answer3 = res[0].questions[0].answers[2];
          var answer4 = res[0].questions[0].answers[3];
          var correctAnswer = res[0].questions[0].correct;

          socket.emit('gameQuestions', {
            q1: question,
            a1: answer1,
            a2: answer2,
            a3: answer3,
            a4: answer4,
            correct: correctAnswer,
            playersInGame: playerData.length
          });
          db.close();
        }) 
      })

      io.to(game.pin).emit('gameStartedPlayer')
      game.gameData.questionLive = true;
    } else {
      socket.emit('noGameFound')
    }
  })

  socket.on('player-join', function(params) {
    let gameFound = false
    
    for( let i = 0; i < games.games.length; i++){
      if(params.pin == games.games[i].pin){
        console.log('Player connected to game');
        var hostId = games.games[i].hostId
        players.addPlayer(hostId, socket.id, params.name, {score: 0, answer: 0})
        socket.join(params.pin)

        var playersInGame = players.getPlayers(hostId)
        io.to(params.pin).emit('updatePlayerLobby', playersInGame)
        gameFound = true
      }
    }

    if(gameFound == false){
      socket.emit('noGamesFound')
    }

  })

  socket.on('startGame', function() {
    var game = games.getGame(socket.id)
    game.gameLive = true
    socket.emit('gameStarted', game.hostId)
  })

  socket.on('requestDbNames', function(userId) {
    MongoClient.connect(MONGO_URI, function(err, db){
      if (err) throw err

      var dbo = db.db('quizzy')
      dbo.collection('quizzyGames').find({userId: userId}).toArray(function(err, res) {
        if (err) throw err

        socket.emit('gameNamesData', res)
        db.close();
      })
    })
  })

  socket.on("newQuiz", function (data) {
    console.log(data.questions)
    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err
      var dbo = db.db("quizzy")
      dbo
        .collection("quizzyGames")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err
          var num = Object.keys(result).length
          if (num == 0) {
            data.id = 1
            num = 1
          } else {
            data.id = result[num - 1].id + 1
          }
          var game = data
          dbo.collection("quizzyGames").insertOne(game, function (err, res) {
            if (err) throw err
            db.close()
          })
          db.close()
          socket.emit("startGameFromCreator", num)
        })
    })
  })
})

// <<<<<<<<  SERVER HOME ROUTE >>>>>>>>>>>
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Smile, You are being watched by the Backend Team" })
})

// api/users route middleware
app.use("/api/users", users)

// SERVER PORT TO LISTEN
server.listen(port, () => {
  console.log(`You are lisening smooth to port ${port}`)
})
