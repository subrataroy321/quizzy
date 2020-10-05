<img src="./readme/quizzy-logo.png"/>

[Quizzy](https://qquizzyy.herokuapp.com/)

Quizzy is a live quizing application. It is a MERN Apllication with Socket.io (web socket). This project has two part `backend` and `frontend`.

## User Story
- An user can create an account and Sign in
- An user can Upload a profile picture, edit user name
- create and start a game with using the create game form 
- if you has saved Games, can start a game and delete a game
- On start game server provides a unique pin for the game
- a player user can join the game using the unique pin
- On host user question start, in game players able to choose an answer
- a host user can get next game question, if there is multiple questions otherwise ends the game

## Technologies and Node Packages
* Backend
    - Language 
        - JavaScript
    - Technologies
        - node.js
        - express.js
        - mongoDB
        - socket.io
    - node package modules
        - "bcryptjs"
        - "cors"
        - "dotenv"
        - "express"
        - "jsonwebtoken"
        - "mongodb"
        - "mongoose"
        - "passport"
        - "passport-jwt"
        - "socket.io"

* Frontend
    - Language 
        - JavaScript
    - Technologies
        - react.js
        - socket.io
        - bootstrap
        - cloudinary
    - node package modules
        - "axios"
        - "body-parser"
        - "cloudinary-react"
        - "express"
        - "jwt-decode"
        - "jwt-js-decode"
        - "react"
        - "react-alert"
        - "react-alert-template-basic"
        - "react-dom"
        - "react-router-dom"
        - "react-scripts"
        - "socket.io-client"

## Folder Structure

```
quizzy/
  README.md
  readme/

  backend/
    config/
        passport.js
    models/
        index.js
        User.js
    node_modules/
    routes/api/
        users.js
    utils/
        liveGames.js
        players.js
    package-lock.json
    package.json
    server.js

  frontend/
    package.json
    node_modules/
    public/
        index.html
        favicon.ico
    src/
        assets/
        components/
            host/
            player/
            Welcome.js
            SignIn.js
            Register.js
        utils/
            setAuthToken.js
        App.css
        App.js
        App.test.js
        index.css
        index.js
        logo.svg
```

## Installation Instructions on Local Machine

Before we get into deeper, make sure you have MongoDB Community edition to use mongoDB on local machine. Just run `mongo`. If you see an error you don't have it.

if you don't have MongoDB installed, install [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)

* Backend
    - on terminal `cd` into `backend` directory
    - install node packages, run `npm i` or `npm install` on terminal
    - create an `.env` file, run `touch .env`
    - on code editor set env variables according to `.env.example`
    - `node server.js` to start the server.

Important: Do not close the server.

* Frontend
    - on a second terminal `cd` into `frontend` directory
    - install node packages, run `npm i` or `npm install` on terminal
    - create an `.env` file, run `touch .env`
    - on code editor set env variables according to `.env.example`
    - `npm start` to start the react app.

## Entity Relationship Diagram (ERD)

## Application Screenshots

- Home/Join
<img src="./readme/Screen Shot 2020-10-05 at 2.51.21 AM.png">

- Sign Up
<img src="./readme/Screen Shot 2020-10-05 at 3.09.40 AM.png">

- Log In
<img src="./readme/Screen Shot 2020-10-05 at 3.09.54 AM.png"/>

- Profile
<img src="./readme/Screen Shot 2020-10-05 at 3.10.59 AM.png"/>

- Create Game
<img src="./readme/Screen Shot 2020-10-05 at 3.11.51 AM.png" />

- Host Waiting Room
<img src="./readme/Screen Shot 2020-10-05 at 3.13.44 AM.png"/>

- Player Waiting Room
<img src="./readme/Screen Shot 2020-10-05 at 3.13.33 AM.png"/>

- On Question Live (Host) 
<img src="./readme/Screen Shot 2020-10-05 at 3.14.05 AM.png"/>

- On Question Live (Player) 
<img src="./readme/Screen Shot 2020-10-05 at 3.14.14 AM.png"/>

## Code Snippets

- This is part is so important for me because, I spend a whole day to understand the socket.io

```js
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
```

- This is another most important because, I was confused how to go by genarating a unique pin. But I made it.

```js
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
```