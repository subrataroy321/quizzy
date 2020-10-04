import React, { useState } from "react"
import "./SavedQuizzys.css"
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)

const SavedQuizzys = (props) => {
  // state variabes
  let [savedGames, setSavedGames] = useState([])

  // on connect requests saved games in database by user id
  socket.on("connect", function () {
    socket.emit("requestDbNames", props.user.id)
  })

  //Get and set saved Game names to display to user
  socket.on("gameNamesData", function (data) {
    setSavedGames(data)
  })

  // When user delete a game refetch the data from database
  socket.on("updateSavedGames", function (data) {
    if (props.user.id === data) {
      socket.emit("requestDbNames", props.user.id)
    } else {
      window.location.href = "../../savedQuizzys"
    }
  })

  // send request to delete selected game
  function deleteGame(gameId, userId) {
    socket.emit("deleteGame", gameId, userId)
  }

  return (
    <div id="savedQuizzy">
      <h1>Saved Quizzy's</h1>
      {savedGames.length === 0 ? (
        <p>No Saved Games</p>
      ) : (
        savedGames.map((game, i) => {
          return (
            <div key={i} className="savedGame">
              <h3>{game.name}</h3>
              <p>
                <a href={`/host/?id=${game.id}`}>Start Game</a>{" "}
                <a href="#" onClick={() => deleteGame(game.id, props.user.id)}>
                  Delete Game
                </a>
              </p>
            </div>
          )
        })
      )}
    </div>
  )
}

export default SavedQuizzys
