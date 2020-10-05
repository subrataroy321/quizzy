import React from "react"
import './Footer.css'
import gitHubLogo from '../assets/images/GitHub-Mark.png'
import linkedInLogo from '../assets/images/linkedin-in-logo-png-1.png'

const Footer = () => {
  return (
    <footer className="footer bg-dark">
        <span className="text-muted">
          <a href="https://github.com/subrataroy321" target="_blank" rel="noopener">
            <img src={gitHubLogo} alt="github" className="social1"/>
          </a>
        </span>
        <span className="text-muted">Build and Developed by Subrata Roy</span>
        <span className="text-muted">
          <a href="https://www.linkedin.com/in/subrataroy321/" target="_blank" rel="noopener">
            <img src={linkedInLogo} alt="linkedin" className="social2"/>
          </a>
        </span>
    </footer>
  )
}

export default Footer
