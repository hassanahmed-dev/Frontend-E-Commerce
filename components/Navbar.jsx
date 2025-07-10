"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, Heart, ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button, Input, Drawer } from "antd";
import { useState } from "react";
import "./Navbar.scss"; // Importing the CSS file
import { useDispatch, useSelector } from "react-redux";
import { searchProducts } from "../store/slices/productSlice";
import { useRouter } from "next/navigation";
import React from "react";

export default function Navbar() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: searchResults, loading } = useSelector((state) => state.products);
  const itemCount = useSelector((state) => state.cart.itemCount);
  let debounceTimeout = null;

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (value.trim().length === 0) {
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    debounceTimeout = setTimeout(() => {
      dispatch(searchProducts(value));
    }, 300);
  };

  const handleResultClick = (id) => {
    setShowDropdown(false);
    setSearchTerm("");
    router.push(`/productdetail?id=${id}`);
  };

  // Improved filter: match search term against title, productName, or category (case-insensitive, trimmed)
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredResults = searchResults.filter(product => {
    const title = (product.title || '').toLowerCase();
    const productName = (product.productName || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    return (
      title.includes(normalizedTerm) ||
      productName.includes(normalizedTerm) ||
      category.includes(normalizedTerm)
    );
  });

  // Hide dropdown on click outside
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.search-wrapper')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
          <span className="text-small">+92 3212327711</span>
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
          </div>
          <Button className="mobile-menu-button" onClick={showDrawer}>
            <Menu className="icon" />
          </Button>
        </div>
        <div className="nav-right">
          {/* Search bar for desktop only */}
          <div className="search-wrapper desktop-search" style={{ position: 'relative' }}>
            <Input
              placeholder="Search for products..."
              className="search-input"
              prefix={<Search className="search-icon" />}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => { if (searchTerm) setShowDropdown(true); }}
              autoComplete="off"
            />
            {showDropdown && searchTerm && (
              <div className="search-dropdown">
                {loading ? (
                  <div className="search-loading">Loading...</div>
                ) : (
                  filteredResults && filteredResults.length > 0 ? (
                    <div className="search-results-list">
                      {filteredResults.map((product) => (
                        <div
                          key={product.id || product._id}
                          className="search-result-item"
                          onClick={() => handleResultClick(product.id || product._id)}
                        >
                          <Image
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.title || product.productName}
                            width={50}
                            height={50}
                            className="search-result-img"
                          />
                          <div className="search-result-info">
                            <div className="search-result-title">{product.title || product.productName}</div>
                            <div className="search-result-category">{product.category}</div>
                            <div className="search-result-price">Rs.{product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="search-no-results">No products found.</div>
                  )
                )}
              </div>
            )}
          </div>
          <button className="icon-button">
           <Link href="/wishlist"><Heart  className="icon" /></Link>
          </button>
          <button className="icon-button">
            <Link href="/cart" style={{ position: "relative", display: "inline-block" }}>
              <ShoppingCart className="icon" />
              {itemCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 2px",
                  fontSize: "10px",
                  fontWeight: 600,
                  minWidth: 18,
                  textAlign: "center",
                  zIndex: 2
                }}>
                  {itemCount}
                </span>
              )}
            </Link>
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
          <div className="search-wrapper mobile-search" style={{ position: 'relative' }}>
            <Input
              placeholder="Search for products..."
              className="search-input2"
              prefix={<Search className="search-icon" />}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => { if (searchTerm) setShowDropdown(true); }}
              autoComplete="off"
            />
            {showDropdown && searchTerm && (
              <div className="search-dropdown">
                {loading ? (
                  <div className="search-loading">Loading...</div>
                ) : (
                  filteredResults && filteredResults.length > 0 ? (
                    <div className="search-results-list">
                      {filteredResults.map((product) => (
                        <div
                          key={product.id || product._id}
                          className="search-result-item"
                          onClick={() => handleResultClick(product.id || product._id)}
                        >
                          <Image
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.title || product.productName}
                            width={50}
                            height={50}
                            className="search-result-img"
                          />
                          <div className="search-result-info">
                            <div className="search-result-title">{product.title || product.productName}</div>
                            <div className="search-result-category">{product.category}</div>
                            <div className="search-result-price">Rs.{product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="search-no-results">No products found.</div>
                  )
                )}
              </div>
            )}
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