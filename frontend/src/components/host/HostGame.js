import React, { useEffect, useState } from 'react';
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
    let [time, setTime] = useState(30)
    let [showQuestion, setShowQuestion] = useState('block')
    let [showQuestionData, setShowQuestionData] = useState('block')
    let [showGraph, setShowGraph] = useState('none')
    let [showNextB, setShowNextB] = useState('none')
    let [showEndGB, setShowEndGB] = useState('none')
    let [podium, setPodium] = useState('none')
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
    let [message, setMessage] = useState('')
    let [topPlayers, setTopPlayers] = useState('')
    let timer

    socket.on('connect', function() {
        var params = {id: urlParams.get('id')}
        socket.emit('host-join-game', params)
    })

    // socket.on('noGameFound', function(){
    //     window.location.href = '../../';//Redirect user to 'join game' page
    // });

    socket.on('gameQuestions', function(data) {
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
        setTime(20)
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
            setAnswer1(`✔ ${answer1}`)
            setAnswer2(`✘ ${answer2}`)
            setAnswer3(`✘ ${answer3}`)
            setAnswer4(`✘ ${answer4}`)
        }else if(correct === 2) {
            setAnswer1(`✘ ${answer1}`)
            setAnswer2(`✔ ${answer2}`)
            setAnswer3(`✘ ${answer3}`)
            setAnswer4(`✘ ${answer4}`)
        }else if(correct === 3) {
            setAnswer1(`✘ ${answer1}`)
            setAnswer2(`✘ ${answer2}`)
            setAnswer3(`✔ ${answer3}`)
            setAnswer4(`✘ ${answer4}`)
        }else if(correct === 4) {
            setAnswer1(`✘ ${answer1}`)
            setAnswer2(`✘ ${answer2}`)
            setAnswer3(`✘ ${answer3}`)
            setAnswer4(`✔ ${answer4}`)
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
        //setTime(60)
        socket.emit('nextQuestion')
    }

    useEffect(() => {
        if(time === 20) {
            timer = setInterval(() => {
                setTime(time => time - 1)
            } , 1000)
        } else if (time === 0) {
            socket.emit('timeUp')
        }
    }, [time])

    socket.on('GameOver', function(data){
        setShowNextB('none')
        setShowEndGB('block')
        setShowGraph('none')
        setShowQuestion('none')
        setShowQuestionData('none')
        setMessage('GAME OVER')
        if (!data.num1) {
            setTopPlayers('NO PLAYERS JOINED THE GAME')
        }
        if (data.num1) {
            setPodium('block')
            setTopPlayers('Top 5 Players')
            setWinner1(data.num1)
            setWinnerScore1(data.score1)
        } else if (data.num2) {
            setPodium('block')
            setTopPlayers('Top 5 Players')
            setWinner1(data.num1)
            setWinner2(data.num2)
            setWinnerScore1(data.score1)
            setWinnerScore2(data.score2)
        } else if (data.num3) {
            setPodium('block')
            setTopPlayers('Top 5 Players')
            setWinner1(data.num1)
            setWinner2(data.num2)
            setWinner3(data.num3)
            setWinnerScore1(data.score1)
            setWinnerScore2(data.score2)
            setWinnerScore3(data.score3)
        } else if (data.num4) {
            setPodium('block')
            setTopPlayers('Top 5 Players')
            setWinner1(data.num1)
            setWinner2(data.num2)
            setWinner3(data.num3)
            setWinner4(data.num4)
            setWinnerScore1(data.score1)
            setWinnerScore2(data.score2)
            setWinnerScore3(data.score3)
            setWinnerScore4(data.score4)
        } else if (data.num5) {
            setPodium('block')
            setTopPlayers('Top 5 Players')
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
        }

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
            <div className="squareDiv">
                <div className = "square" id = "square1" style={{display: `${showGraph}`, height: `${ans1}px`}}></div>
                <div className = "square" id = "square2" style={{display: `${showGraph}`, height: `${ans2}px`}}></div>
                <div className = "square" id = "square3" style={{display: `${showGraph}`, height: `${ans3}px`}}></div>
                <div className = "square" id = "square4" style={{display: `${showGraph}`, height: `${ans4}px`}}></div>
            </div>
            <div style={{display: `${showQuestionData}`}}>
                <h2 id = "question" >Q. {question}</h2>
                <div className = "hostanswer hostanswer1" ><span className="optionShape1 option">▲</span> <h3 className="option optionAnswer">{answer1}</h3></div>
                <br/>
                <div className = "hostanswer hostanswer2" ><span className="optionShape2 option">◆</span> <h3 className="option optionAnswer">{answer2}</h3></div>
                <br/>
                <div className = "hostanswer hostanswer3" ><span className="optionShape3 option">●</span> <h3 className="option optionAnswer">{answer3}</h3></div>
                <br/>
                <div className = "hostanswer hostanswer4" ><span className="optionShape4 option">◼</span><h3 className="option optionAnswer">{answer4}</h3></div>
                <br/>
                <button onClick = {nextQuestion} id = "nextQButton" style={{display: `${showNextB}`}} >Next Question</button>
            </div>
            <h3 id = "winnerTitle">{message}</h3>
            <h2 id = "winnerTitle" >{topPlayers}</h2>
            <div style={{display: `${podium}`}}>
                <h3 id = "winner" >1. {winner1} (Score: {winnerScore1})</h3>
                <h3 id = "winner" >2. {winner2} (Score: {winnerScore2})</h3>
                <h3 id = "winner" >3. {winner3} (Score: {winnerScore3})</h3>
                <h3 id = "winner" >4. {winner4} (Score: {winnerScore4})</h3>
                <h3 id = "winner" >5. {winner5} (Score: {winnerScore5})</h3>
            </div>
                <a id="goBack" style={{display: `${showEndGB}`}} href="/profile">END GAME</a>
        </div>
    )
}

export default HostGame