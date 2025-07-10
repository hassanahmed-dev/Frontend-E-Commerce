"use client"
import { useState, useEffect } from "react"
import { Form, Input, Button, message as antdMessage } from "antd"
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

  // AntD message context for reliable toasts
  const [messageApi, contextHolder] = antdMessage.useMessage();

  // Show error/success messages
  useEffect(() => {
    if (authMessage) {
      messageApi.success(authMessage)
      dispatch(clearMessage())
    }
  }, [authMessage, dispatch, messageApi])

  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch, messageApi])

  const onFinish = async (values) => {
    try {
      const resultAction = await dispatch(signin(values)).unwrap();
      const userRole = resultAction?.role;
      if (userRole === "admin") {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      // Error is handled by Redux and shown above
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  return (
    <div className="signin-container">
      {contextHolder}
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

            {error && (
            <div style={{ color: 'red', marginBottom: 16,  }}>
              {error}
            </div>
          )}
          
            <Form.Item>
              <Button type="primary" 
              htmlType="submit" 
              className="login-button"
              loading={loading}
              block>
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