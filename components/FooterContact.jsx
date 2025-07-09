'use client';
import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import "./FooterContact.scss";

const FooterContact = () => {
  return (
    <div className="footer-contact">
      <div className="footer-box">
        <div className="footer-item">
          <Phone size={32} className="footer-icon" />
          <div className="footer-text">
            <p className="footer-title">PHONE</p>
            <p className="footer-info">+92 3212327711</p>
          </div>
        </div>

        <div className="footer-item">
          <Mail size={32} className="footer-icon" />
          <div className="footer-text">
            <p className="footer-title">EMAIL</p>
            <p className="footer-info">technicalhassankhan.1@gmail.com</p>
          </div>
        </div>

        <div className="footer-item">
          <MapPin size={32} className="footer-icon" />
          <div className="footer-text">
            <p className="footer-title">LOCATION</p>
            <p className="footer-info">KARACHI, SINDH PAKISTAN</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContact;
