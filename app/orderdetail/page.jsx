"use client"

import Image from "next/image"
import Link from "next/link"
import { AlertCircle, ChevronLeft, Package, Heart, User, LogOut } from "lucide-react"
import { useState } from "react"  // ✅ Fix: import useState
import "./page.scss"
import Navbar from "../../components/Navbar";
import FooterContact from "../../components/FooterContact";
import Footer from "../../components/Footer";


export default function OrderDetailsPage({ params }) {

      const [activeLink, setActiveLink] = useState("My orders")

        const handleLinkClick = (linkName) => {
    setActiveLink(linkName)
  }

    

  const { id } = params;
  // Mock data for demonstration
  const orderDetails = {
    id: params.id,
    date: "2 June 2023 2:49 PM",
    total: "$143.00",
    status: "Cancelled",
    cancelledBy: "AEPL Store",
    reason: "The shipping address provided was incorrect or incomplete.",
    items: [
      {
        id: 1,
        name: "Printed white cote",
        color: "White",
        quantity: 1,
        price: "$29.00",
        image: "/product2.png",
      },
      {
        id: 2,
        name: "Men Blue Shirt",
        color: "Blue",
        quantity: 1,
        price: "$29.00",
        image: "/product3.png",
      },
    ],
  }

  return (
    <>
    <Navbar/>
     <div className="container2">

     <div className="sidebar2">
          <div className="container breadcrumb">
            <div className="breadcrumb-list">
              <Link href="/" className="breadcrumb-link">
                Home
              </Link>
              <span> / </span>
              <Link href="/profile" className="breadcrumb-link">
                My Account
              </Link>
              <span> / </span>
              <Link href="/orderpage" className="breadcrumb-link">
                My Order
              </Link>
              <span> / </span>
              <Link href="/orderdetail" className="breadcrumb-link">
                Order Detail
              </Link>
            </div>
          </div>

          <div className="welcome2">
            <div className="alag">
              <div className="section-indicator"></div>
              <h2 className="welcome-title2">Hello Jhanvi</h2>
            </div>
            <p className="welcome-text2">Welcome to your Account</p>
          </div>

          <nav>
            <ul className="nav2">
              <li className="nav-item2">
                <Link
                  href="/orderpage"
                  className={`nav-link2 ${activeLink === "My orders" ? "active" : ""}`}
                  onClick={() => handleLinkClick("My orders")}
                >
                  <Package size={16} /> My orders
                </Link>
              </li>
              <li className="nav-item2">
                <Link
                  href="/wishlist" // Corrected typo from /whislist to /wishlist
                  className={`nav-link2 ${activeLink === "Wishlist" ? "active" : ""}`}
                  onClick={() => handleLinkClick("Wishlist")}
                >
                  <Heart size={16} /> Wishlist
                </Link>
              </li>
              
                <li className="nav-item2">
                  <Link
                    href="/profile"
                    className={`nav-link2 ${activeLink === "My Info" ? "active" : ""}`}
                    onClick={() => handleLinkClick("My Info")}
                  >
                    <User size={16} /> My Info
                  </Link>
                </li>
              
              <li className="nav-item2">
                <Link
                  href="#"
                  className={`nav-link2 ${activeLink === "Sign out" ? "active" : ""}`}
                  onClick={() => handleLinkClick("Sign out")}
                >
                  <LogOut size={16} /> Sign out
                </Link>
              </li>
            </ul>
          </nav>
        </div>

    <div className="details-container">
      <Link href="/orderpage" className="back-link">
        <ChevronLeft className="back-icon" size={16} />
        <p>Order Details</p>
      </Link>

      <div className="order-summary">
        <div>
          <p className="order-number">Order no: #{orderDetails.id}</p>
          <p className="order-date">Placed On: {orderDetails.date}</p>
        </div>
        <div className="order-totals">
          Total : <span className="order-total">{orderDetails.total}</span>
        </div>
      </div>

      {orderDetails.status === "Cancelled" && (
        <div className="cancelled-alert">
          <div className="alert-content">
            <AlertCircle className="alert-icon" size={20} />
            <div>
              <p className="cancelled-by">Order cancelled by {orderDetails.cancelledBy}</p>
              <p className="cancel-reason">Reason: {orderDetails.reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="items-container">
        {orderDetails.items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-image">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} width={80} height={80} />
            </div>
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-color">
                Color: <span className="item-color-value">{item.color}</span>
              </p>
            </div>
            <div>
              <p className="item-quantity">
                Qty: <span className="item-quantity-value">{item.quantity}</span>
              </p>
              <p className="item-price">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    </div>
    <FooterContact/>
    <Footer/>
    </>
  )
}


