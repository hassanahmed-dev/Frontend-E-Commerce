import React from "react";
import { AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import "./ProductModal.scss";

const ProductReviewsModal = ({ isOpen, onClose, productName = "Controller", productImage = "/product1.png", reviews = [], loading = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content reviews-modal">
        <div className="modal-header">
          <img src={productImage} alt="icon" style={{ width: 32, marginRight: 8, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontWeight: 600, fontSize: 20 }}>{productName} Reviews</span>
          <span className="modal-close" onClick={onClose} style={{ marginLeft: "auto", cursor: "pointer" }}>
            <AiOutlineClose size={22} />
          </span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', fontSize: 18 }}>Loading reviews...</div>
        ) : (
        <div className="reviews-grid">
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', color: '#888', fontSize: 16, padding: '2rem' }}>
                No reviews for this product yet.
              </div>
            ) : (
              reviews.map((review, idx) => (
                <div className="review-card" key={review._id || review.id || idx}>
              <div className="review-stars-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="review-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} style={{ color: "#FFD600", fontSize: 18 }}>&#9733;</span>
                  ))}
                </div>
                <AiOutlineDelete style={{ color: "#e74c3c", cursor: "pointer", fontSize: 20 }} />
              </div>
              <div className="review-header" style={{ marginBottom: 6, fontWeight: 600 }}>
                    {review.userName || review.name}
              </div>
              <div className="review-text">{review.text}</div>
            </div>
              ))
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewsModal; 