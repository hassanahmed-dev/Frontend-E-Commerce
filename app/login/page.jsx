"use client"
import { useState, useEffect } from "react"
import { Form, Input, Button, message } from "antd"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import "./page.scss"
import { useSelector, useDispatch } from 'react-redux'
import { signin, clearError, clearMessage } from '../../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, message: authMessage } = useSelector(state => state.auth)
  
  const [form] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)

  // Show error/success messages
  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
    if (authMessage) {
      message.success(authMessage)
      dispatch(clearMessage())
    }
  }, [error, authMessage, dispatch])

  const onFinish = async (values) => {
    try {
      await dispatch(signin(values)).unwrap()
      router.push('/')
    } catch (err) {
      // Error is handled by Redux and shown above
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  return (
    <div className="signin-container">
      <div className="image-section">
        <Image
          src="/Login.png"
          alt="People with sunglasses"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      
      <div className="form-section">
        <div className="form-content">
          <h1>Login Page</h1>

          <Form
            form={form}
            name="signin"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="User name or email address"
              name="username"
              rules={[{ required: true, message: "Please enter your username or email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
              extra={
                <div className="forgot-password">
                  <Link href="/reset">Forgot your password</Link>
                </div>
              }
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="signin-button">
                Login
              </Button>
            </Form.Item>
          </Form>

          <div className="signup-link">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}