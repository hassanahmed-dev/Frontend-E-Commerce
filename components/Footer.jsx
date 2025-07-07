'use client';
import { TwitterOutlined, FacebookOutlined, InstagramOutlined } from '@ant-design/icons';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="aepl-footer">
      <div className="aepl-footer-container">
        <div className="aepl-footer-grid">
          <div className="aepl-footer-brand">
            <h3 className="aepl-footer-title">STYLE VERSE</h3>
            <p className="aepl-footer-description">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            <div className="aepl-footer-social-links">
              <a href="#" className="aepl-footer-social-icon" aria-label="Twitter">
                <TwitterOutlined className="aepl-footer-icon" />
              </a>
              <a href="#" className="aepl-footer-social-icon" aria-label="Facebook">
                <FacebookOutlined className="aepl-footer-icon" />
              </a>
              <a href="#" className="aepl-footer-social-icon" aria-label="Instagram">
                <InstagramOutlined className="aepl-footer-icon" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="aepl-footer-subtitle">Company</h4>
            <ul className="aepl-footer-links">
              <li><a href="#" className="aepl-footer-link">About</a></li>
              <li><a href="#" className="aepl-footer-link">Features</a></li>
              <li><a href="#" className="aepl-footer-link">Works</a></li>
              <li><a href="#" className="aepl-footer-link">Career</a></li>
            </ul>
          </div>
          <div>
            <h4 className="aepl-footer-subtitle">Help</h4>
            <ul className="aepl-footer-links">
              <li><a href="#" className="aepl-footer-link">Customer Support</a></li>
              <li><a href="#" className="aepl-footer-link">Delivery Details</a></li>
              <li><a href="#" className="aepl-footer-link">Terms & Conditions</a></li>
              <li><a href="#" className="aepl-footer-link">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="aepl-footer-subtitle">FAQ</h4>
            <ul className="aepl-footer-links">
              <li><a href="#" className="aepl-footer-link">Account</a></li>
              <li><a href="#" className="aepl-footer-link">Manage Deliveries</a></li>
              <li><a href="#" className="aepl-footer-link">Orders</a></li>
              <li><a href="#" className="aepl-footer-link">Payments</a></li>
            </ul>
          </div>
        </div>
        <div className="aepl-footer-bottom">
  <p className="aepl-footer-copyright">
    © STYLE VERSE © 2025-2030, All Rights Reserved
  </p>
  <div className="aepl-footer-payment-icons">
    <img
      src="/footer-pay.png"
      alt="Payment Methods"
      className="aepl-footer-payment-image"
    />
  </div>
</div>

      </div>
    </footer>
  );
};

export default Footer;