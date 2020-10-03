import "./Profile.css"
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)

const Profile = (props) => {
  let [showSavedQuizzy, setShowSavedQuizzy] = useState("none")
  let [savedGames, setSavedGames] = useState([])

  socket.on("connect", function () {
    socket.emit("requestDbNames", props.user.id)
  })

  //Get database names to display to user
  socket.on("gameNamesData", function (data) {
    setSavedGames(data)
  })

  const userData = props.user ? (
    <div className="text-center pt-4">
      <h1 className="profileTitle">Profile</h1>
      <p className="profileData">
        <strong>Name:</strong> {props.user.name}
      </p>
      <p>
        <strong>Email:</strong> {props.user.email}
      </p>
      <br />
    </div>
  ) : (
    <h4>Loading...</h4>
  )

  const errorDiv = () => {
    return (
      <div className="text-center pt-4">
        <h3>
          Please <Link to="/signin">Sign in</Link> to view this page
        </h3>
      </div>
    )
  }

  function showQuizzy() {
    if (showSavedQuizzy === "none") {
      setShowSavedQuizzy("block")
    } else {
      setShowSavedQuizzy("none")
    }
  }

  return (
    <div className="profile">
      <div>{props.user ? userData : errorDiv()}</div>
      <a href="/createGame">
        <button>Create Quizzes</button>
      </a>
      <button onClick={showQuizzy}>Saved Quizzes</button>
      <div style={{ display: `${showSavedQuizzy}` }}>
        <h1>Saved Quizzy's</h1>
        {savedGames.map((game, i) => {
          return (
            <a href={`/host/?id=${game.id}`} key={i}>
              <h3>{game.name}</h3>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default Profile
