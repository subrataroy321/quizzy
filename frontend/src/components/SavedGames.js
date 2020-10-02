import React, {useState} from 'react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)

const SavedGames = (props) => {
    let [savedGames, setSavedGames]= useState([])

    socket.on('connect', function(){
        socket.emit('requestDbNames', props.user.id);//Get database names to display to user
    });
    
    socket.on("gameNamesData", function(data) {
        setSavedGames(data)
    })

    return (
        <div>
            <div>
                <h1>Saved Quizzy's</h1>
                {savedGames.map((game, i) => {
                    return <a href={`/host/?id=${game.id}`} key={i}><h3>{game.name}</h3></a>
                })}
            </div>
        </div>
    )
}

export default SavedGames