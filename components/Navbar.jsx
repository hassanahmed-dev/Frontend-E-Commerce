"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, Heart, ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button, Input, Drawer } from "antd";
import { useState } from "react";
import "./Navbar.scss"; // Importing the CSS file

export default function Navbar() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <div className="container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="contact-info">
          <Phone className="icon-small" />
          <span className="text-small">+92 3106900815</span>
        </div>
        <div className="delivery">Free Delivery on order above 4000</div>
        <div className="auth-buttons">
          <Link href="/signup">
            <Button className="signup-btn">SignUp</Button>
          </Link>
          <Link href="/login">
            <Button className="login-btn">Login</Button>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/" className="logo">
            Style Verse
          </Link>
          <div className="menu desktop-menu">
            <Link href="/" className="menu-item">
              Home
            </Link>
            <Link href="/products" className="menu-item">
              Shop ALL
            </Link>
            <Link href="/products" className="menu-item">
              Categories
            </Link>
            <Link href="/products" className="menu-item">
              Best Selling
            </Link>
          </div>
          <Button className="mobile-menu-button" onClick={showDrawer}>
            <Menu className="icon" />
          </Button>
        </div>
        <div className="nav-right">
          {/* Search bar for desktop only */}
          <div className="search-wrapper desktop-search">
            <Input
              placeholder="Search for products..."
              className="search-input"
              prefix={<Search className="search-icon" />}
            />
          </div>
          <button className="icon-button">
           <Link href="/wishlist"><Heart  className="icon" /></Link>
          </button>
          <button className="icon-button">
            <Link href="/cart"><ShoppingCart className="icon" /></Link>
          </button>
          <button className="icon-button">
            <Link href="/profile"><User className="icon" /></Link>
          </button>
        </div>
      </nav>
      

      {/* Drawer for Mobile Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        className="mobile-drawer"
      >
        <div className="mobile-menu">
          {/* Search bar for mobile inside Drawer */}
          <div className="search-wrapper mobile-search">
            <Input
              placeholder="Search for products..."
              className="search-input"
              prefix={<Search className="search-icon" />}
            />
          </div>
          <Link href="/" className="mobile-menu-item" onClick={closeDrawer}>
            Home
          </Link>
          <Link href="/products" className="mobile-menu-item" onClick={closeDrawer}>
            Shop ALL
          </Link>
          <Link href="/categories" className="mobile-menu-item" onClick={closeDrawer}>
            Categories
          </Link>
          <Link href="/best-selling" className="mobile-menu-item" onClick={closeDrawer}>
            Best Selling
          </Link>
        </div>
      </Drawer>
    </div>
  );
}