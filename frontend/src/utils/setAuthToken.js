import axios from "axios"

// This utility will add the authorised user's JWT to request header
// Any routes that are protected will require the JWT in order to access token

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = token
  } else {
    delete axios.defaults.headers.common["Authorization"]
  }
}

export default setAuthToken
