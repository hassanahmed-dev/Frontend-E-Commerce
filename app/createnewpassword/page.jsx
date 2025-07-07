"use client"

import { useState } from "react"
import { Form, Input, Button, message } from "antd"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { resetPassword, clearError, clearMessage } from "../../store/slices/authSlice"
import { useRouter } from "next/navigation"
import "./page.scss"

export default function ResetPasswordPage() {
  const [form] = Form.useForm()
  const [errorMessage, setErrorMessage] = useState("")
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector(state => state.auth);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      setErrorMessage("New password and confirm new password do not match")
      return
    }
    try {
      const queryParams = new URLSearchParams(window.location.search)
      const token = queryParams.get('token')
      if (!token) throw new Error('No token provided')
      await dispatch(resetPassword({ token, password: values.password })).unwrap();
      message.success("Password reset successful! Redirecting to login...");
      dispatch(clearError());
      dispatch(clearMessage());
      setTimeout(() => router.push('/login'), 2000)
    } catch (error) {
      setErrorMessage(error.message || 'Password reset failed')
      message.error(error.message || 'Password reset failed')
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  return (
    <div className="reset-password-container">
      <div className="image-section">
        <Image
          src="/Reset.png"
          alt="Group of friends"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="form-section">
        <div className="form-content">
          <h1>Create New Password</h1>
          <p className="subtitle">
            Your new password must be different from previously used passwords.
          </p>

          <Form
            form={form}
            name="resetPassword"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
              extra="Must be at least 8 characters."
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <Form.Item>
              <Button type="primary" htmlType="submit" className="reset-button" loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}