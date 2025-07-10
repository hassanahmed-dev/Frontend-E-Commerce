"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import "./page.scss"
import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import { Modal } from "antd"
import Zoom from "react-medium-image-zoom"
import 'react-medium-image-zoom/dist/styles.css'
import 'antd/dist/reset.css' // Import Ant Design styles
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import "../../components/Product.scss"
import { Heart, Eye } from "lucide-react"
import { fetchCart } from '../../store/slices/cartSlice';


export default function ProductPage() {
  const dispatch = useDispatch();
  const { items: productList, loading: productsLoading } = useSelector(state => state.products);
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(state => state.wishlist);
  
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [500, 50000],
    colors: [],
    sizes: [],
    styles: [],
    availability: "all",
  })

  const [sortBy, setSortBy] = useState("bestSelling")

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    colors: true,
    size: true,
    style: true,
  })

  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  // Fetch products and wishlist on component mount
  useEffect(() => {
   
    dispatch(fetchWishlist());
    dispatch(fetchCart());
  }, [dispatch]);

  // Fetch best selling products from backend when sortBy is 'bestSelling'
  useEffect(() => {
    async function fetchBestSelling() {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/product-order-counts`, { headers });
      const data = await res.json();
      setBestSellingProducts(Array.isArray(data) ? data : []);
    }
    if (sortBy === 'bestSelling') {
      fetchBestSelling();
    }
  }, [sortBy]);

  // Quick view handlers
  const handleQuickView = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  // Filter and sort products
  useEffect(() => {
    if (!productList) return;
    let result = [...productList];
    if (filters.categories.length > 0) {
      result = result.filter((product) => filters.categories.includes(product.category));
    }
    result = result.filter(
      (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
    );
    if (filters.availability === "inStock") {
      result = result.filter((product) => product.inStock);
    } else if (filters.availability === "outOfStock") {
      result = result.filter((product) => !product.inStock);
    }
    if (sortBy === "priceLowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "bestSelling") {
      // Use bestSellingProducts from backend
      if (bestSellingProducts.length > 0) {
        // Only show products that match current filters
        const filteredIds = new Set(result.map(p => String(p._id || p.id)));
        result = bestSellingProducts.filter(p => filteredIds.has(String(p._id || p.id)));
      } else {
        // fallback: sort by reviews if backend not loaded
        result.sort((a, b) => b.reviews - a.reviews);
      }
    } else {
      result.sort((a, b) => b.reviews - a.reviews);
    }
    setFilteredProducts(result);
  }, [filters, productList, sortBy, bestSellingProducts]);

  const handlePriceChange = (value, index) => {
    const newRange = [...filters.priceRange]
    newRange[index] = value
    setFilters({
      ...filters,
      priceRange: newRange,
    })
  }

  const toggleCategory = (category) => {
    if (filters.categories.includes(category)) {
      setFilters({
        ...filters,
        categories: filters.categories.filter((c) => c !== category),
      })
    } else {
      setFilters({
        ...filters,
        categories: [...filters.categories, category],
      })
    }
  }

  const setAvailability = (value) => {
    setFilters({
      ...filters,
      availability: value,
    })
  }

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [500, 50000],
      colors: [],
      sizes: [],
      styles: [],
      availability: "all",
    })
  }

  const wishlist = useSelector(state => state.wishlist);

  return (
    <div>
      <Navbar />
      <div className="container-pagee">
        {/* Breadcrumb */}
        <div className="container breadcrumb">
          <div className="breadcrumb-list">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span> / </span>
            <Link href="/products" className="breadcrumb-link">
              Products
            </Link>
          </div>
        </div>

        <div className="page-layout">
          {/* Sidebar Filters */}
          <div className="sidebar">
            <h2 className="sidebar-title">Filters</h2>

            {/* Categories */}
            <div className="filter-section">
              <div className="filter-header">
                <h3 className="filter-title">Categories</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter-icon"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
              <div className="filter-content checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="category-mobile-accessories"
                    checked={filters.categories.includes("Mobile Accessories")}
                    onChange={() => toggleCategory("Mobile Accessories")}
                  />
                  <label htmlFor="category-mobile-accessories" className="checkbox-label">
                    Mobile Accessories
                  </label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="category-computers-accessories"
                    checked={filters.categories.includes("Computers & Accessories")}
                    onChange={() => toggleCategory("Computers & Accessories")}
                  />
                  <label htmlFor="category-computers-accessories" className="checkbox-label">
                    Computers & Accessories
                  </label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="category-tv-home-entertainment"
                    checked={filters.categories.includes("TV & Home Entertainment")}
                    onChange={() => toggleCategory("TV & Home Entertainment")}
                  />
                  <label htmlFor="category-tv-home-entertainment" className="checkbox-label">
                    TV & Home Entertainment
                  </label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="category-smart-watches"
                    checked={filters.categories.includes("Smart Watches")}
                    onChange={() => toggleCategory("Smart Watches")}
                  />
                  <label htmlFor="category-smart-watches" className="checkbox-label">
                    Smart Watches
                  </label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="category-audio-buds"
                    checked={filters.categories.includes("Audio & Buds")}
                    onChange={() => toggleCategory("Audio & Buds")}
                  />
                  <label htmlFor="category-audio-buds" className="checkbox-label">
                    Audio & Buds
                  </label>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <div className="filter-header" onClick={() => toggleSection("price")}>
                <h3 className="filter-title">Price</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`filter-icon ${expandedSections.price ? "expanded" : ""}`}
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </div>
              {expandedSections.price && (
                <div className="price-range">
                  <div className="price-display">
                    <span>Rs.{filters.priceRange[0]}</span>
                    <span>Rs.{filters.priceRange[1]}</span>
                  </div>
                  <div className="price-slider-container">
                    <div
                      className="price-slider-fill"
                      style={{
                        left: `${((filters.priceRange[0] - 500) / (50000 - 500)) * 100}%`,
                        right: `${100 - ((filters.priceRange[1] - 500) / (50000 - 500)) * 100}%`,
                      }}
                    ></div>
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={100}
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                      className="price-slider"
                    />
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={100}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                      className="price-slider"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="filter-section">
              <h3 className="filter-title">Availability</h3>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    id="availability-all"
                    name="availability"
                    checked={filters.availability === "all"}
                    onChange={() => setAvailability("all")}
                  />
                  <label htmlFor="availability-all" className="radio-label">
                    All
                  </label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    id="availability-instock"
                    name="availability"
                    checked={filters.availability === "inStock"}
                    onChange={() => setAvailability("inStock")}
                  />
                  <label htmlFor="availability-instock" className="radio-label">
                    In Stock
                  </label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    id="availability-outofstock"
                    name="availability"
                    checked={filters.availability === "outOfStock"}
                    onChange={() => setAvailability("outOfStock")}
                  />
                  <label htmlFor="availability-outofstock" className="radio-label">
                    Out of Stock
                  </label>
                </div>
              </div>
            </div>

            {/* Apply Filter Button */}
            <button className="button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>

          {/* Product Listing */}
          <div className="product-section">
            {/* Header */}
            <div className="product-header">
              <div>
                <h1 className="product-title-product-page-all">All Products</h1>
                <p className="product-count">
                  Showing 1-{filteredProducts.length} of {productList ? productList.length : 0} products
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="sort-container">
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="all">All</option>
                  <option value="bestSelling">Best Selling</option>
                  <option value="newest">Newest</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sort-icon"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="loading-card">
                    <div className="loading-image"></div>
                    <div className="loading-content">
                      <div className="loading-line loading-line-75"></div>
                      <div className="loading-line loading-line-50"></div>
                      <div className="loading-line loading-line-25"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => {
                  const productId = String(product.id || product._id);
                  const isInWishlist = wishlist.products.map(String).includes(productId);
                  return (
                    <div className="product-card" key={productId}>
                    {/* Wishlist & Quick View Buttons */}
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
                            style={{ color: isInWishlist ? 'red' : 'gray', cursor: 'pointer'}}
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
                    {/* Product Image */}
                    <div className="product-image-container">
                      <Image
                        src={product.imageUrl || product.image || "/placeholder.png"}
                        alt={product.title || product.name || product.productName}
                        width={200}
                        height={200}
                        className="product-image"
                        onError={e => { e.target.src = "/placeholder.png"; }}
                      />
                    </div>
                    {/* Add to Cart/View Details */}
                    <div className="add-to-cart-container">
                    <Link href={`/productdetail?id=${product.id}`} key={product.id}>
                        <button className="add-to-cart-button">View Details</button>
                      </Link>
                    </div>
                    {/* Product Info */}
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

            {/* Quick View Modal */}
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

            {/* Empty State */}
            {filteredProducts.length === 0 && !productsLoading && (
              <div className="empty-state">
                <h3 className="empty-title">No products found</h3>
                <p className="empty-description">Try adjusting your filters to find what you're looking for.</p>
                <button className="reset-button" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterContact />
      <Footer />
    </div>
  )
}
