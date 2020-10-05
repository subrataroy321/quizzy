import React, { useState } from "react"
import "./SignIn.css"
import { useAlert } from "react-alert"
import axios from "axios"
import jwt_decode from "jwt-decode"
import setAuthToken from "../utils/setAuthToken"
import { Redirect } from "react-router-dom"
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL

const Login = (props) => {
  const alert = useAlert()

  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")

  let handleEmail = (e) => {
    setEmail(e.target.value)
  }

  let handlePassword = (e) => {
    setPassword(e.target.value)
  }

  // on Submit sends a request to login
  let handleSubmit = (e) => {
    e.preventDefault()
    const userDate = { email, password }
    // makes login in request to our server
    axios
      .post(`${REACT_APP_SERVER_URL}/api/users/login`, userDate)
      .then((response) => {
        const { token } = response.data
        // Save token to localStorage
        localStorage.setItem("jwtToken", token)
        // Set token to auth header
        setAuthToken(token)
        // Decode token to get the user data
        const decoded = jwt_decode(token)
        // set current user
        props.nowCurrentUser(decoded)
        alert.show("Successfully LogedIn")
      })
      .catch((error) => {
        alert.show("Email or Password Incorrect!")
        console.log("Login error", error)
      })
  }

  // if user exists redirect to profile
  if (props.user) return <Redirect to="/profile" user={props.user} />

  return (
    <div className="row mt-4 signInForm">
      <div className="col-md-7 offset-md-3">
        <div className="card card-body">
          <h2 className="py-2">Log in</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleEmail}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handlePassword}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary float-right">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
