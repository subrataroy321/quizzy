import React from 'react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const Player = () => {
    
    socket.on('connect', function() {
        var params = {name: urlParams.get('name'), pin: urlParams.get('pin')}
        socket.emit('player-join', params)
    })
    
    socket.on('noGameFound', function(){
        window.location.href = '../';
    });

    return (
        <div>
            <h3>Check your name on the screen.</h3>
        </div>
    )
}

export default Player