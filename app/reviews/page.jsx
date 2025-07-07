"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineBell, AiOutlineUser, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList, AiOutlineEye, AiOutlineArrowUp, AiOutlineDelete } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ScatterChart, Scatter, ZAxis } from "recharts";
import "./page.scss";
import Sidebar from "../../components/Sidebar";
import { fetchAllReviews, deleteReview } from "../../store/slices/reviewSlice";
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ReviewsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { reviews, loading: reviewsLoading, error } = useSelector((state) => state.reviews);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        // Fetch the reviews regardless of auth status
        dispatch(fetchAllReviews());
    }, [dispatch]);

    const handleDeleteReview = (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            dispatch(deleteReview(reviewId));
        }
    };

    const reviewsToDisplay = showAllReviews ? reviews : (reviews || []).slice(0, 8);
    
    if (reviewsLoading) {
        return <div style={{textAlign: "center", marginTop: "2rem"}}>Loading...</div>;
    }
    
    if (error) {
        return <div style={{ color: "red", textAlign: "center", margin: "2rem" }}>{error}</div>;
    }

    return (
        <ProtectedRoute adminOnly>
        <div className="reviews">
        <Sidebar activePage="reviews" />
    <div className="reviews-main">
    <header className="dashboard-header">
                        <h1>All Products Reviews</h1>
            <div className="dashboard-actions">
              <span className="notif-icon"><AiOutlineBell size={22} /></span>
              <span className="profile-icon"><AiOutlineUser size={22} /></span>
            </div>
        </header>
        <div className="reviews-grid">
                        {reviewsToDisplay && reviewsToDisplay.length > 0 ? (
                reviewsToDisplay.map((review) => (
                    <div key={review._id} className="review-card">
                        <div className="review-header">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? "star-filled" : "star-empty"}>
                                        &#9733;
                                    </span>
                                ))}
                            </div>
                                        <span className="delete-icon" onClick={() => handleDeleteReview(review._id)}>
                                            <AiOutlineDelete />
                                        </span>
                        </div>
                                    <Link href={`/productdetail/${review.productId}`} className="product-name-link">
                                        <h4>{review.productName}</h4>
                                    </Link>
                        <h3>{review.userName}</h3>
                        <p>{review.text}</p>
                    </div>
                ))
            ) : (
                <p>No reviews found.</p>
            )}
        </div>
                    {(reviews || []).length > 8 && (
            <div className="reviews-actions">
                            <button onClick={() => setShowAllReviews(!showAllReviews)}>
                                {showAllReviews ? "View Less" : "View All"}
                            </button>
            </div>
        )}
        </div>
    </div>
        </ProtectedRoute>
);
}    