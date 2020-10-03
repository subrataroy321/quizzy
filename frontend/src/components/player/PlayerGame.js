import React, {useEffect, useState} from 'react';
import './PlayerGame.css'
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
let urlParams = new URLSearchParams(window.location.search)

const PlayerGame = () => {
    let [visibility, setVisibility] = useState('')
    let [message, setMessage] = useState('')
    let [backgroundColor, setBackgroundColor] = useState('transparent')
    let [name, setName] = useState('')
    let [score, setScore] = useState('')
    let playerAnswered = false
    let correct = false
    
    useEffect(()=> {
        socket.on('connect', function() {
            let params = {id: urlParams.get('id')}
            socket.emit('player-join-game', params);
            setVisibility('visible')
        })
    }, [])

    socket.on('noGameFound', function(){
        window.location.href = '../../'; 
    });

    function answerSubmitted(num) {
        if(playerAnswered === false) {
            playerAnswered = true

            socket.emit('playerAnswer', num)

            setVisibility('hidden')
            setMessage('Answer Submitted!\n Waiting on other players...')
        }
    }

    socket.on('answerResult', function(data){
        if(data === true){
            correct = true;
        }
    });

    socket.on('questionOver', function() {
        if (correct === true) {
            setBackgroundColor('#4CAF50')
            setMessage('Correct')
            setVisibility('hidden')
        } else {
            setBackgroundColor('#f94a1e')
            setMessage('Incorrect')
            setVisibility('hidden')
        }
        socket.emit('getScore')
    })

    socket.on('newScore', function(data){
        setScore(data)
    })

    socket.on('nextQuestionPlayer', function(){
        correct = false;
        playerAnswered = false;
        setMessage('')
        setVisibility('visible')
        setBackgroundColor('transparent')
        
    });

    socket.on('hostDisconnect', function(){
        window.location.href = "../../";
    });

    socket.on('playerGameData', function(data){
        for(var i = 0; i < data.length; i++){
            if(data[i].playerId === socket.id){
                setName(data[i].name)
                setScore(data[i].gameData.score)
            }
        }
    });

    socket.on('GameOver', function(){
        setBackgroundColor('transparent')
        setVisibility('hidden')
        setMessage('GAME OVER')
    })
     

    return (
        <div classNameName="playerGame" style={{backgroundColor: `${backgroundColor}`}}>
            <div id = "stats">
                <h4 id = "nameText">Name: {name}</h4>
                <h4 id = "scoreText">Score: {score}</h4>
            </div>
            <h2 id = "message">{message}</h2>
            <div className="playerOptions" style={{visibility: `${visibility}`}}>
                <button onClick = {()=> answerSubmitted(1)} id = "playeranswer1"  className = "button"><span id="optionShape1">▲</span></button>
                <button onClick = {() => answerSubmitted(2)} id = "playeranswer2" className = "button"><span id="optionShape2">◆</span></button>
                <button onClick = {() => answerSubmitted(3)} id = "playeranswer3" className = "button"><span id="optionShape3">●</span></button>
                <button onClick = {() => answerSubmitted(4)} id = "playeranswer4" className = "button"><span id="optionShape4">◼</span></button>
            </div>
        </div>
    )
}

export default PlayerGame