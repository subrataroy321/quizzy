import React, {useState} from "react"
import './Welcome.css'

const Welcome = () => {
  let [displayName, setDisplayName] = useState('')
  let [gamePin, setGamePin] = useState('')
  
  const handleDisplayName = (e) => {
    setDisplayName(e.target.value)
  }
  
  const handleGamePin = (e) => {
    setGamePin(e.target.value)
  }

  return (
    <div>
      <h1 id = "title">Join a Game</h1>
        <form action="/player/">
          <div className="form-field">
              <label id = "label">Display Name</label>
              <input id = "name" type = "text" name="name" onChange={handleDisplayName} value={displayName}/>
          </div>
          <br/>
          <div className="form-field">
              <label id = "label">Game Pin</label>
              <input id = "pin" type="number" name="pin" onChange={handleGamePin} value={gamePin}/>
          </div>
          <br/>
          <div className="form-field">
              <button id = "joinButton">Join</button>
          </div>
        </form>
        <br/>
        <center><a href = "/profile" id = "host">Click here to host a Kahoot!</a></center>
    </div>
  )
}

export default Welcome
