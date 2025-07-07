"use client"

import { useState, useEffect } from "react"
import { Form, Input, Button, message } from "antd"
import Image from "next/image"
import { useDispatch } from 'react-redux'
import { verifyEmail } from "../../store/slices/authSlice"
import "./page.scss"

export default function VerificationPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      const token = queryParams.get('token')

      if (token && form) {
        form.setFieldsValue({ code: token })
        handleVerification(token)
      }
    }
  }, [form])

  const handleVerification = async (token) => {
    try {
      setLoading(true)
      await dispatch(verifyEmail(token)).unwrap()
      setStatusMessage('Email verified successfully! You can now log in.')
      setTimeout(() => window.location.href = '/login', 2000)
    } catch (error) {
      console.error('Verification error:', error)
      setStatusMessage(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const onFinish = (values) => {
    handleVerification(values.code)
  }

  return (
    <div className="verify-container">
      <div className="image-section">
        <Image
          src="/verify.png"
          alt="Person with sunglasses"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="form-section">
        <div className="form-content">
          <h1>Verification</h1>
          <p className="subtitle">Verify your code.</p>

          {statusMessage && <p style={{ color: statusMessage.includes('success') ? 'green' : 'red' }}>{statusMessage}</p>}

          <Form
            form={form}
            name="verification"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Verification Code"
              name="code"
              rules={[{ required: true, message: "Please enter your verification code" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="verify-button"
                loading={loading}
              >
                Verify Code
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}