import React, { useState, useEffect } from "react"
import './CreateGame.css'
import { useAlert } from "react-alert"
import {Image, CloudinaryContext} from 'cloudinary-react';
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const CLOUD_NAME = process.env.REACT_APP_CLOUD_NAME
const CLOUD_PRESET = process.env.REACT_APP_CLOUD_PRESET
const GOOGLE_SEARCH_API_KEY = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY
const socket = socketIOClient(ENDPOINT)

const CreateGame = (props) => {
  const alert = useAlert()

  // state variables
  let [questionNum, setQuestionNum] = useState(1) //Starts at two because question 1 is already present
  let [questionsArray, setQuestionsArray] = useState([])
  let [quizTitle, setQuizTitle] = useState("")
  let [question, setQuestion] = useState("")
  let [answer1, setAnswer1] = useState("")
  let [answer2, setAnswer2] = useState("")
  let [answer3, setAnswer3] = useState("")
  let [answer4, setAnswer4] = useState("")
  let [correctAnswer, setCorrectAnswer] = useState("")
  let [randomColor, setRandomColor] = useState("")
  let [imageId, setImageId] = useState("")

  // handles user inputs and set it to state variables
  const handleQuizTitle = (e) => {
    setQuizTitle(e.target.value)
  }

  const handleQuestion = (e) => {
    setQuestion(e.target.value)
  }

  const handleAnswer1 = (e) => {
    setAnswer1(e.target.value)
  }

  const handleAnswer2 = (e) => {
    setAnswer2(e.target.value)
  }

  const handleAnswer3 = (e) => {
    setAnswer3(e.target.value)
  }

  const handleAnswer4 = (e) => {
    setAnswer4(e.target.value)
  }

  const handleCorrectAnswer = (e) => {
    setCorrectAnswer(e.target.value)
  }

  // cloudinary Widget
  var myWidget = window.cloudinary.createUploadWidget({
    cloudName: CLOUD_NAME, 
    uploadPreset: CLOUD_PRESET,
    sources: [ 'local', 'url', 'image_search', 'camera', 'dropbox', 'facebook', 'instagram', 'google_drive'],
    googleApiKey: GOOGLE_SEARCH_API_KEY ,
    searchBySites: ["all", "cloudinary.com"],
    searchByRights: true }, (error, result) => { 
      if (!error && result && result.event === "success") { 
        setImageId(result.info.public_id)
      }
    }
  )

  function showWidget() {
    myWidget.open();
  }

  // adds quiz with quentions to database
  function updateDatabase() {
    addToQuestionsArray()
    var quiz = {
      id: 0,
      userId: props.user.id,
      name: quizTitle,
      questions: questionsArray,
    }
    socket.emit("newQuiz", quiz)
  }

  // function to add question to question array
  function addToQuestionsArray() {
    let questionObject = {
      question: question,
      answers: [answer1, answer2, answer3, answer4],
      correct: correctAnswer,
      imageId: imageId
    }
    let temp = questionsArray
    temp.push(questionObject)
    setQuestionsArray(temp)
  }

  // calls addToQuestionsArray() and empty all variable
  function addQuestion(e) {
    e.preventDefault()
    addToQuestionsArray()
    setQuestionNum(parseInt(questionNum) + 1)
    setQuestion("")
    setAnswer1("")
    setAnswer2("")
    setAnswer3("")
    setAnswer4("")
    setCorrectAnswer("")
  }

  //Called when user wants to exit quiz creator
  function cancelQuiz() {
    setQuestionsArray([])
    setQuestionNum(1)
    setQuestion("")
    setAnswer1("")
    setAnswer2("")
    setAnswer3("")
    setAnswer4("")
    setCorrectAnswer("")
    setQuizTitle("")
  }

  // set a random color
  function chooseRandomColor() {
    var colors = ["#4CAF50", "#f94a1e", "#3399ff", "#ff9933"]
    var randomNum = Math.floor(Math.random() * 4)
    setRandomColor(colors[randomNum])
  }

  // on start game redirect to host lobby
  socket.on("startGameFromCreator", function (data) {
    window.location.href = "../../host/?id=" + data
  })

  useEffect(() => {
    chooseRandomColor()
  }, [])

  return (
    <div id="creatorStudio">
        <h1 id="title">Quizzy Creator Studio</h1>
        <div className="form-field">
          <label id="quizTitle">Quiz Title: </label>
          <input
            id="name"
            type="text"
            name="name"
            onChange={handleQuizTitle}
            value={quizTitle}
            autoFocus
          />
        </div>
        <div>
          <h3>Questions Added</h3>
          {questionsArray.map((question, i) => {
            return (
              <div style={{ backgroundColor: randomColor }}>
                <p>
                  {questionNum}. {question.question}
                </p>
              </div>
            )
          })}
        </div>
        <br />
        <div style={{ backgroundColor: randomColor, paddingBottom: "15px" }}>
          <div id="allQuestions">
            <form id="question-field" onSubmit={addQuestion}>
              <CloudinaryContext cloudName={CLOUD_NAME}>
                <div>
                  <Image publicId={imageId} style={{width: '70%'}} crop="scale" />
                </div>
              </CloudinaryContext>
              <button id="upload_widget" class="cloudinary-button" onClick={showWidget}>Upload an Image</button>
              <label>Question 1: </label>
              <input
                className="question"
                id="q1"
                type="text"
                onChange={handleQuestion}
                value={question}
                autoFocus
                required
              />
              <br />
              <br />
              <label>Answer 1: </label>
              <input
                id="1a1"
                className="answer"
                type="text"
                onChange={handleAnswer1}
                value={answer1}
                autoFocus
                required
              />
              <span> </span>
              <label>Answer 2: </label>
              <input
                id="1a2"
                className="answer"
                type="text"
                onChange={handleAnswer2}
                value={answer2}
                autoFocus
                required
              />
              <br />
              <label>Answer 3: </label>
              <input
                id="1a3"
                className="answer"
                type="text"
                onChange={handleAnswer3}
                value={answer3}
                autoFocus
                required
              />
              <span> </span>
              <label>Answer 4: </label>
              <input
                id="1a4"
                className="answer"
                type="text"
                onChange={handleAnswer4}
                value={answer4}
                autoFocus
                required
              />
              <br />
              <br />
              <p>Choose Correct Answer:</p>
              <div className="correct">
                <div>
                    <input type="radio" id="a1" name="drone" value="1"  onClick={handleCorrectAnswer} required/>
                    <label for="a1">Answer 1</label>
                  </div>

                  <div>
                    <input type="radio" id="a2" name="drone" value="2" onClick={handleCorrectAnswer}/>
                    <label for="a2">Answer 2</label>
                  </div>

                  <div>
                    <input type="radio" id="a3" name="drone" value="3" onClick={handleCorrectAnswer}/>
                    <label for="a3">Answer 3</label>
                  </div>
                  <div>
                    <input type="radio" id="a4" name="drone" value="4" onClick={handleCorrectAnswer}/>
                    <label for="a4">Answer 4</label>
                  </div>
              </div>
              <button type="submit" >Add another question</button>
            </form>
          </div>

          <div className="form-field">
            <button onClick={updateDatabase}>Create Quiz</button>
          </div>

          <br />
          <button onClick={cancelQuiz}>Cancel quiz</button>
          <p style={{ fontSize: "15px" }}>
            <strong>Warning: </strong> This will remove all the questions data
          </p>
        </div>
    </div>
  )
}

export default CreateGame
