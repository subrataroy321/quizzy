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
    let [time, setTime] = useState(60)
    let [showQuestion, setShowQuestion] = useState('')
    let [showQuestionData, setShowQuestionData] = useState('')
    let [showGraph, setShowGraph] = useState('')
    let [showNextB, setShowNextB] = useState('')
    let [podium, setPodium] = useState('')
    let [ans1, setAns1] = useState("")
    let [ans2, setAns2] = useState("")
    let [ans3, setAns3] = useState("")
    let [ans4, setAns4] = useState("")
    let [winner1, setWinner1] = useState('')
    let [winner2, setWinner2] = useState('')
    let [winner3, setWinner3] = useState('')
    let [winner4, setWinner4] = useState('')
    let [winner5, setWinner5] = useState('')
    let [winnerScore1, setWinnerScore1] = useState('')
    let [winnerScore2, setWinnerScore2] = useState('')
    let [winnerScore3, setWinnerScore3] = useState('')
    let [winnerScore4, setWinnerScore4] = useState('')
    let [winnerScore5, setWinnerScore5] = useState('')
    let timer

    socket.on('connect', function() {
        var params = {id: urlParams.get('id')}
        socket.emit('host-join-game', params)
    })

    // socket.on('noGameFound', function(){
    //     window.location.href = '../../';//Redirect user to 'join game' page
    // });

    socket.on('gameQuestions', function(data) {
        console.log(data)
        setShowQuestion('block')
        setShowQuestionData('block')
        setShowGraph('none')
        setShowNextB('none')
        setPodium('none')
        setQuestion(data.q1)
        setAnswer1(data.a1)
        setAnswer2(data.a2)
        setAnswer3(data.a3)
        setAnswer4(data.a4)
        setCorrectAnswer(data.correct)
        setPlayerAnswered(data.playerAnswered)
        setPlayersInGame(data.palyersInGame)
        updateTimer()
    })

    socket.on('updatePlayerAnswered', function(data) {
        setPlayerAnswered(data.playerAnswered)
        setPlayersInGame(data.playersInGame)
    })

    socket.on('questionOver', function(playerData, correct){
        clearInterval(timer)
        let a1 = 0
        let a2 = 0
        let a3 = 0
        let a4 = 0
        let total = 0
        setShowQuestion('none')
        
        
        if(correct === 1) {
            setAnswer1(`&#10004 ${answer1}`)
        }else if(correct === 2) {
            setAnswer2(`&#10004 ${answer2}`)
        }else if(correct === 3) {
            setAnswer3(`&#10004 ${answer3}`)
        }else if(correct === 4) {
            setAnswer4(`&#10004 ${answer4}`)
        }

        // find the which answer is selected most by players
        for (let i = 0; i < playerData.length; i++) {
            if(playerData[i].gameData.answer === 1){
                a1 += 1;
            }else if(playerData[i].gameData.answer === 2){
                a2 += 1;
            }else if(playerData[i].gameData.answer === 3){
                a3 += 1;
            }else if(playerData[i].gameData.answer === 4){
                a4 += 1;
            }
            total += 1;
        }

        //set values for graph
        setAns1(a1 / total * 100)
        setAns2(a2 / total * 100)
        setAns3(a3 / total * 100)
        setAns4(a4 / total * 100)
        
        setShowGraph('inline-block')
        setShowNextB('block')

    })

    function nextQuestion() {
        setShowNextB('none')
        setShowGraph('none')
        setShowQuestion('block')
        setTime(60)
        socket.emit('nextQuestion')
    }

    function updateTimer(){
        //setTime(60)
        timer = setInterval(function(){
            console.log(time)
            let newTime = parseInt(time) - 1
            console.log(newTime)
            setTime(newTime)
            console.log(time)
            if(time === 0) {
                socket.emit('timeUp')
            }
        }, 1000)

    }

    socket.on('GameOver', function(data){
        setShowNextB('none')
        setShowGraph('none')
        setShowQuestion('none')
        setShowQuestionData('none')
        setPodium('block')
        setWinner1(data.num1)
        setWinner2(data.num2)
        setWinner3(data.num3)
        setWinner4(data.num3)
        setWinner5(data.num5)
        setWinnerScore1(data.score1)
        setWinnerScore2(data.score2)
        setWinnerScore3(data.score3)
        setWinnerScore4(data.score3)
        setWinnerScore5(data.score5)

    })

    socket.on('getTime', function(player){
        socket.emit('time', {
            player: player,
            time: time
        })
    })

    return (
        <div className="hostGame">
            <div style={{display: `${showQuestion}`}}>
                <h4 id = "questionNum" >Question 1 / </h4>
                <h4 id = "playersAnswered" >Players Answered: {playerAnswered} / {playersInGame}</h4>
                <h3 id = "timerText" >Time Left:<span id = "num">{time}</span></h3>
            </div>
            <div >
                <div className = "square" id = "square1" style={{display: `${showGraph}`, height: `${ans1}px`}}></div>
                <div className = "square" id = "square2" style={{display: `${showGraph}`, height: `${ans2}px`}}></div>
                <div className = "square" id = "square3" style={{display: `${showGraph}`, height: `${ans3}px`}}></div>
                <div className = "square" id = "square4" style={{display: `${showGraph}`, height: `${ans4}px`}}></div>
            </div>
            <div style={{display: `${showQuestionData}`}}>
                <h2 id = "question" >Q. {question}</h2>
                <h3 id = "hostanswer1" >1. {answer1}</h3>
                <br/>
                <h3 id = "hostanswer2" >2. {answer2}</h3>
                <br/>
                <h3 id = "hostanswer3" >3. {answer3}</h3>
                <br/>
                <h3 id = "hostanswer4" >4. {answer4}</h3>
                <br/>
                <button onClick = {nextQuestion} id = "nextQButton" style={{display: `${showNextB}`}} >Next Question</button>
            </div>
                
            <div style={{display: `${podium}`}}>
                <h2 id = "winnerTitle" >Top 5 Players</h2>
                <h3 id = "winner1" >1. {winner1} (Score: {winnerScore1})</h3>
                <h3 id = "winner2" >2. {winner2} (Score: {winnerScore2})</h3>
                <h3 id = "winner3" >3. {winner3} (Score: {winnerScore3})</h3>
                <h3 id = "winner4" >4. {winner4} (Score: {winnerScore4})</h3>
                <h3 id = "winner5" >5. {winner5} (Score: {winnerScore5})</h3>
            </div>
        </div>
    )
}

export default HostGame