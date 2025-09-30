import React from 'react';
import './Footer.css';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`footer ${className}`}>
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-copyright">
            © {currentYear} 함께 사요. All rights reserved.
          </p>
          
          <div className="footer-links">
            <a href="/terms" className="footer-link">이용약관</a>
            <span className="footer-divider">|</span>
            <a href="/privacy" className="footer-link">개인정보처리방침</a>
            <span className="footer-divider">|</span>
            <a href="/support" className="footer-link">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;