import "./Host.css"
import React, { useEffect, useState } from "react"
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const Host = () => {

  // state variables
  let [players, setPlayers] = useState("")
  let [gamePin, setGamePin] = useState("")
  let [lobbyData, setLobbyData] = useState([])

  // when host create a game with game id
  socket.on("connect", function () {
    var params = { id: urlParams.get("id") }
    socket.emit("host-join", params)
  })

  // when found a game with same pin, automatically refires to get a new pin
  socket.on("requestAgain", function () {
    var params = { id: urlParams.get("id") }
    socket.emit("host-join", params)
  })

  // set game pin to a variable
  socket.on("showGamePin", function (data) {
    setGamePin(data.pin)
  })

  // updates player lobbby when a player joins
  socket.on("updatePlayerLobby", function (data) {
    setLobbyData(data)
  })

  useEffect(() => {
    for (let i = 0; i < lobbyData.length; i++) {
      if (!players.includes(lobbyData[i].name)) {
        setPlayers(`${players}${lobbyData[i].name}\n`)
      }
    }
  }, [lobbyData])

  // When host start the game let server know that game started
  const startGame = () => {
    socket.emit("startGame")
  }

  // if host want to end the game
  const endGame = () => {
    window.location.href = "../../"
  }

  // when server starts the game 
  socket.on("gameStarted", function (id) {
    window.location.href = "/hostgame/?id=" + id
  })

  socket.on("noGameFound", function () {
    window.location.href = "../../" //Redirect user to 'join game' page
  })

  return (
    <div className="host">
      <h2 id="hostTitle">Join this Game using the Game Pin: </h2>
      <h1 id="gamePinText">{gamePin}</h1>
      <textarea readOnly id="players" value={players}></textarea>
      <br />
      <button id="start" onClick={startGame}>
        Start Game
      </button>
      <button id="cancel" onClick={endGame}>
        Cancel Game
      </button>
    </div>
  )
}

export default Host
