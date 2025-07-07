"use client"

import { useState } from "react"
import { Button, Form, Input, Typography, message } from "antd"
import { MailOutlined } from "@ant-design/icons"
import Link from "next/link"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { forgotPassword, clearError, clearMessage } from "../../store/slices/authSlice"
import { useRouter } from "next/navigation"
import "./page.scss"

const { Title, Text, Paragraph } = Typography

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, message: successMessage } = useSelector(state => state.auth);

  const handleSubmit = async (values) => {
    try {
      await dispatch(forgotPassword(values.email)).unwrap();
      message.success("If this email exists, a reset link has been sent.");
      dispatch(clearError());
      dispatch(clearMessage());
      router.push("/checkemail");
    } catch (error) {
      message.error(error || "We cannot find your email.");
    }
  }

  return (
    <div className="reset-password-container">
      <div className="image-section">
        <Image
          src="/Forgot.png"
          alt="Fashion models with pink background"
          width={600}
          height={800}
          className="background-image"
          priority
        />
      </div>

      <div className="form-section">
        <div className="form-content">
          <Title level={2} className="form-title">
            Reset Your Password
          </Title>
          <Paragraph className="form-description">
            Enter your email and we'll send you a link to reset your password. Please check it.
          </Paragraph>

          <Form
            form={form}
            name="reset-password-form"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<Text strong>Email</Text>}
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your email"
                prefix={<MailOutlined className="email-icon" />}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="submit-button"
                block
              >
                Send
              </Button>
            </Form.Item>
          </Form>

          <div className="login-link">
            <Link href="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}