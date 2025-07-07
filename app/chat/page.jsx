"use client"
import Image from "next/image"
import Link from "next/link";
import "./page.scss"
import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"

export default function CheckoutPage() {
  return (
    <>
      <Navbar />

      {/* Image with Button */}
      <div className="image-container">
        <div className="image-wrapper">
          <Image
            src="/order-confirmed 1.svg"
            alt="Order Confirmation"
            width={700}
            height={500}
            className="checkout-image"
          />
          <Link href="/products"><button className="overlay-button">Continue Shopping</button></Link>
        </div>
      </div>

      <FooterContact />
      <Footer />
    </>
  )
}
