"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';
import { Package, Heart, User, LogOut, Eye } from "lucide-react"
import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import ProtectedRoute from "../../components/ProtectedRoute"
import "./page.scss"
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import axios from 'axios';
import Product from '../../components/Product';
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from '../../store/slices/productSlice';
import Image from 'next/image';
import { Modal } from "antd";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css';

export default function WishlistPage() {
  // State to track the active sidebar link
  const [activeLink, setActiveLink] = useState("Wishlist")
  const [loading, setLoading] = useState(true)
  const user = useSelector((state) => state.auth.user);
  const userName = user?.firstName || user?.name || "User";
  const dispatch = useDispatch();
  const productList = useSelector(state => state.products.items);
  const wishlist = useSelector(state => state.wishlist.products);
  const wishlistLoading = useSelector(state => state.wishlist.loading);
  const productsLoading = useSelector(state => state.products.loading);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Debug logs
  console.log('wishlist:', wishlist);
  console.log('productList:', productList);

  // Filter only wishlist products
  const wishlistProducts = productList.filter(product =>
    wishlist.map(String).includes(String(product.id || product._id))
  );
  console.log('wishlistProducts:', wishlistProducts);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  }

  // Function to handle link click and update active state
  const handleLinkClick = (linkName) => {
    setActiveLink(linkName)
  }

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (wishlistLoading || productsLoading) {
    return <div style={{textAlign: 'center', margin: '2rem'}}>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container2">
          {/* Sidebar */}
          <div className="sidebar2">
            <div className="container breadcrumb">
              <div className="breadcrumb-list">
                <Link href="/" className="breadcrumb-link">
                  Home
                </Link>
                <span>/</span>
                <Link href="/profile" className="breadcrumb-link">
                  My Account
                </Link>
                <span>/</span>
                <Link href="/wishlist" className="breadcrumb-link">
                  Wishlist
                </Link>
              </div>
            </div>

            <div className="welcome2">
              <div className="alag">
                <div className="section-indicator"></div>
                <h2 className="welcome-title2">Hello {userName}</h2>
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

          {/* Main Content - Wishlist */}
          <div className="main-content2">
            <div className="wishlist-container">
              {wishlistProducts.length === 0 ? (
                <div className="wishlist-empty">
                  <div className="wishlist-icon">
                    {/* Use the whislist.svg image */}
                    <img src="/whislist.svg" alt="Wishlist Icon" width="40" height="40" />
                  </div>
                  <h2 className="wishlist-title">Your wishlist is empty.</h2>
                  <p className="wishlist-text">
                    You don't have any products in the wishlist yet. You will find a lot
                    of interesting products on our Shop page.
                  </p>
                  <Link href="/products"> <button className="wishlist-button">Continue Shopping</button></Link>
                </div>
              ) : (
                <div className="product-grid">
                  {wishlistProducts.map(product => {
                    const productId = String(product.id || product._id);
                    return (
                      <div key={productId} className="product-card">
                      {/* {product.discountedPrice && product.discountedPrice < product.price && (
                        <div className="discount-badge">
                          -{Math.round(100 - (product.discountedPrice / product.price) * 100)}%
                        </div>
                      )} */}
                      <div className="action-buttons">
                        <button
                          className="action-button-heart"
                          onClick={() => handleRemove(product.id || product._id)}
                          aria-label="Remove from wishlist"
                        >
                          <Heart
                            fill={'currentColor'}
                            style={{ color: 'red', cursor: 'pointer'}}
                            size={20}
                          />
                        </button>
                        <button
                          className="action-button-eye"
                          onClick={() => handleQuickView(product)}
                          aria-label="Quick View"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                      <div className="product-image-container">
                          <Image
                            src={product.imageUrl || product.image || "/placeholder.png"}
                            alt={product.title || product.productName}
                            width={200}
                            height={200}
                            className="product-image"
                            onError={e => { e.target.src = "/placeholder.png"; }}
                        />
                      </div>
                      <div className="add-to-cart-container">
                        <Link href={`/productdetail?id=${product.id || product._id}`}>
                          <button className="add-to-cart-button">View Details</button>
                        </Link>
                      </div>
                      <h4 className="product-title">{product.title || product.name || product.productName}</h4>
                    <div className="product-details">
                      <div className="price-container">
                        <span className="current-price">Rs: {product.price}</span>
                        {(product.originalPrice || product.discountedPrice) && (
                          <span className="original-price">Rs: {product.originalPrice || product.discountedPrice}</span>
                        )}
                      </div>
                      <div className="rating-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="rating-star"
                            fill={(product.rating || product.ratings || 0) >= star ? "#FFD700" : "#E0E0E0"}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        <span className="review-count">({product.reviewsCount || product.reviews || 0})</span>
                      </div>
                    </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <FooterContact />
        <Footer />
        {isModalOpen && selectedProduct && (
          <Modal
            open={isModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            centered
            width={500}
          >
            <div className="zoom-modal">
              <Zoom>
                <Image
                  src={selectedProduct.imageUrl || selectedProduct.image || "/placeholder.png"}
                  alt={selectedProduct.title || selectedProduct.name || selectedProduct.productName}
                  width={400}
                  height={400}
                  className="zoom-image"
                  style={{ objectFit: "contain" }}
                />
              </Zoom>
              <h3 style={{ marginTop: "1rem", textAlign: "center" }}>
                {selectedProduct.title || selectedProduct.name || selectedProduct.productName}
              </h3>
            </div>
          </Modal>
        )}
      </>
    </ProtectedRoute>
  )
}