"use client"

import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import "./page.scss"

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="privacyContainer">
        <h1>Privacy Policy</h1>
        <p className="lastUpdated">Last Updated: June 20, 2025</p>
        
        <section className="section">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
        </section>
        
        <section className="section">
          <h2>1. Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us including:</p>
          <ul>
            <li>Name and contact information (email, phone number, address)</li>
            <li>Account credentials (username, password)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Demographic information</li>
            <li>Preferences and interests</li>
          </ul>
          <p>We also automatically collect certain information when you visit our website:</p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and time spent on site</li>
            <li>Referring website addresses</li>
          </ul>
        </section>
        
        <section className="section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
            <li>To monitor usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>For marketing and promotional purposes</li>
          </ul>
        </section>
        
        <section className="section">
          <h2>3. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
            Cookies are files with small amount of data which may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </section>
        
        <section className="section">
          <h2>4. Data Sharing and Disclosure</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Service providers who perform services for us</li>
            <li>Business partners for offering you related services</li>
            <li>Law enforcement or government agencies when required by law</li>
            <li>Third parties in connection with a merger or acquisition</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>
        
        <section className="section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section className="section">
          <h2>6. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li>The right to access, update or delete your information</li>
            <li>The right to rectification if your information is inaccurate</li>
            <li>The right to object to our processing of your data</li>
            <li>The right to request restriction of processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>
        
        <section className="section">
          <h2>7. Children's Privacy</h2>
          <p>
            Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
          </p>
        </section>
        
        <section className="section">
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
        
        <section className="section">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:<br />
            Email: technicalhassankhan.1@gmail.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
      <FooterContact />
      <Footer />
    </>
  )
}