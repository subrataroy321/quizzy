import React, {useState} from 'react';
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
    
    socket.on('connect', function() {
        let params = {id: urlParams.get('id')}
        socket.emit('player-join-game', params);
        setVisibility('visible')
    })

    socket.on('noGameFound', function(){
        window.location.href = '../../'; 
    });

    function answerSubmitted(num) {
        if(playerAnswered === false) {
            playerAnswered = true

            socket.emit('playerAnswer', num)

            setVisibility('hidden')
            setMessage('Answer Submitted! Waiting on other players...')
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
        } else {
            setBackgroundColor('f94a1e')
            setMessage('Incorrect')
        }
        socket.emit('getScore')
    })

    socket.on('newScore', function(data){
        setScore(data)
    })

    socket.on('nextQuestionPlayer', function(){
        correct = false;
        playerAnswered = false;

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
        setBackgroundColor('#FFFFFF')
        setVisibility('hidden')
        setMessage('GAME OVER')
    })
     

    return (
        <div classNameName="playerGame" style={{backgroundColor: `${backgroundColor}`}}>
            <div id = "stats">
                <h4 id = "nameText">Name: {name}</h4>
                <h4 id = "scoreText">Score: {score}</h4>
                <h4 id = "rankText"></h4>
            </div>
            <h2 id = "message">{message}</h2>
            <button onClick = {()=> answerSubmitted(1)} id = "playeranswer1" style={{visibility: `${visibility}`}} className = "button"></button>
            <button onClick = {() => answerSubmitted(2)} id = "playeranswer2" style={{visibility: `${visibility}`}} className = "button"></button>
            <br/>
            <button onClick = {() => answerSubmitted(3)} id = "playeranswer3" style={{visibility: `${visibility}`}} className = "button"></button>
            <button onClick = {() => answerSubmitted(4)} id = "playeranswer4" style={{visibility: `${visibility}`}} className = "button"></button>
        </div>
    )
}

export default PlayerGame