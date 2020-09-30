import React from 'react';
import {useAlert} from 'react-alert'
import './Player.css'
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const Player = () => {
    const alert = useAlert()
    
    socket.on('connect', function() {
        var params = {name: urlParams.get('name'), pin: urlParams.get('pin')}
        socket.emit('player-join', params)
    })
    
    socket.on('noGamesFound', function(){
        alert.show('No Games Found. Try Again!')
        setTimeout(function(){window.location.href = '../'}, 5000)
    });

    return (
        <div className="player">
            <h1 id = "title1">Waiting on host to start game</h1>
            <h3 id = "title2">Do you see your name on the screen?</h3>
            <br/>
            <div className="loader"></div>
        </div>
    )
}

export default Player