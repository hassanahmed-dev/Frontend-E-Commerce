"use client" // This must be at the very top of the file

import { useState, useEffect } from "react"
import { Form, Input, Checkbox, Button, message as antdMessage } from "antd"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import "./page.scss"
import { useSelector, useDispatch } from 'react-redux'
import { signup, clearError, clearMessage } from '../../store/slices/authSlice'

export default function SignUpPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, message: authMessage } = useSelector(state => state.auth)
  
  const [form] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // AntD message context for reliable toasts
  const [messageApi, contextHolder] = antdMessage.useMessage();

  // Show error/success messages
  useEffect(() => {
    if (authMessage) {
      messageApi.success(authMessage)
      dispatch(clearMessage())
      router.push('/verification')
    }
  }, [authMessage, dispatch, router, messageApi])

  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch, messageApi])

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  const onFinish = async (values) => {
    try {
      await dispatch(signup(values)).unwrap()
    } catch (err) {
      console.error("Signup failed:", err)
    }
  }

  return (
    <div className="signup-container-signup">
      {contextHolder}
      <div className="image-section">
        <Image
          src="/Sign.png"
          alt="Colorful group photo"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="form-section-signup">
        <div className="form-content-signup">
          <h1>Sign Up</h1>
          <p className="subtitle-signup">Sign up for free to access to any of our products</p>

          <Form
            form={form}
            name="signup"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Your Name" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email address" }]}
            >
              <Input placeholder="designer@gmail.com" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone number" },
                { pattern: /^[0-9]{10,15}$/, message: "Please enter a valid phone number (10-15 digits)" },
              ]}
            >
              <Input placeholder="1234567890" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
              extra="Use 8 or more characters with a mix of letters, numbers & symbols"
            >
              <Input.Password 
                iconRender={(visible) => (visible ? <Eye size={16} /> : <EyeOff size={16} />)}
              />
            </Form.Item>

            <Form.Item 
              name="terms" 
              valuePropName="checked" 
              rules={[{ 
                validator: (_, value) => 
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions'))
              }]}
            >
              <Checkbox>
                Agree to our <Link href="/terms">Terms of use</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="signup-button-signup"
                loading={loading}
                block
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          <div className="login-link-signup">
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}