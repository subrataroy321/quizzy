import "./Profile.css"
import React, {useState} from "react"
import placeHolder from '../assets/images/placeholder-male.jpg'
import {Image, CloudinaryContext} from 'cloudinary-react';
import { Link } from "react-router-dom"

const Profile = (props) => {

  // state variables
  let [profileImage, setProfileImage] = useState(placeHolder)
  let [hasProfileImage, setHasProfileImage] = useState(false)

  // cloudinary widget
  var myWidget = window.cloudinary.createUploadWidget({
    cloudName: "subrataroy", 
    uploadPreset: "nh1ih0nx",
    folder: 'quizzyProfilePhotos',
    sources: [ 'local', 'url', 'camera', 'dropbox', 'facebook', 'instagram', 'google_drive']}, (error, result) => { 
      if (!error && result && result.event === "success") { 
        setProfileImage(result.info.public_id)
        setHasProfileImage(true)
      }
    }
  )

  // useEffect(() => {
  //   if(hasProfileImage) {
        // TO DO
  //   }
  // }, [hasProfileImage])

  function showWidget(widget) {
    myWidget.open();
  }

  // user data to show
  const userData = props.user ? (
    <div className="text-center pt-4">
      <h1 className="profileTitle">Profile</h1>
      <div style={{marginBottom: '30px'}}>
        { 
          hasProfileImage ? 
          <CloudinaryContext cloudName="subrataroy">
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
          <a href="#" >Edit Profile</a>
        </p>
      </div>
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
