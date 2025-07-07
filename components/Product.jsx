"use client";
import React, { useState, useEffect } from "react";
import { Heart, Eye } from "lucide-react";
import "./Product.scss";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "antd"
import Zoom from "react-medium-image-zoom"
import 'react-medium-image-zoom/dist/styles.css'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules"; // Import Navigation module
import "swiper/css";
import "swiper/css/navigation"; // Import navigation styles

import { fetchProducts } from '../store/slices/productSlice';

import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';


// Custom Navigation Component
const CustomNavigation = ({ swiper }) => {
  return (
    <div className="nav-buttons">
      <button
        className="nav-button"
        onClick={() => swiper?.slidePrev()}
        disabled={!swiper} // Disable button until swiper is ready
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="nav-button"
        onClick={() => swiper?.slideNext()}
        disabled={!swiper}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

const Product = ({ sectionLabel = "Trending", sectionTitle = "Trending Products", products = [] }) => {
  const dispatch = useDispatch();
  const { items: productList, loading, error } = useSelector(state => state.products);
  const wishlist = useSelector(state => state.wishlist);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className="trending-section">
      <div className="section-header">
        <div className="section-indicator"></div>
        <h2 className="section-label">{sectionLabel}</h2>
      </div>

      <div className="section-title-container">
        <h3 className="section-title">{sectionTitle}</h3>
        <CustomNavigation swiper={swiperInstance} />
      </div>

      {loading && <div style={{textAlign: 'center', margin: '2rem'}}>Loading products...</div>}
      {error && <div style={{color: 'red', textAlign: 'center', margin: '2rem'}}>{error}</div>}

      {!loading && !error && (
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          modules={[Navigation]}
          onSwiper={(swiper) => {
            setSwiperInstance(swiper);
          }}
        >
          {productList.map((product) => {
            const productId = String(product.id || product._id);
            const isInWishlist = wishlist.products.map(String).includes(productId);
            return (
              <SwiperSlide key={productId}>
                <div className="product-card">
                  {product.onSale && <div className="sale-badge">SALE</div>}
                  <div className="action-buttons">
                    <button
                      className="action-button-heart"
                      onClick={() => {
                        if (isInWishlist) dispatch(removeFromWishlist(productId));
                        else dispatch(addToWishlist(productId));
                      }}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        fill={isInWishlist ? 'currentColor' : 'none'}
                        style={{ color: isInWishlist ? 'red' : 'gray', cursor: 'pointer' }}
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
                      src={product.imageUrl}
                      alt={product.title || product.productName}
                      width={200}
                      height={200}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="add-to-cart-container">
                    <Link href={`/productdetail/${product._id}`}>
                      <button className="add-to-cart-button">View Details</button>
                    </Link>
                  </div>
                  <h4 className="product-title">{product.title || product.productName}</h4>
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
                          fill={
                            (product.ratings || 0) >= star
                              ? "#FFD700" // filled star color
                              : "#E0E0E0" // empty star color
                          }
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="review-count">({product.reviewsCount || 0})</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}

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

      <div className="view-all-container">
        <Link href='/products'><button className="view-all-link">
          View All
        </button></Link>
      </div>
    </section>
  );
};

export default Product;