import React, { useState } from 'react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const HostGame = () => {
    
    socket.on('connect', function() {
        var params = {id: urlParams.get('id')}
        socket.emit('host-join-game', params)
    })

    // socket.on('noGameFound', function(){
    //     window.location.href = '../../';//Redirect user to 'join game' page
    // });

    socket.on('gameQuestions', function(data) {
        console.log(data)
    })

    return (
        <div>
            <h1>Game Question</h1>
        </div>
    )
}

export default HostGame