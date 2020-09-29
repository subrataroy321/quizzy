import React, { useEffect } from 'react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)
var params = {name: urlParams.get('name'), pin: urlParams.get('pin')}

const Player = () => {

    useEffect(()=> {
        socket.on('connect', function() {
            socket.emit('player-join', params)
        })
    }, [])

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