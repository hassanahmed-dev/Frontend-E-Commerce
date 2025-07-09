'use client';
import Image from 'next/image';
import Link from 'next/link';
import './Banner.scss';
import { useState } from "react";
import { useRouter } from "next/navigation";

const Banner = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleShopNow = (e) => {
    e.preventDefault();
    setLoading(true);
    router.push("/products");
  };

  return (
    <section className="banner container">
      <div className="banner-left">
        <h1 className="banner-heading">
          DISCOVER YOUR <span className="highlight">STYLE</span> WITH
          <br />
          <span className="highlight">STYLE VERSE</span>
        </h1>
        <p className="banner-description">
        Step into a world where fashion meets confidence. Explore handpicked outfits, bold styles, and timeless looks — curated just for you.
        </p>
        <button className="banner-btn" onClick={handleShopNow} disabled={loading}>
          {loading ? "Redirecting..." : "Shop Now"}
        </button>

       

        <div className="banner-stats">
          <div>
            <h3>
              200<span className="highlight-small">+</span>
            </h3>
            <p>Established Brands</p>
          </div>
          <div>
            <h3>
              2,000<span className="highlight-small">+</span>
            </h3>
            <p>High Quality Products</p>
          </div>
          <div>
            <h3>
              30,000<span className="highlight-small">+</span>
            </h3>
            <p>Happy Customers</p>
          </div>
        </div>
      </div>

      <div className="banner-right">
        <div className="image-container">
            <Image
      src="/banner-img.png"
      alt="Woman with shopping bags"
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="main-image1"
    />
        </div>
      </div>
    </section>
  );
};

export default Banner;
