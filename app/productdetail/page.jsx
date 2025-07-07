"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Truck, MessageSquare, Info } from "lucide-react";
import "./page.scss";
import Product from "../../components/Product";
import Navbar from "../../components/Navbar";
import FooterContact from "../../components/FooterContact";
import Footer from "../../components/Footer";
import { useParams } from "next/navigation";
import { fetchProductById } from "../../store/slices/productSlice";
import { fetchReviewsByProduct, addReview } from "../../store/slices/reviewSlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

export default function ProductDetail() {
  const router = useRouter();
const { id } = useParams();
  const dispatch = useDispatch();
  console.log("Product ID from URL:", id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [postingReview, setPostingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [addCartError, setAddCartError] = useState("");
  const [addCartSuccess, setAddCartSuccess] = useState("");
  const [formData, setFormData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Check if user is logged in
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
  const isLoggedIn = !!user && !!user.token;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch product and reviews in parallel for better performance
        const [productAction, reviewsAction] = await Promise.all([
          dispatch(fetchProductById(id)),
          dispatch(fetchReviewsByProduct(id)),
        ]);

        const productData = productAction.payload;
        const reviewsData = reviewsAction.payload;

        if (fetchProductById.rejected.match(productAction) || !productData) {
          throw new Error(productData || "Failed to fetch product");
        }

        // Debug: Check what is coming from API
        console.log("Product API response:", productData);

        // If your backend returns just the product object
        setProduct(productData);

        // Prepare images array if product has multiple images (optional)
        const productImages =
          productData?.images && productData.images.length > 0
            ? productData.images
            : [
                productData?.imageUrl ||
                  productData?.image ||
                  "/placeholder.png",
              ];

        // Main image state
        setMainImage(productImages[0]);

        // Ensure reviews are always an array, even if the response is empty or faulty
        setReviews(reviewsData || []);

        if (productData) {
          setFormData({
            ...productData,
            image: null,
            colors:
              productData.colors && Array.isArray(productData.colors)
                ? productData.colors.map((c) => ({
                    color: c?.color || "",
                    stock: c?.stock || "",
                  }))
                : [{ color: "", stock: "" }],
          });
          setImagePreview(productData.imageUrl || null);
        }
      } catch (err) {
        console.error("Failed to fetch product details or reviews:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handlePostReviewClick = () => {
    if (isLoggedIn) {
      setShowReviewModal(true);
    } else {
      router.push('/login');
    }
  };

  // Helper to get userId and userName (for demo, from localStorage)
  // Use user._id if available
  let userId = user && user._id ? user._id : (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
  let userName = user && user.name ? user.name : (typeof window !== "undefined" ? localStorage.getItem("userName") : null);
  if (!userId) userId = "demoUserId";
  if (!userName) userName = "Demo User";

  // Post review handler
  const handlePostReview = async () => {
    setPostingReview(true);
    setReviewError("");
    try {
      let userName = "Demo User";
      let userId = null;
      let token = null;
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
      if (user) {
        if (user.name) {
          userName = user.name;
        }
        if (user._id) {
          userId = user._id;
        } else if (user.userId) {
          userId = user.userId;
        }
        if (user.token) {
          token = user.token;
        }
      }
      // Always fetch latest name from profile API if userId and token exist
      if (userId && token) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          const res = await fetch(`${backendUrl}/api/auth/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.name) userName = data.name;
          }
        } catch (e) {}
      }
      const reviewData = {
        productId: product.id, // string id
        productName: product.productName,
        rating: reviewScore,
        text: reviewText,
        userName,
      };
      const result = await dispatch(addReview(reviewData));
      if (addReview.rejected.match(result)) {
        throw new Error(result.payload || 'Failed to post review');
      }
      setShowReviewModal(false);
      setReviewScore(0);
      setReviewText("");
    } catch (err) {
      setReviewError("Failed to post review. Try again.");
    } finally {
      setPostingReview(false);
    }
  };

  const handleAddToCart = async () => {
    setAddCartLoading(true);
    setAddCartError("");
    setAddCartSuccess("");
    try {
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setAddCartError('Please select a color ');
        setAddCartLoading(false);
        return;
      }
      // Get token from localStorage
      const user =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user"))
          : null;
      const token = user?.token;
      if (!token) {
        setAddCartError("You must be logged in to add to cart.");
        setAddCartLoading(false);
        return;
      }
      const cartAction = await dispatch(
        addToCart({
          productId: product._id,
          quantity,
          color:
            selectedColor || (product.colors && product.colors[0]?.color) || "",
        })
      );
      if (addToCart.rejected.match(cartAction)) {
        throw new Error(cartAction.payload || "Failed to add to cart");
      }
      setAddCartSuccess("Added to cart!");
      setTimeout(() => setAddCartSuccess(""), 2000);
      // router.push("/cart"); // Remove redirect
    } catch (err) {
      setAddCartError(
        err?.response?.data?.error || err.message || "Failed to add to cart"
      );
    } finally {
      setAddCartLoading(false);
    }
  };

  const wishlist = useSelector(state => state.wishlist);
  const productId = String(product?.id || product?._id);
  const isInWishlist = wishlist.products.map(String).includes(productId);

  if (loading)
    return (
      <div style={{ textAlign: "center", margin: "2rem" }}>Loading...</div>
    );
  if (error || !product)
    return (
      <div style={{ color: "red", textAlign: "center", margin: "2rem" }}>
        {error || "Product not found"}
      </div>
    );

  // Prepare images array if product has multiple images (optional)
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl || product.image || "/placeholder.png"];

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="product-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/" className="breadcrumb-link">
            Home
          </Link>
          <span> / </span>
          <Link href="/products" className="breadcrumb-link">
            Product
          </Link>
          <span> / </span>
          <span className="breadcrumb-current">
            {product?.title || product?.productName}
          </span>
        </div>
        <div className="product-grid">
          <div className="product-images">
            <div className="product-thumbnails">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail-item${mainImage === img ? ' selected' : ''}`}
                  onClick={() => setMainImage(img)}
                >
                  <Image
                    src={img}
                    alt={`Product thumbnail ${index + 1}`}
                    width={60}
                    height={80}
                    className="thumbnail-image"
                  />
                </div>
              ))}
            </div>
            <div className="main-image-container">
              <div className="main-image-circle">
                <Image
                  src={mainImage}
                  alt={product?.title || product?.productName || "Product Image"}
                  width={400}
                  height={400}
                  className="main-image"
                />
              </div>
            </div>
          </div>
          {/* Product Details */}
          <div className="product-info">
            <div>
              <h1 className="product-title">{product?.productName}</h1>
              <div className="product-ratings">
                <div className="stars">
                  {[...Array(Math.round(product?.ratings || 0))].map(
                    (_, starIndex) => (
                      <svg
                        key={starIndex}
                        className="star filled"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  )}
                  {[...Array(5 - Math.round(product?.ratings || 0))].map(
                    (_, starIndex) => (
                      <svg
                        key={starIndex}
                        className="star empty"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  )}
                </div>
                <span className="reviews-count">
                  ({product?.reviewsCount || 0} Reviews)
                </span>
                <span className="separator">|</span>
                <span className="stock-status">
                  {product?.status ||
                    (product?.stock > 0 ? "In Stock" : "Out Of Stock")}
                </span>
              </div>
              <div className="product-price">Rs: {product?.price}</div>
              <p className="product-description">{product?.shortDescription}</p>
            </div>
            <div className="divider"></div>
            
            {/* Color Swatches Section with selection */}
            {product?.colors && product?.colors.length > 0 && (
              <div className="color-selection">
                <span className="color-selection-label">Select Color:</span>
                <span className="color-options">
                  {Array.isArray(product?.colors) &&
                    product.colors.map((c, i) =>
                      c?.color ? (
                        <span
                          key={i}
                          onClick={() => setSelectedColor(c.color)}
                          className={`color-swatch${selectedColor === c.color ? ' selected' : ''}`}
                          title={c.color}
                          style={{ background: c.color }}
                        />
                      ) : null
                    )}
                </span>

                {addCartError && (
                  <div style={{ color: 'red', marginTop: 8 }}>{addCartError}</div>
                )}
              </div>
            )}

            {product?.sizes && product.sizes.length > 0 && (
              <div className="size-selection">
                <label htmlFor="size-select" className="size-label">
                  Select Size:
                </label>
                <select
                  id="size-select"
                  value={selectedSize || ""}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="size-select-dropdown"
                >
                  <option value="" disabled>
                    Choose a size
                  </option>
                  {product.sizes.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="cart-actions">
              <div className="quantity-selector">
                <button
                  className="quantity-btn minus"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <Minus className="icon" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(Number.parseInt(e.target.value) || 1)
                  }
                  className="quantity-input"
                />
                <button
                  className="quantity-btn plus"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <Plus className="icon" />
                </button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={addCartLoading}>
                {addCartLoading ? 'Adding...' : 'Add to Cart'}
              </button>      
              {addCartSuccess && (
                <div style={{ color: 'green', marginTop: 8 }}>{addCartSuccess}</div>
              )}
             <button
                  className="action-button-heart"
                  onClick={() => {
                    if (isInWishlist) dispatch(removeFromWishlist(productId));
                    else dispatch(addToWishlist(productId));
                  }}
                  aria-label="Add to wishlist"
                  style={{ background: 'none', border: 'none', padding: 0, marginLeft: 12 }}
                >
                  <Heart
                    fill={isInWishlist ? 'currentColor' : 'none'}
                    style={{ color: isInWishlist ? 'red' : 'gray', cursor: 'pointer' }}
                    size={20}
                  />
                </button>
            </div>

            <div className="info-card shipping">
              <div className="info-content">
                <Truck className="info-icon" />
                <div className="info-text">
                  <h4 className="info-title">Shipping</h4>
                  <p className="info-description">
                    Enter your postal code for Delivery Availability
                  </p>
                </div>
                <Info className="help-icon" />
              </div>
            </div>
            <div className="info-card product-query">
              <div className="info-content">
                <MessageSquare className="info-icon" />
                <div className="info-text">
                  <h4 className="info-title">Ask About This Product</h4>
                  <p className="info-description">Tell us your queries</p>
                </div>
                <Info className="help-icon" />
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-container">
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="description-content">
                <p>{product?.description}</p>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="reviews-content">
                <div
                  className="reviews-header-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <p className="reviews-heading">Reviews</p>
                  <button
                    className="post-review-btn"
                    onClick={handlePostReviewClick}
                  >
                    Post Review
                  </button>
                </div>
                <div className="reviews-grid">
                  {displayedReviews.length > 0 ? (
                    displayedReviews.map((review, idx) => (
                      <div key={idx} className="review-card">
                        <div className="review-stars">
                          {[...Array(5)].map((_, index) => (
                            <svg
                              key={index}
                              className={`review-star ${
                                index < review.rating ? "filled" : "empty"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <h4 className="review-name">{review.userName}</h4>
                        <p className="review-text">{review.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="description-content">
                      <p>No reviews yet.</p>
                    </div>
                  )}
                </div>
                {reviews.length > 2 && (
                  <div className="see-more-container">
                    <button
                      className="see-more-btn"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? "Show Less" : "See More"}
                    </button>
                  </div>
                )}
                {/* Review Modal */}
                {showReviewModal && (
                  <div
                    className="modal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.3)",
                      zIndex: 1000,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setShowReviewModal(false)}
                  >
                    <div
                      className="modal"
                      style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "10px",
                        width: "350px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 style={{ marginBottom: "", fontFamily: "Poppins" }}>
                        Enter Your Review
                      </h2>
                      <div style={{ marginBottom: "1rem" }}>
                        <span>Score: </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              cursor: "pointer",
                              color: star <= reviewScore ? "#FFD700" : "#ccc",
                              fontSize: "1.5rem",
                            }}
                            onClick={() => setReviewScore(star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div style={{ marginBottom: "1rem" }}>
                        <label htmlFor="review-text">Review:</label>
                        <textarea
                          id="review-text"
                          style={{
                            width: "100%",
                            minHeight: "60px",
                            marginTop: "0.5rem",
                            resize: "none",
                            padding: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                          placeholder="Excellent Service!"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />
                      </div>
                      {reviewError && (
                        <div style={{ color: "red", marginBottom: "0.5rem" }}>
                          {reviewError}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "1rem",
                        }}
                      >
                        <button
                          className="postcancelbtn"
                          onClick={() => setShowReviewModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="postaddbtn"
                          onClick={handlePostReview}
                          disabled={
                            postingReview || !reviewScore || !reviewText
                          }
                        >
                          {postingReview ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <Product sectionLabel="Related" sectionTitle="Related Products" />
      </div>
      <FooterContact />
      <Footer />
    </>
  );
}
