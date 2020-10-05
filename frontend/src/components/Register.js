import React, { useState } from "react"
import './Register.css'
import {useAlert} from 'react-alert'
import axios from "axios"
import { Redirect } from "react-router-dom"
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL

const Register = () => {
  const alert = useAlert()

  // state variables
  let [name, setName] = useState("")
  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")
  let [confirmPassword, setConfirmPassword] = useState("")
  let [redirect, setRedirect] = useState("")

  // handles input values
  const handleName = (e) => {
    setName(e.target.value)
  }

  const handleEmail = (e) => {
    setEmail(e.target.value)
  }

  const handlePassword = (e) => {
    setPassword(e.target.value)
  }

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password === confirmPassword) {
      const newUser = { name, email, password, confirmPassword }
  
      // on submit sends a user creation request with input datas
      axios
        .post(`${REACT_APP_SERVER_URL}/api/users/register`, newUser)
        .then((response) => {
          alert.show("Account Created Successfully!")
          console.log(response)
          setRedirect(true)
        })
        .catch((error) => {
          alert.show("Account Already Exists! Try with different Email!")
          console.log(error)
        })
  }

  if (redirect) return <Redirect to="/signin" />

  return (
    <div className="row mt-4 registerForm">
      <div className="col-md-7 offset-md-3">
        <div className="card card-body">
          <h2 className="py-2">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleName}
                className="form-control"
                required
              />
            </div>
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPassword}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary float-right">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
