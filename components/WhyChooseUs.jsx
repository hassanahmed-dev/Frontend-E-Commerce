'use client';
import { RefreshCw, Headphones, CheckCircle, Lock } from "lucide-react"
import "./WhyChooseUs.scss"

const WhyChooseUs = () => {
  const features = [
    {
      icon: <RefreshCw className="feature-icon" />,
      title: "14 Days Return",
      description: "Easy return within 14 days of purchase.",
    },
    {
      icon: <Headphones className="feature-icon" />,
      title: "24/7 Support",
      description: "Our support team is here for you anytime.",
    },
    {
      icon: <CheckCircle className="feature-icon" />,
      title: "Quality Guarantee",
      description: "We provide top quality guaranteed.",
    },
    {
      icon: <Lock className="feature-icon" />,
      title: "Secure Payment",
      description: "Pay with confidence using secure methods.",
    },
  ]

  return (
    <section className="why-choose-section">
      <p className="why-choose-title">Why To Choose Us</p>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            {feature.icon}
            <h4 className="feature-title">{feature.title}</h4>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseUs
