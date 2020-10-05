import React from "react"
import { Link } from 'react-router-dom'
import './About.css'
import resume from "../assets/Subrata-Roy-Resume.pdf"
import image from "../assets/D5E5D08C-632B-4615-9B79-A12724838036.jpg"
import gitHubLogo from '../assets/images/GitHub-Mark.png'
import linkedInLogo from '../assets/images/linkedin-in-logo-png-1.png'

const About = () => {
  return (
    <div className="aboutContainer">
      <div id="about">
        <div>
          <img src={image} alt="developer" id="aboutImage" />
        </div>
        <div id="aboutText">
          <h2 style={{fontSize: '100px'}}>Hi,</h2>
          <h3> I am Subrata Roy, a Full-Stack Web Developer. This is my final Project of Software Engineering Bootcamp at General Assembly. It is a live quizzing application made for all of my classmates. We all loved the live quizing in the class. It is build using MongoDB, Express.js, React.js, Node.js and lots hardwork and love. Feel free to take a look at my <a href="https://github.com/subrataroy321/quizzy" style={{color: '#494949'}} >code here</a>.</h3>
        </div>
      </div>
      <Link to={resume} target="_blank" download className="resume resumeBtn">Download My Resume</Link>
      <a href="https://github.com/subrataroy321" target="_blank" rel="noopener">
        <img src={gitHubLogo} alt="github" className="social3 resumeBtn"/>
      </a>
      <a href="https://www.linkedin.com/in/subrataroy321/" target="_blank" rel="noopener">
        <img src={linkedInLogo} alt="linkedin" className="social4 resumeBtn"/>
      </a>
    </div>
  )
}

export default About