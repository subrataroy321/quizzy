import './Host.css'
import React, { useState } from 'react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)
var params = {id: urlParams.get('id')}

const Host = () => {
    let [players, setPlayers] = useState('')
    let [gamePin, setGamePin] = useState('')
    
    socket.on('connect', function() {
        console.log(params)
        socket.emit('host-join', params)
    })

    socket.on('showGamePin', function(data){
        setGamePin(data.pin)
    })

    socket.on('updatePlayerLobby', function(data) {
        setPlayers('')
        
        for (let i = 0; i < data.length; i++){
            setPlayers(`${players}${data[i].name}\n`)
        }
    })

    const startGame = () => {
        socket.emit('startGame')
    }

    const endGame = () => {
        window.location.href = "/"
    }

    return (
        <div className="host">
            <button id = "cancel" onClick = {endGame}>Cancel Game</button>
            <h2 id = "title">Join this Game using the Game Pin: </h2>
            <h1 id = "gamePinText">{gamePin}</h1>
            <textarea style = {{ width: '700px', height: '500px'}} readOnly id = "players" value = {players}></textarea>
            <br/>
            <button id = 'start' onClick = {startGame}>Start Game</button>
        </div>
    )
}

export default Host