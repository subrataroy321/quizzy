import React, { useState } from 'react';
import './HostGame.css'
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const HostGame = () => {

    let [question, setQuestion] = useState("")
    let [answer1, setAnswer1] = useState("")
    let [answer2, setAnswer2] = useState("")
    let [answer3, setAnswer3] = useState("")
    let [answer4, setAnswer4] = useState("")
    let [correctAnswer, setCorrectAnswer] = useState("")
    let [playerAnswered, setPlayerAnswered] = useState("")
    let [playersInGame, setPlayersInGame] = useState("")

    socket.on('connect', function() {
        var params = {id: urlParams.get('id')}
        socket.emit('host-join-game', params)
    })

    // socket.on('noGameFound', function(){
    //     window.location.href = '../../';//Redirect user to 'join game' page
    // });

    socket.on('gameQuestions', function(data) {
        console.log(data)
        setQuestion(data.q1)
        setAnswer1(data.a1)
        setAnswer2(data.a2)
        setAnswer3(data.a3)
        setAnswer4(data.a4)
        setCorrectAnswer(data.correct)
        setPlayersInGame(data.palyersInGame)
    })

    return (
        <div>
            <h4 id = "questionNum">Question 1 / </h4>
            <h4 id = "playersAnswered">Players Answered: {playerAnswered} / {playersInGame}</h4>
            <h3 id = "timerText">Time Left:<span id = "num"> 20</span></h3>
            
            <h2 id = "question">Q. {question}</h2>
            <h3 id = "answer1">1. {answer1}</h3>
            <br/>
            <h3 id = "answer2">2. {answer2}</h3>
            <br/>
            <h3 id = "answer3">3. {answer3}</h3>
            <br/>
            <h3 id = "answer4">4. {answer4}</h3>
            
            <br/>
            <button onclick = "nextQuestion()" id = "nextQButton">Next Question</button>
            
            <h2 id = "winnerTitle">Top 5 Players</h2>
            <h3 id = "winner1">1.</h3>
            <h3 id = "winner2">2.</h3>
            <h3 id = "winner3">3.</h3>
            <h3 id = "winner4">4.</h3>
            <h3 id = "winner5">5.</h3>
        </div>
    )
}

export default HostGame