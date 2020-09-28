import React, { useState, useEffect } from "react"
import "./App.css"
import { Switch, Route, Redirect } from "react-router-dom"
import jwt_decode from 'jwt-decode'
import setAuthToken from './utils/setAuthToken'

import Welcome from "./components/Welcome"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Profile from "./components/Profile"

const PrivateRoute = ({component: Component, ...rest}) => {
  const user = localStorage.getItem('jwtToken')
  return <Route {...rest} render={(props) => {
    return (
      user 
      ? 
      <Component {...rest} {...props} /> 
      : 
      <Redirect to="/login" />
      )
  }} />
}

function App() {
  let [currentUser, setCurrentUser] = useState('')
  let [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let token
    if (!localStorage.getItem('jwtToken')) {
      setIsAuthenticated(false)
    } else {
      token = jwt_decode(localStorage.getItem('jwtToken'))
      setAuthToken(localStorage.jwtToken)
      setCurrentUser(token)
      setIsAuthenticated(true)
    }
  })

  let nowCurrentUser = (userData) => {
    console.log('nowCurrentUser is working...')
    setCurrentUser(userData)
    setIsAuthenticated(true)
  }

  let handleLogout = () => {
    if(localStorage.getItem('jwtToken')){
      localStorage.removeItem('jwtToken')
      setCurrentUser('')
      setIsAuthenticated(false)
    }
  }

  return (
    <div className="App">
      <Navbar handleLogout={handleLogout} isAuth={isAuthenticated} />
      <div className="container mt-5">
        <Switch>
          <PrivateRoute path='/profile' component={Profile} user={currentUser} />
          <Route exact path="/" component={Welcome} />
        </Switch>
      </div>
      <Footer />
    </div>
  )
}

export default App
