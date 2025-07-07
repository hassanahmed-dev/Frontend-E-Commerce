"use client"

import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import "./page.scss"

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="termsContainer">
        <h1>Terms and Conditions</h1>
        <p className="lastUpdate">Last Updated: June 20, 2025</p>
        
        <section className="section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to our website. By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our website.
          </p>
        </section>
        
        <section className="section">
          <h2>2. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the property of our company and is protected by international copyright laws.
          </p>
        </section>
        
        <section className="section">
          <h2>3. User Obligations</h2>
          <p>
            As a user of this website, you agree not to:
          </p>
          <ul>
            <li>Use the website for any unlawful purpose</li>
            <li>Post or transmit any harmful or malicious content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the website in any way that could damage or impair the service</li>
          </ul>
        </section>
        
        <section className="section">
          <h2>4. Limitation of Liability</h2>
          <p>
            Our company shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the website.
          </p>
        </section>
        
        <section className="section">
          <h2>5. Privacy Policy</h2>
          <p>
            Your use of the website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.
          </p>
        </section>
        
        <section className="section">
          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the website following any changes constitutes your acceptance of the new terms.
          </p>
        </section>
        
        <section className="section">
          <h2>7. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is registered.
          </p>
        </section>
        
        <section className="section">
          <h2>8. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at legal@yourcompany.com.
          </p>
        </section>
      </div>
      <FooterContact />
      <Footer />
    </>
  )
}