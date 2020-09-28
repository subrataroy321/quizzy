import React from "react"
import "./App.css"
import { Switch, Route, Redirect } from 'react-router-dom'

import Welcome from './components/Welcome'

function App() {
  return (
    <div className="App">
      <div>
        <Switch>
          <Route exact path="/" component={Welcome}/>
        </Switch>
      </div>
    </div>
  )
}

export default App
