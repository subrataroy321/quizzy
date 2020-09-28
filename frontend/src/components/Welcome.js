import React from "react"
import './Welcome.css'

const Welcome = () => {
  return (
    <div>
      <h1 id = "title">Join a Game</h1>
        <form action="player/">
          <div className="form-field">
              <label id = "label">Display Name</label>
              <input id = "name" type = "text" name="name" />
          </div>
          <br/>
          <div className="form-field">
              <label id = "label">Game Pin</label>
              <input id = "pin" type="number" name="pin"/>
          </div>
          <br/>
          <div className="form-field">
              <button id = "joinButton">Join</button>
          </div>
        </form>
        <br/>
        <center><a href = "/profile/create/" id = "host">Click here to host a Kahoot!</a></center>
    </div>
  )
}

export default Welcome
