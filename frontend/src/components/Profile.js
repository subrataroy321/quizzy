import "./Profile.css"
import React, { useState, useEffect } from "react"
import {useAlert} from 'react-alert'
import { Link } from "react-router-dom"
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)

const Profile = (props) => {
  const alert = useAlert()

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

  const userData = props.user ? (
    <div classNameName="text-center pt-4">
      <h1 className="profileTitle">Profile</h1>
      <p className="profileData">
        <strong>Name:</strong> {props.user.name}
        <span style={{ marginLeft: '2rem' }} > 
        <strong>Email:</strong> {props.user.email}
        </span>
      </p>
    </div>
  ) : (
    <h4>Loading...</h4>
  )

  const errorDiv = () => {
    return (
      <div classNameName="text-center pt-4">
        <h3>
          Please <Link to="/signin">Sign in</Link> to view this page
        </h3>
      </div>
    )
  }

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

  function updateDatabase() {
    addToQuestionsArray()
    var quiz = { id: 0, userId: props.user.id , name: quizTitle, questions: questionsArray }
    socket.emit("newQuiz", quiz)
  }

  function addToQuestionsArray() {
    let questionObject = {
      question: question,
      answers: [answer1, answer2, answer3, answer4],
      correct: correctAnswer,
    }
    let temp = questionsArray
    temp.push(questionObject)
    setQuestionsArray(temp)
  }

  function addQuestion() {
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
    window.location.href = "../"
  }

  function chooseRandomColor() {
    var colors = ["#4CAF50", "#f94a1e", "#3399ff", "#ff9933"]
    var randomNum = Math.floor(Math.random() * 4)
    setRandomColor(colors[randomNum])
  }

  socket.on("startGameFromCreator", function (data) {
    window.location.href = "../../host/?id=" + data
  })

  function checkCorrectAnswer() {
    if(correctAnswer <= 0 || correctAnswer > 4) {
      alert.show('Correct Answer must be between 1 to 4')
      setCorrectAnswer('')
    }
  }


  useEffect(() => {
    chooseRandomColor()
  }, [])

  return (
    <div className="profile">
      <div>{props.user ? userData : errorDiv()}</div>
      <a href="/savedQuizzys"><button>Saved Quizzes</button></a>
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
                {1}. {question.question}
              </p>
            </div>
          )
        })}
      </div>
      <br />
      <div style={{ backgroundColor: randomColor, paddingBottom: '15px' }}>
        <div id="allQuestions">
          <div id="question-field">
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
            <label>Correct Answer (1-4) :</label>
            <input
              className="correct"
              id="correct1"
              type="number"
              onChange={handleCorrectAnswer}
              value={correctAnswer}
              autoFocus
              onInput={checkCorrectAnswer}
              required
            />
          </div>
        </div>
        <button onClick={addQuestion}>Add another question</button>

        <div className="form-field">
          <button onClick={updateDatabase}>Create Quiz</button>
        </div>

        <br />
        <button onClick={cancelQuiz}>
          Cancel quiz and return to Home
        </button>
        <p style={{ fontSize: '15px'}}><strong>Warning: </strong> This will remove all the questions data</p>
      </div>
      <br/>
    </div>
  )
}

export default Profile
