import "./Profile.css"
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.REACT_APP_SERVER_URL
const socket = socketIOClient(ENDPOINT)

const Profile = (props) => {
  const userData = props.user ? (
    <div classNameName="text-center pt-4">
      <h1>Profile</h1>
      <p>
        <strong>Name:</strong> {props.user.name}
      </p>
      <p>
        <strong>Email:</strong> {props.user.email}
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
    console.log(questionObject)
    setQuestionsArray([...questionsArray, questionObject])
    console.log(questionsArray)
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

  socket.on("startGameFromCreator", function (data) {
    window.location.href = "../../host/?id=" + data
  })

  function chooseRandomColor() {
    var colors = ["#4CAF50", "#f94a1e", "#3399ff", "#ff9933"]
    var randomNum = Math.floor(Math.random() * 4)
    setRandomColor(colors[randomNum])
  }

  useEffect(() => {
    chooseRandomColor()
  }, [])

  return (
    <div className="profile">
      <div className="profileData">{props.user ? userData : errorDiv()}</div>
      <h1 id="title">Quiz Creator Studio</h1>
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
      <div style={{ backgroundColor: randomColor }}>
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
            />
            <label>Answer 2: </label>
            <input
              id="1a2"
              className="answer"
              type="text"
              onChange={handleAnswer2}
              value={answer2}
              autoFocus
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
            />
            <label>Answer 4: </label>
            <input
              id="1a4"
              className="answer"
              type="text"
              onChange={handleAnswer4}
              value={answer4}
              autoFocus
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
            />
          </div>
        </div>
        <button onClick={addQuestion}>Add another question</button>

        <div className="form-field">
          <button onClick={updateDatabase}>Create Quiz</button>
        </div>

        <br />

        <button onClick={cancelQuiz}>
          Cancel quiz and return to quiz selection
        </button>
      </div>
    </div>
  )
}

export default Profile
