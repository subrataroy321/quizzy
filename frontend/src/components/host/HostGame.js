import React, { useEffect, useState } from "react"
import "./HostGame.css"
import socketIOClient from "socket.io-client"
import { Image, CloudinaryContext } from "cloudinary-react"

// import local audios
import audio1 from "../../assets/audios/audio1.mp3"
import audio2 from "../../assets/audios/audio2.mp3"
import audio3 from "../../assets/audios/audio3.mp3"
import audio5 from "../../assets/audios/audio5.mp3"
import audio6 from "../../assets/audios/audio6.mp3"
import audio7 from "../../assets/audios/audio7.mp3"
import audio8 from "../../assets/audios/audio8.mp3"
import player_answered from "../../assets/audios/player_answered.mp3"
import TheEnd from "../../assets/audios/TheEnd.mp3"

// import local gif images
import gif_1 from "../../assets/gifs/giphy.gif"
import gif_2 from "../../assets/gifs/giphy(1).gif"
import gif_3 from "../../assets/gifs/giphy(2).gif"
import gif_4 from "../../assets/gifs/giphy(3).gif"
import gif_5 from "../../assets/gifs/giphy(4).gif"
import gif_6 from "../../assets/gifs/giphy(5).gif"

const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)
var urlParams = new URLSearchParams(window.location.search)

const HostGame = () => {

  // state variables
  let [audio, setAudio] = useState()
  let [audioMuted, setAudioMuted] = useState(false)
  let [answerAudio, setAnswerAudio] = useState("")
  let [questionOverAudio, setQuestionOverAudio] = useState("")
  let [question, setQuestion] = useState("")
  let [questionNum, setQuestionNum] = useState(0)
  let [totalQuestions, setTotalQuestions] = useState(0)
  let [questionImage, setQuestionImage] = useState("")
  let [hasQuestionImage, setHasQuestionImage] = useState(false)
  let [answer1, setAnswer1] = useState("")
  let [answer2, setAnswer2] = useState("")
  let [answer3, setAnswer3] = useState("")
  let [answer4, setAnswer4] = useState("")
  let [playerAnswered, setPlayerAnswered] = useState(0)
  let [playersInGame, setPlayersInGame] = useState(0)
  let [time, setTime] = useState(100)
  let [showQuestion, setShowQuestion] = useState("block")
  let [showQuestionImage, setShowQuestionImage] = useState("block")
  let [showQuestionData, setShowQuestionData] = useState("block")
  let [showGraph, setShowGraph] = useState("none")
  let [showNextB, setShowNextB] = useState("none")
  let [showEndGB, setShowEndGB] = useState("none")
  let [podium, setPodium] = useState("none")
  let [ans1, setAns1] = useState("")
  let [ans2, setAns2] = useState("")
  let [ans3, setAns3] = useState("")
  let [ans4, setAns4] = useState("")
  let [winner1, setWinner1] = useState("")
  let [winner2, setWinner2] = useState("")
  let [winner3, setWinner3] = useState("")
  let [winner4, setWinner4] = useState("")
  let [winner5, setWinner5] = useState("")
  let [winnerScore1, setWinnerScore1] = useState("")
  let [winnerScore2, setWinnerScore2] = useState("")
  let [winnerScore3, setWinnerScore3] = useState("")
  let [winnerScore4, setWinnerScore4] = useState("")
  let [winnerScore5, setWinnerScore5] = useState("")
  let [message, setMessage] = useState("")
  let [topPlayers, setTopPlayers] = useState("")
  let timer

  let gifs = [gif_1, gif_2, gif_3, gif_4, gif_5, gif_6]
  let audios = [audio1, audio2, audio3, audio5, audio6, audio7, audio8]
  function setRandomAudio() {
    let randomNum = Math.floor(Math.random() * 8)
    setAudio(audios[randomNum])
  }

  useEffect(() => {
    // host starts a game from game lobby
    socket.on("connect", function () {
      var params = { id: urlParams.get("id") }
      socket.emit("host-join-game", params)
    })
  }, [])

  socket.on("noGameFound", function () {
    window.location.href = "../../" //Redirect user to 'join game' page
  })

  useEffect(() => {
    // when get question data from server
    socket.on("gameQuestions", function (data) {
      setQuestionOverAudio("")
      setAudioMuted(false)
      setRandomAudio()
      setShowQuestion("block")
      setShowQuestionImage("block")
      setShowQuestionData("block")
      setShowGraph("none")
      setShowNextB("none")
      setPodium("none")
      setQuestion(data.q1)
      setAnswer1(data.a1)
      setAnswer2(data.a2)
      setAnswer3(data.a3)
      setAnswer4(data.a4)
      setPlayerAnswered(data.playerAnswered)
      setPlayersInGame(data.playersInGame)
      setTotalQuestions(data.totalQuestions)
      setQuestionNum(data.questionNum)
      setTime(30)

      // if question image exist then set the image else set an local image
      if (data.imageId) {
        setQuestionImage(data.imageId)
        setShowQuestionImage("block")
        setHasQuestionImage(true)
      } else {
        let randomNum = Math.floor(Math.random() * 8)
        setQuestionImage(gifs[randomNum])
      }
    })
  }, [])

  // when a player answers update
  socket.on("updatePlayerAnswered", function (data) {
    setAnswerAudio(player_answered)
    setPlayerAnswered(data.playersAnswered)
    setPlayersInGame(data.playersInGame)
    setTimeout(function () {
      setAnswerAudio("")
    }, 500)
  })

  // on question timer is 0
  socket.on("questionOver", function (playerData, correct) {
    clearInterval(timer) // stops the timer
    setAudioMuted(true)
    setQuestionOverAudio(TheEnd)
    let a1 = 0
    let a2 = 0
    let a3 = 0
    let a4 = 0
    let total = 0
    setShowQuestion("none")

    if (!hasQuestionImage) {
      setShowQuestionImage("none")
    }

    // shows correct answer
    if (parseInt(correct) === 1) {
      setAnswer1(`✔ ${answer1}`)
      setAnswer2(`✘ ${answer2}`)
      setAnswer3(`✘ ${answer3}`)
      setAnswer4(`✘ ${answer4}`)
    } else if (parseInt(correct) === 2) {
      setAnswer1(`✘ ${answer1}`)
      setAnswer2(`✔ ${answer2}`)
      setAnswer3(`✘ ${answer3}`)
      setAnswer4(`✘ ${answer4}`)
    } else if (parseInt(correct) === 3) {
      setAnswer1(`✘ ${answer1}`)
      setAnswer2(`✘ ${answer2}`)
      setAnswer3(`✔ ${answer3}`)
      setAnswer4(`✘ ${answer4}`)
    } else if (parseInt(correct) === 4) {
      setAnswer1(`✘ ${answer1}`)
      setAnswer2(`✘ ${answer2}`)
      setAnswer3(`✘ ${answer3}`)
      setAnswer4(`✔ ${answer4}`)
    }

    // find the which answer is selected most by players
    for (let i = 0; i < playerData.length; i++) {
      if (playerData[i].gameData.answer === 1) {
        a1 += 1
      } else if (playerData[i].gameData.answer === 2) {
        a2 += 1
      } else if (playerData[i].gameData.answer === 3) {
        a3 += 1
      } else if (playerData[i].gameData.answer === 4) {
        a4 += 1
      }
      total += 1
    }

    //set values for graph
    setAns1((a1 / total) * 100)
    setAns2((a2 / total) * 100)
    setAns3((a3 / total) * 100)
    setAns4((a4 / total) * 100)

    // set to show graph and next button
    setShowGraph("inline-block")
    setShowNextB("block")
  })

  // request for next question data
  const nextQuestion = () => {
    setShowNextB("none")
    setShowGraph("none")
    setShowQuestion("block")
    setShowQuestionImage("block")
    socket.emit("nextQuestion")
  }

  // timer
  useEffect(() => {
    if (time === 30) {
      timer = setInterval(() => {
        setTime((time) => time - 1)
      }, 1000)
    } else if (time === 0) {
      socket.emit("timeUp")
    }
  }, [time])

  // on game over/ ends
  socket.on("GameOver", function (data) {
    setShowNextB("none")
    setShowEndGB("block")
    setShowGraph("none")
    setShowQuestion("none")
    setShowQuestionData("none")
    setMessage("GAME OVER")
    if (!data.num1) {
      setTopPlayers("NO PLAYERS JOINED THE GAME")
    }

    // shows top 5 players if there was more than 5 players played
    if (data.num5) {
      setPodium("block")
      setTopPlayers("Top 5 Players")
      setWinner1(`1. ${data.num1}`)
      setWinner2(`2. ${data.num2}`)
      setWinner3(`3. ${data.num3}`)
      setWinner4(`4. ${data.num4}`)
      setWinner5(`5. ${data.num5}`)
      setWinnerScore1(`(Score: ${data.score1})`)
      setWinnerScore2(`(Score: ${data.score2})`)
      setWinnerScore3(`(Score: ${data.score3})`)
      setWinnerScore4(`(Score: ${data.score3})`)
      setWinnerScore5(`(Score: ${data.score5})`)
    } else if (data.num4) {
      setPodium("block")
      setTopPlayers("Top 5 Players")
      setWinner1(`1. ${data.num1}`)
      setWinner2(`2. ${data.num2}`)
      setWinner3(`3. ${data.num3}`)
      setWinner4(`4. ${data.num4}`)
      setWinnerScore1(`(Score: ${data.score1})`)
      setWinnerScore2(`(Score: ${data.score2})`)
      setWinnerScore3(`(Score: ${data.score3})`)
      setWinnerScore4(`(Score: ${data.score4})`)
    } else if (data.num3) {
      setPodium("block")
      setTopPlayers("Top 5 Players")
      setWinner1(`1. ${data.num1}`)
      setWinner2(`2. ${data.num2}`)
      setWinner3(`3. ${data.num3}`)
      setWinnerScore1(`(Score: ${data.score1})`)
      setWinnerScore2(`(Score: ${data.score2})`)
      setWinnerScore3(`(Score: ${data.score3})`)
    } else if (data.num2) {
      setPodium("block")
      setTopPlayers("Top 5 Players")
      setWinner1(`1. ${data.num1}`)
      setWinner2(`2. ${data.num2}`)
      setWinnerScore1(`(Score: ${data.score1})`)
      setWinnerScore2(`(Score: ${data.score2})`)
    }
    if (data.num1) {
      setPodium("block")
      setTopPlayers("Top 5 Players")
      setWinner1(`1. ${data.num1}`)
      setWinnerScore1(`(Score: ${data.score1})`)
    }
  })

  // when player send a request to get time
  socket.on("getTime", function (player) {
    socket.emit("time", {
      player: player,
      time: time,
    })
  })

  return (
    <div className="hostGame">
      <audio src={audio} muted={audioMuted} autoPlay loop />
      <audio src={answerAudio} autoPlay />
      <audio src={questionOverAudio} autoPlay />
      <div style={{ display: `${showQuestion}` }}>
        <div id="questionData">
          <h4 id="questionNum">
            Question: {questionNum} / {totalQuestions}{" "}
          </h4>
          <h4 id="playersAnswered">
            Players Answered: {playerAnswered} / {playersInGame}
          </h4>
          <h3 id="timerText">
            Time Left:<span id="num">{time}</span>
          </h3>
        </div>
      </div>
      <div className="squareDiv">
        <div
          className="square"
          id="square1"
          style={{ display: `${showGraph}`, height: `${ans1}px` }}
        ></div>
        <div
          className="square"
          id="square2"
          style={{ display: `${showGraph}`, height: `${ans2}px` }}
        ></div>
        <div
          className="square"
          id="square3"
          style={{ display: `${showGraph}`, height: `${ans3}px` }}
        ></div>
        <div
          className="square"
          id="square4"
          style={{ display: `${showGraph}`, height: `${ans4}px` }}
        ></div>
      </div>
      <div style={{ display: `${showQuestionData}` }}>
        <h2 id="question">Q. {question}</h2>
        {hasQuestionImage ? (
          <CloudinaryContext cloudName="subrataroy">
            <div>
              <Image
                publicId={questionImage}
                className="questionImage"
                style={{ display: `${showQuestionImage}` }}
                crop="scale"
              />
            </div>
          </CloudinaryContext>
        ) : (
          <img
            src={questionImage}
            className="questionImage"
            style={{ display: `${showQuestionImage}` }}
          />
        )}
        <div id="hostAnswers">
          <div className="hostanswer hostanswer1">
            <span className="optionShape1 option">▲</span>{" "}
            <h3 className="option optionAnswer">{answer1}</h3>
          </div>
          <div className="hostanswer hostanswer2">
            <span className="optionShape2 option">◆</span>{" "}
            <h3 className="option optionAnswer">{answer2}</h3>
          </div>
          <div className="hostanswer hostanswer3">
            <span className="optionShape3 option">●</span>{" "}
            <h3 className="option optionAnswer">{answer3}</h3>
          </div>
          <div className="hostanswer hostanswer4">
            <span className="optionShape4 option">◼</span>
            <h3 className="option optionAnswer">{answer4}</h3>
          </div>
        </div>
        <br />
        <button
          onClick={nextQuestion}
          id="nextQButton"
          style={{ display: `${showNextB}` }}
        >
          Next Question
        </button>
      </div>
      <h3 id="winnerTitle">{message}</h3>
      <h2 id="winnerTitle">{topPlayers}</h2>
      <div style={{ display: `${podium}` }}>
        <h3 id="winner">
          {winner1} {winnerScore1}
        </h3>
        <h3 id="winner">
          {winner2} {winnerScore2}
        </h3>
        <h3 id="winner">
          {winner3} {winnerScore3}
        </h3>
        <h3 id="winner">
          {winner4} {winnerScore4}
        </h3>
        <h3 id="winner">
          {winner5} {winnerScore5}
        </h3>
      </div>
      <a id="goBack" style={{ display: `${showEndGB}` }} href="/profile">
        END GAME
      </a>
    </div>
  )
}

export default HostGame