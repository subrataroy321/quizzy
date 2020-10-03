// import requireed node modules into variables
require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const passport = require("passport")
const users = require("./routes/api/users")
const http = require("http")
const socketIO = require("socket.io")
const MongoClient = require("mongodb").MongoClient
const port = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI

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

// create a socket server based on socket server
const server = http.createServer(app)
const io = socketIO(server)

// define classes using contructor variable
let games = new LiveGames()
let players = new Players()

// server main socket connection function for client connection
io.on("connection", (socket) => {

  // host lobby create function
  socket.on("host-join", (data) => {

    // Connect mongodb Database
    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err

      let dbo = db.db("quizzy") // get the our database
      let query = { id: parseInt(data.id) } // set query into query variable
      
      // make a query into database collection 
      dbo.collection("quizzyGames").find(query).toArray(function (err, result) {
        if (err) throw err

        // if finds a game using the id passed in url
        if (result[0] !== undefined) {

          let currentGamePins = []
          // set all Active Game Pins to currentGamePins
          for (let i = 0; i < Object.keys(games.games).length; i++) {
            currentGamePins.push(games.games[i].gamePin)
          }
          // get game pin
          let gamePin = Math.floor(Math.random() * 89753 + 10000) // set game pin
          // if the new Game Pin is not an active game
          if (!currentGamePins.includes(gamePin)) {
            // creates Game using the new GamePin
            games.addGame(gamePin, socket.id, false, {
              playersAnswered: 0,
              questionLive: false,
              gameid: data.id,
              question: 1,
            })

            let game = games.getGame(socket.id) // gets that added game using socket id
            socket.join(game.pin) // creates a socket room
            console.log("Game pin: ", game.pin)

            // send game Pin to host
            socket.emit("showGamePin", {
              pin: game.pin,
            })
          } else { // else game pin active, send host to make another request
            socket.emit("requestAgain")
          }
        } else { // else no game in database with that id
          socket.emit("noGameFound")
        }
        db.close()
      })
    })
  })

  // host start a game
  socket.on("host-join-game", (data) => {
    let game = games.getGame(data.id) // gets the game

    if (game) {
      game.hostId = socket.id
      socket.join(game.pin)
      let playerData = players.getPlayers(data.id)

      // sets gmae playes hostId to socket id
      for (let i = 0; i < Object.keys(players.players).length; i++) {
        if (players.players[i].hostId == data.id) {
          players.players[i].hostId = socket.id
        }
      }
      
      let gameId = game.gameData.gameid // get game id

      // connect to mongodb
      MongoClient.connect(MONGO_URI, function (err, db) {
        if (err) throw err

        let dbo = db.db("quizzy")
        let query = {id: parseInt(gameId)}

        // make a query to game collections
        dbo.collection("quizzyGames").find(query).toArray(function (err, res) {
          if (err) throw err

          // set question data to variable
          let question = res[0].questions[0].question
          let answer1 = res[0].questions[0].answers[0]
          let answer2 = res[0].questions[0].answers[1]
          let answer3 = res[0].questions[0].answers[2]
          let answer4 = res[0].questions[0].answers[3]
          let correctAnswer = res[0].questions[0].correct
          let totalQuestions = res[0].questions.length
          let gameTitle = res[0].name

          // send question data to host
          socket.emit("gameQuestions", {
            gameTitle: gameTitle,
            totalQuestions: totalQuestions,
            questionNum: game.gameData.question,
            q1: question,
            a1: answer1,
            a2: answer2,
            a3: answer3,
            a4: answer4,
            correct: correctAnswer,
            playersInGame: playerData.length
          })
          db.close()
        })
      })

      // send request to game start to all game pin
      io.to(game.pin).emit("gameStartedPlayer")
      game.gameData.questionLive = true
    } else { // if no game founds
      socket.emit("noGameFound")
    }
  })

  // player wants to join a game and send player to waiting room
  socket.on("player-join", function (params) {
    let gameFound = false
    for (let i = 0; i < games.games.length; i++) {
      // check if players matches a game pin and game is not active
      if (params.pin == games.games[i].pin && games.games[i].gameLive === false) {
        console.log("Player connected to game")
        let hostId = games.games[i].hostId

        //add that player
        players.addPlayer(hostId, socket.id, params.name, {
          score: 0,
          answer: 0,
        })

        // joins that socket room
        socket.join(params.pin)

        let playersInGame = players.getPlayers(hostId) // gets all the players

        // send request to update player lobby to that game pin
        io.to(params.pin).emit("updatePlayerLobby", playersInGame)
        gameFound = true
      }
    }

    // if no game found with that pin
    if (gameFound == false) {
      socket.emit("noGamesFound")
    }
  })

  // function to send player from waiting room to game state
  socket.on("player-join-game", function (data) {
    let player = players.getPlayer(data.id) // get the player user player socket.id

    if (player) { // check if players exists
      let game = games.getGame(player.hostId) // get game using player hostId
      socket.join(game.pin) // joins the room 
      player.playerId = socket.id // set playerId to current socket.id

      let playerData = players.getPlayers(game.hostId) // get players data using game hostId
      // send player data
      socket.emit("playerGameData", playerData)
    } else { // in case an error
      socket.emit("noGameFound")
    }
  })

  // when host or player leaves the game
  socket.on("disconnect", function () {
    let game = games.getGame(socket.id) //Finding game with socket.id
    //If a game hosted by that id is found, the socket disconnected is a host
    if (game) {
      //Checking to see if host was disconnected or was sent to game view
      if (game.gameLive == false) {
        games.removeGame(socket.id) //Remove the game from games class
        console.log("Game ended with pin:", game.pin)
        let playersToRemove = players.getPlayers(game.hostId) //Getting all players in the game

        //For each player in the game
        for (let i = 0; i < playersToRemove.length; i++) {
          players.removePlayer(playersToRemove[i].playerId) //Removing each player from player class
        }

        io.to(game.pin).emit("hostDisconnect") //Send player back to 'join' screen
        socket.leave(game.pin) //Socket is leaving room
      }
    } else {
      //No game has been found, so it is a player socket that has disconnected
      let player = players.getPlayer(socket.id) //Getting player with socket.id
      //If a player has been found with that id
      if (player) {
        let hostId = player.hostId //Gets id of host of the game
        let game = games.getGame(hostId) //Gets game data with hostId
        let pin = game.pin //Gets the pin of the game

        if (game.gameLive == false) {
          players.removePlayer(socket.id) //Removes player from players class
          let playersInGame = players.getPlayers(hostId) //Gets remaining players in game

          io.to(pin).emit("updatePlayerLobby", playersInGame) //Sends data to host to update screen
          socket.leave(pin) //Player is leaving the room
        }
      }
    }
  })

  // When Player chooses an answer
  socket.on("playerAnswer", function (num) {
    let player = players.getPlayer(socket.id)
    let hostId = player.hostId
    let playerNum = players.getPlayers(hostId)
    let game = games.getGame(hostId)

    // if the game is live then set player answer
    if (game.gameData.questionLive == true) {
      player.gameData.answer = num
      game.gameData.playersAnswered += 1

      let gameQuestion = game.gameData.question
      let gameId = game.gameData.gameid

      // connect to mongo db
      MongoClient.connect(MONGO_URI, function (err, db) {
        let dbo = db.db("quizzy")
        let query = { id: parseInt(gameId) }
        
        // makes a query to database collection
        dbo.collection("quizzyGames").find(query).toArray(function (err, res) {
          if (err) throw err

          let correctAnswer = res[0].questions[gameQuestion - 1].correct // get question correct answer
          // when player answer is correct
          if (num == correctAnswer) {
            player.gameData.score += 100
            io.to(game.pin).emit("getTime", socket.id) // request for host timer time from host
            socket.emit("answerResult", true)
          }

          // vvvvvvvvv CONDITION TO STOP TIMER WHEN ALL PLAYERS ANSWERED vvvvvvvvvvv
          // if (game.gameData.playersAnswered == playerNum.length) {
          //   game.gameData.questionLive = false
          //   let playerData = players.getPlayers(game.hostId)
          //   io.to(game.pin).emit("questionOver", playerData, correctAnswer)
          // } else {
          // }
          // /\/\/\/\/\//\/\\/\/\/\\//\\\///\/\/\/\/\/\

          // send request 
          io.to(game.pin).emit("updatePlayerAnswered", {
            playersInGame: playerNum.length,
            playersAnswered: game.gameData.playersAnswered,
          })
          db.close()
        })
      })
    }
  })

  // When user send a request to get current Score
  socket.on("getScore", function () {
    let player = players.getPlayer(socket.id)
    socket.emit("newScore", player.gameData.score) // send score data to user
  })

  // host send the time with player data and time to save it on the game
  socket.on("time", function (data) {
    let time = data.time / 20 // calculate players time ratio for score calculation
    time = time * 100
    let playerid = data.player
    let player = players.getPlayer(playerid) // get a player using player ID 
    player.gameData.score += time // set player score.
  })

  // on hosts timer ends send the correct answer to all
  socket.on("timeUp", function () {
    let game = games.getGame(socket.id) // get the game using socket id
    if (game) {
      game.gameData.questionLive = false // set game question status to false
      let playerData = players.getPlayers(game.hostId) // get all players using host id

      let gameQuestion = game.gameData.question
      let gameid = game.gameData.gameid

      // connect to mongo db
      MongoClient.connect(MONGO_URI, function (err, db) {
        if (err) throw err

        let dbo = db.db("quizzy")
        let query = { id: parseInt(gameid) }
        // makes a query to get the gamedata from database
        dbo.collection("quizzyGames").find(query).toArray(function (err, res) {
          if (err) throw err

          let correctAnswer = res[0].questions[gameQuestion - 1].correct // get questions correct answer
          io.to(game.pin).emit("questionOver", playerData, correctAnswer) // send to all players/clients

          db.close()
        })
      })
    }
  })

  // gets next question from game questions
  socket.on("nextQuestion", function () {
    let playerData = players.getPlayers(socket.id)

    for (let i = 0; i < Object.keys(players.players).length; i++) {
      // changes games all players answer to 0
      if (players.players[i].hostId === socket.id) {
        players.players[i].gameData.answer = 0
      }
    }

    let game = games.getGame(socket.id) // gets the game 
    game.gameData.playersAnswered = 0
    game.gameData.questionLive = true
    game.gameData.question += 1
    let gameid = game.gameData.gameid

    // connecting to mongo db
    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err

      let dbo = db.db("quizzy")
      let query = { id: parseInt(gameid) }

      // makes a query to the collection
      dbo.collection("quizzyGames").find(query).toArray(function (err, res) {
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
          let totalQuestions = res[0].questions.length

          // send all the question data to start the question again
          socket.emit("gameQuestions", {
            totalQuestions: totalQuestions,
            questionNum: game.gameData.question,
            q1: question,
            a1: answer1,
            a2: answer2,
            a3: answer3,
            a4: answer4,
            correct: correctAnswer,
            playersInGame: playerData.length,
          })

          db.close()
        } else {

          let playersInGame = players.getPlayers(game.hostId)
          let first = { name: "", score: 0 }
          let second = { name: "", score: 0 }
          let third = { name: "", score: 0 }
          let fourth = { name: "", score: 0 }
          let fifth = { name: "", score: 0 }
          
          // if there is no more questions get top five scored players
          for (let i = 0; i < playersInGame.length; i++) {

            if (playersInGame[i].gameData.score > fifth.score) {
              if (playersInGame[i].gameData.score > fourth.score) {
                if (playersInGame[i].gameData.score > third.score) {
                  if (playersInGame[i].gameData.score > second.score) {
                    if (playersInGame[i].gameData.score > first.score) {
                      // first place
                      fifth.name = fourth.name
                      fifth.score = fourth.score

                      fourth.name = third.name
                      fourth.score = third.score

                      third.name = second.name
                      third.score = second.score

                      second.name = first.name
                      second.score = first.score

                      first.name = playersInGame[i].name
                      first.score = playersInGame[i].gameData.score
                    } else {
                      // second place
                      fifth.name = fourth.name
                      fifth.score = fourth.score

                      fourth.name = third.name
                      fourth.score = third.score

                      third.name = second.name
                      third.score = second.score

                      second.name = playersInGame[i].name
                      second.score = playersInGame[i].gameData.score
                    }
                  } else {
                    // third place
                    fifth.name = fourth.name
                    fifth.score = fourth.score

                    fourth.name = third.name
                    fourth.score = third.score

                    third.name = playersInGame[i].name
                    third.score = playersInGame[i].gameData.score
                  }
                } else {
                  // fourth place
                  fifth.name = fourth.name
                  fifth.score = fourth.score

                  fourth.name = playersInGame[i].name
                  fourth.score = playersInGame[i].gameData.score
                }
              } else {
                // fifth place
                fifth.name = playersInGame[i].name
                fifth.score = playersInGame[i].gameData.score
              }
            }
            // end of for
          }

          // tells host that game is over and send top five players
          io.to(game.pin).emit("GameOver", {
            num1: first.name,
            num2: second.name,
            num3: third.name,
            num4: fourth.name,
            num5: fifth.name,
            score1: first.score,
            score2: second.score,
            score3: third.score,
            score4: fourth.score,
            score5: fifth.score,
          })
        }
      })
    })

    // tells all players that its next question
    io.to(game.pin).emit("nextQuestionPlayer")
  })

  // when host starts the game 
  socket.on("startGame", function () {
    let game = games.getGame(socket.id) // get the game using socket id
    game.gameLive = true // set game status
    socket.emit("gameStarted", game.hostId) // tell all game playes that game started
  })

  // when host user makes a request to get saved games
  socket.on("requestDbNames", function (userId) {
    // connect to mongo db
    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err

      let dbo = db.db("quizzy")
      let query = { userId: userId }

      // makes a query for all saved games by user
      dbo.collection("quizzyGames").find(query).toArray(function (err, res) {
        if (err) throw err

        socket.emit("gameNamesData", res) // send game Data 
        db.close()
      })
    })
  })

  // host creates a new quiz
  socket.on("newQuiz", function (data) {
    // connect to mongo db
    MongoClient.connect(MONGO_URI, function (err, db) {
      if (err) throw err

      let dbo = db.db("quizzy")
      // gets all the saved games for creating an id
      dbo.collection("quizzyGames").find({}).toArray(function (err, result) {
        if (err) throw err

        let num = Object.keys(result).length
        let newGameId = result[num - 1].id + 1
        // set serialize id
        if (num == 0) {
          data.id = 1
          num = 1
        } else {
          data.id = newGameId
        }
        let game = data

        // adds to out game collection
        dbo.collection("quizzyGames").insertOne(game, function (err, res) {
          if (err) throw err

          db.close()
        })
        db.close()

        socket.emit("startGameFromCreator", newGameId) // sends host with host lobby after successful game creation
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
