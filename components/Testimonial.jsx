"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Testimonial.scss";

// Custom Navigation Component
const CustomNavigation = ({ swiper }) => {
  return (
    <div className="testimonial-nav-buttons">
      <button
        className="testimonial-nav-button"
        onClick={() => swiper?.slidePrev()}
        disabled={!swiper}
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
        className="testimonial-nav-button"
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

// Testimonial Card Component
const TestimonialCard = ({ name, quote = "This is a great product!", rating = 5 }) => {
  return (
    <div className="testimonial-card">
      <div className="testimonial-rating">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`testimonial-star ${index < rating ? "filled" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            width="16"
            height="16"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <h4 className="testimonial-name">{name}</h4>
      <p className="testimonial-quote">"{quote}"</p>
    </div>
  );
};

// Main Testimonial Component
const Testimonial = () => {
  const [swiper, setSwiper] = useState(null);

  const testimonials = [
    { id: 1, name: "Hassan Ahmed", quote: "Amazing products and great customer service!  Highly recommend this store to everyone! lorem Highly recommend this store to everyone! lorem", rating: 5 },
    { id: 2, name: "Arham Ahmed", quote: "I love the quality and fast delivery!", rating: 4 },
    { id: 3, name: "Ali", quote: "Highly recommend this store to everyone! lorem Highly recommend this store to everyone! lorem", rating: 2 },
    { id: 4, name: "Sarah M.", quote: "Fantastic experience, will shop again!", rating: 5 },
    { id: 5, name: "David R.", quote: "Great products, highly satisfied!", rating: 4 },
    { id: 6, name: "Emma T.", quote: "Best store ever, love it!  Best store ever, love it!  Best store ever, love it!", rating: 5 },
  ];

  return (
    <section className="testimonial-container">
      <div className="testimonial-header">
        <div className="testimonial-indicator"></div>
        <h2 className="testimonial-label">Testimonial</h2>
      </div>
      <div className="testimonial-title-container">
        <h3 className="testimonial-title">Our Happy Customers</h3>
        <div className="nav-buttons-wrapper">
          <CustomNavigation swiper={swiper} />
        </div>
      </div>

      <Swiper
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
        }}
        modules={[Navigation]}
        onSwiper={(swiper) => {
          setSwiper(swiper);
        }}
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <TestimonialCard
              name={testimonial.name}
              quote={testimonial.quote}
              rating={testimonial.rating}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonial;