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

  socket.on('player-join-game', function(data){
    var player = players.getPlayer(data.id)
    console.log(player)
    if(player) {
      var game = games.getGame(player.hostId)
      socket.join(game.pin)
      player.playerId = socket.id

      var playerData = players.getPlayers(game.hostId)
      socket.emit('playerGameData', playerData)
    } else {
      socket.emit('noGameFound')
    }
  })

  socket.on('disconnect', function() {

  })

  socket.on('playerAnswer', function(num) {
    var player = players.getPlayer(socket.id)
    var hostId = player.hostId
    var playerNum = players.getPlayers(hostId)
    var game = games.getGame(hostId)
    if(game.gameData.questionLive == true){
      player.gameData.answer = num;
      game.gameData.playersAnswered += 1

      var gameQuestion = game.gameData.question
      var gameId = game.gameData.gameid

      MongoClient.connect(MONGO_URI, function(err, db){
        var dbo = db.db('quizzy')
        var query = {id: parseInt(gameId)}

        dbo.collection('quizzyGames').find(query).toArray(function(err, res) {
          if (err) throw err

          var correctAnswer = res[0].questions[gameQuestion-1].correct
          if(num == correctAnswer){
            player.gameData.score += 100
            io.to(game.pin).emit('getTime', socket.id)
            socket.emit('answerResult', true)
          }

          if(game.gameData.playersAnswered == playerNum.length){
            game.gameData.questionLive = false;
            var playerData = player.getPlayers(game.hostId)
            io.to(game.pin).emit('questionOver', playerData, correctAnswer)
          } else {
            io.to(game.pin).emit('updatePlayerAnswered', {
              playersInGame: playerNum.length,
              playersAnswered: game.gameData.playersAnswered
            })
          }
          db.close()

        })
      })

    }
  })

  socket.on('getScore', function(){
    var player = players.getPlayer(socket.id);
    socket.emit('newScore', player.gameData.score); 
  });

  socket.on('time', function(data) {
    let time = data.time / 20
    time = time * 100
    let playerid = data.player
    let player = players.getPlayer(playerid)
    player.gameData.score += time;
  })

  socket.on('timeUp', function() {
    let game = games.getGame(socket.id)
    game.gameData.questionLive = false
    let playerData = players.getPlayers(game.hostId)

    let gameQuestion = game.gameData.question
    let gameid = game.gameData.gameid
      MongoClient.connect(MONGO_URI, function(err, db) {
        if (err) throw err;

        let dbo = db.db('quizzy');
        let query = {id: parseInt(gameid)}
        dbo.collection('quizzyGames').find(query).toArray(function(err, res) {
          if (err) throw err

          let correctAnswer = res[0].questions[gameQuestion - 1].correct
          io.to(game.pin).emit('questionOver', playerData, correctAnswer)

          db.close()
        })
      })
  })

  socket.on('nextQuestion', function() {
    let playerData = players.getPlayer(socket.id)

    for(let i = 0; Object.keys(players.players).length; i++) {
      if (players.players[i].hostId == socket.id) {
        player.players[i].gameData.answer = 0
      }
    }

    let game = games.getGame(socket.id)
    game.gameData.playersAnswered = 0
    game.gameData.questionLive = true
    game.gameData.question +=1
    let gameid = game.gameData.gameid

    MongoClient.connect(MONGO_URI, function(err, res) {
      if (err) throw err

      let dbo = db.db('quizzy')
      let query = {id: parseInt(gameid)}
      dbo.collection('quizzyGames').find(query).toArray(function(err, res) {
        if (err) throw err

        if (res[0].questions.length >= game.gameData.question) {
          let questionNum = game.gameData.question
          questionNum = questionNum - 1
          let question = res[0].questions[questionNum].question
          let answer1 = res[0].questions[questionNum].answers[0]
          let answer2 = res[0].questions[questionNum].answers[1]
          let answer3 = res[0].questions[questionNum].answers[2]
          let answer4 = res[0].questions[questionNum].answers[3]
          let correctAnswer = res[0].questions[questionNum].correct
          
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
        } else {
          let playersInGame = players.getPlayers(game.hostId)
          let first = {name: "", score: 0}
          let second = {name: "", score: 0}
          let third = {name: "", score: 0}
          let fourth = {name: "", score: 0}
          let fifth = {name: "", score: 0}

          for (let i = 0; i < playersInGame.length; i++) {
            console.log(playersInGame[i].gameData.score)

            if(playersInGame[i].gameData.score > fifth.score) {
              if(playersInGame[i].gameData.score > fourth.score) {
                if(playersInGame[i].gameData.score > third.score) {
                  if(playersInGame[i].gameData.score > second.score) {
                    if(playersInGame[i].gameData.score > first.score) {
                      // first place
                      fifth.name = fouth.name
                      fifth.score = fouth.score

                      fourth.name = third.name
                      fourth.score = third.score

                      third.name = second.name
                      third.score = second.score

                      second.name = first.name
                      second.score = first.score

                      first.name = playersInGame[i].name
                      first.score = playersInGame[i].score
                    } else {
                      // second place
                      fifth.name = fouth.name
                      fifth.score = fouth.score

                      fourth.name = third.name
                      fourth.score = third.score

                      third.name = second.name
                      third.score = second.score

                      second.name = playersInGame[i].name
                      second.score = playersInGame[i].score
                    }
                  } else {
                    // third place
                    fifth.name = fouth.name
                    fifth.score = fouth.score

                    fourth.name = third.name
                    fourth.score = third.score

                    third.name = playersInGame[i].name
                    third.score = playersInGame[i].score
                  }
                } else {
                  // fourth place
                  fifth.name = fouth.name
                  fifth.score = fouth.score

                  fourth.name = playersInGame[i].name
                  fourth.score = playersInGame[i].score
                }
              } else {
                // fifth place
                fifth.name = playersInGame[i].name
                fifth.score = playersInGame[i].score
              }
            }
            // end of for
          }

          io.to(game.pin).emit('GameOver', {
            num1: first.name,
            num2: second.name,
            num3: third.name,
            num4: fourth.name,
            num5: fifth.name,
            score1: first.score,
            score2: second.score,
            score3: third.score,
            score4: fourth.score,
            score5: fifth.score
          })
        }
      })
    })
    io.to(game.pin).emit('nextQuestionPlayer')
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
