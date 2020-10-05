import "./Profile.css"
import React, {useState, useEffect} from "react"
import axios from 'axios'
import { useAlert } from "react-alert"
import placeHolder from '../assets/images/placeholder-male.jpg'
import {Image, CloudinaryContext} from 'cloudinary-react';
import { Link } from "react-router-dom"
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL
const CLOUD_NAME = process.env.REACT_APP_CLOUD_NAME
const CLOUD_PRESET_PROFILE = process.env.REACT_APP_CLOUD_PRESET_PROFILE

const Profile = (props) => {
  const alert = useAlert()

  // state variables
  let [profileImage, setProfileImage] = useState(placeHolder)
  let [hasProfileImage, setHasProfileImage] = useState(false)
  let [showEditForm, setShowEditForm] = useState("none")
  let [name, setName] = useState("")

  // cloudinary widget
  var myWidget = window.cloudinary.createUploadWidget({
    cloudName: CLOUD_NAME, 
    uploadPreset: CLOUD_PRESET_PROFILE,
    folder: 'quizzyProfilePhotos',
    sources: [ 'local', 'url', 'camera', 'dropbox', 'facebook', 'instagram', 'google_drive']}, (error, result) => { 
      if (!error && result && result.event === "success") { 
        setProfileImage(result.info.public_id)
        setHasProfileImage(true)
        updateImage(result.info.public_id)
      }
    }
  )

  useEffect(() => {
    console.log(props.user.imageId)
    if(props.user.imageId) {
        setProfileImage(props.user.imageId)
        setHasProfileImage(true)
    }
  }, [hasProfileImage])

  function showWidget(widget) {
    myWidget.open();
  }

  function handleName(e) {
    setName(e.target.value)
  }

  function updateData(e) {
    e.preventDefault()

    // makes a request to update requested data 
    axios.post(`${REACT_APP_SERVER_URL}/api/users/updateData`, { "name": name, "email": props.user.email })
    .then((response) => {
      props.setCurrentUser(response.data)
      setShowEditForm("none")
    })
    .catch((error) => {
      alert.show("Something Went Wrong! Try Again!")
      console.log("Update error", error)
    })


  }

  // update ImageData at database
  function updateImage(public_id) {

    // maked a call to update Image
    axios.post(`${REACT_APP_SERVER_URL}/api/users/updateImage`, { "imageId": public_id, "email": props.user.email })
    .then((response) => {
      props.setCurrentUser(response.data)
    })
    .catch((error) => {
      alert.show("Something Went Wrong! Try Again!")
      console.log("Update error", error)
    })


  }

  // show/hide edit form
  function showForm() {
    if (showEditForm === "none") {
      setShowEditForm("block")
    } else {
      setShowEditForm("none")
    }
  }

  // user data to show
  const userData = props.user ? (
    <div className="text-center pt-4">
      <h1 className="profileTitle">Profile</h1>
      <div style={{marginBottom: '30px'}}>
        { 
          hasProfileImage ? 
          <CloudinaryContext cloudName={CLOUD_NAME}>
            <div>
              <Image publicId={profileImage} id="profileImage" crop="scale" />
            </div>
          </CloudinaryContext>
          :
          <img src={profileImage} id="profileImage" alt="profile image"/>
        }
        <p id="changeProfileImage">
          <a href="#" id="upload_widget"  onClick={showWidget}>Upload Profile Picture</a>
          {/* <a href="#" >Change Profile Picture</a> */}
        </p>
        <p id="editProfile">
          <a href="#" onClick={showForm} >Edit Profile</a>
        </p>
      </div>
      <form onSubmit={updateData} style={{display: `${showEditForm}`}}>
        <label htmlFor="name" >Name: </label>
        <input type="text" id="name" value={name} onChange={handleName} required/>
        <input type="text" hidden value={props.user.email}/>
        <button>Submit</button>
      </form>
      <p className="profileData">
        <strong>Name:</strong> {props.user.name}
      </p>
      <p>
        <strong>Email:</strong> {props.user.email}
      </p>
      <br />
    </div>
  ) : (
    <h4>Loading...</h4>
  )

  const errorDiv = () => {
    return (
      <div className="text-center pt-4">
        <h3>
          Please <Link to="/signin">Sign in</Link> to view this page
        </h3>
      </div>
    )
  }

  return (
    <div className="profile">
      <div>{props.user ? userData : errorDiv()}</div>
      <a href="/createGame">
        <button>Create Quizzy</button>
      </a>
      <a href="/savedQuizzys">
        <button>Saved Quizzy's</button>
      </a>
    </div>
  )
}

export default Profile