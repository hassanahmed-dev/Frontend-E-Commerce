"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { forgotPassword } from "../../store/slices/authSlice"
import "./page.scss"


export default function CheckEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleResend = async () => {
    setLoading(true)
    setError("")
    try {
      const email = localStorage.getItem('verificationPending') || localStorage.getItem('resetEmail')
      if (!email) throw new Error('No email found for resend')
      await forgotPassword(email)
      message.success("Verification email resent successfully!")
    } catch (error) {
      setError(error.message || "Failed to resend email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="check-email-container">
      <div className="image-section">
        <Image
          src="/Email.png"
          alt="Friends embracing"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="content-section">
        <div className="content-wrapper">
          <h1>Check Email</h1>

          <p className="instruction">
            Please check your email inbox and click on the provided link to reset your password. If you don&apos;t
            receive an email,{" "}
            <span className="resend-link" onClick={handleResend} style={{ cursor: loading ? 'not-allowed' : 'pointer', color: loading ? 'gray' : 'blue' }}>
              {loading ? 'Resending...' : 'Click here to resend'}
            </span>
            .
            {error && <span style={{ color: 'red' }}> {error}</span>}
          </p>

          <Link href="/login" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}