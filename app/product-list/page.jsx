"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineBell, AiOutlineUser, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList, AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlinePlus } from "react-icons/ai";
import "./page.scss";
import ProductModal from "../../components/ProductModal";
import ProductReviewsModal from "../../components/ProductReviewsModal";
import Sidebar from "../../components/Sidebar";
import { fetchProducts, addProduct, updateProduct, deleteProduct } from "../../store/slices/productSlice";
import { fetchReviewsByProduct } from "../../store/slices/reviewSlice";
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ProductList() {
    const dispatch = useDispatch();
    const { items: products, loading, error } = useSelector((state) => state.products);
    const { reviews: allReviews, loading: reviewsLoading } = useSelector((state) => state.reviews);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [currentProductData, setCurrentProductData] = useState(null);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [selectedProductReviews, setSelectedProductReviews] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedProductImage, setSelectedProductImage] = useState("");

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDelete = (idToDelete) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            dispatch(deleteProduct(idToDelete));
        }
    };

    const handleOpenModal = (type, product = null) => {
        setIsModalOpen(true);
        setModalTitle(type === "add" ? "Add Product" : "Edit Product");
        setCurrentProductData(product);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProductData(null);
    };

    const handleOpenReviewsModal = (product) => {
        setSelectedProductName(product.productName);
        setSelectedProductImage(product.imageUrl || "/product1.png");
        setIsReviewsModalOpen(true);
        dispatch(fetchReviewsByProduct(product.id));
    };

    useEffect(() => {
        if (isReviewsModalOpen) {
            setSelectedProductReviews(allReviews);
        }
    }, [allReviews, isReviewsModalOpen]);

    const handleCloseReviewsModal = () => {
        setIsReviewsModalOpen(false);
        setSelectedProductReviews([]);
        setSelectedProductName("");
        setSelectedProductImage("");
    };

    const handleModalSubmit = async (formData) => {
        try {
            const data = new FormData();
            // Rename pricePerUnit to price for the backend
            if (formData.pricePerUnit) {
                formData.price = formData.pricePerUnit;
                delete formData.pricePerUnit;
            }
            // Rename priceAfterDiscount to discountedPrice for the backend
            if (formData.priceAfterDiscount) {
                formData.discountedPrice = formData.priceAfterDiscount;
                delete formData.priceAfterDiscount;
            }
            // Rename totalStock to stock for the backend
            if (formData.totalStock) {
                formData.stock = formData.totalStock;
                delete formData.totalStock;
            }
            // Ensure colors is an array of objects with color (string) and stock (number)
            if (formData.colors) {
                formData.colors = formData.colors.map(c => ({
                    color: c.color,
                    stock: Number(c.stock) || 0
                }));
            }
            // Remove colorStock if present
            if (formData.colorStock) {
                delete formData.colorStock;
            }
            Object.keys(formData).forEach(key => {
                if (key === 'colors') {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            if (modalTitle.includes("Add")) {
                await dispatch(addProduct(data)).unwrap();
            } else if (modalTitle.includes("Edit") && currentProductData) {
                await dispatch(updateProduct({ id: currentProductData.id, productData: data })).unwrap();
            }
    
            handleCloseModal();
    
        } catch (err) {
            console.error("❌ Failed to save product:", err);
            alert("Error: " + (err.message || "Something went wrong!"));
        }
    };

    if (loading) {
        return (
            <div className="product-list-loading">
                <Sidebar activePage="product-list" />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-list-error">
                <Sidebar activePage="product-list" />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute adminOnly>
        <>
      <div className="product-list">
          {/* Sidebar */}
          <Sidebar activePage="product-list" />

      <div className="product-list-main">

          <header className="dashboard-header">
              <h1>Product List</h1>
              <div className="dashboard-actions">
                  <span className="notif-icon"><AiOutlineBell size={22} /></span>
                  <span className="profile-icon"><AiOutlineUser size={22} /></span>
              </div>
          </header>

       <div className="product-table-container">

       <div className="product-list-controls">

                                <span className="span-heading">Products</span>
          {/* <div className="filter-buttons">
              <button className="active">All</button>
          </div> */}
          <div className="search-add">
              <div className="search-bar">
                  <input type="text" placeholder="input search text" />
                  <AiOutlineSearch />
              </div>
              <button className="add-product-btn" onClick={() => handleOpenModal("add")}>
                  <AiOutlinePlus style={{ marginRight: 1 }} /> Add Product
              </button>
          </div>
      </div>
      
      <table>
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Ratings & reviews</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th></th>
              </tr>
          </thead>
          <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td>
                          <div className="product-name-cell">
                              <img 
                                  src={product.imageUrl || "/product1.png"} 
                                  alt={product.productName} 
                                  className="product-image" 
                              />
                              {product.productName}
                          </div>
                      </td>
                      <td>{product.category}</td>
                      <td>
                          <div className="ratings-reviews">
                              <span className="star-icon">&#9733;</span> {product.ratings || 0} (
                              <span className="review-count-underline" style={{ cursor: 'pointer', color: 'rgba(0, 0, 0, 1)', textDecoration: 'underline', fontWeight: 500 }} onClick={() => handleOpenReviewsModal(product)}>
                                {product.reviewsCount || 0} Reviews
                              </span>
                              )
                          </div>
                      </td>
                      <td>
                          <span className={`status-badge ${product.status ? product.status.toLowerCase().replace(/ /g, '-') : 'in-stock'}`}>
                              {product.status || 'In Stock'}
                          </span>
                      </td>
                      <td>{product.stock || 0}</td>
                      <td>Rs: {product.price}</td>
                      <td>
                          <div className="actions">
                              <AiOutlineDelete className="action-icon" onClick={() => handleDelete(product.id)} />
                              <AiOutlineEdit className="action-icon" onClick={() => handleOpenModal("edit", product)} />
                          </div>
                      </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No products found.</td>
                </tr>
              )}
          </tbody>
      </table>
      </div>

          </div>

      </div>  

      <ProductModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          title={modalTitle}
          productData={currentProductData}
      />
      <ProductReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={handleCloseReviewsModal}
        productName={selectedProductName}
                    productImage={selectedProductImage}
        reviews={selectedProductReviews}
                    loading={reviewsLoading}
      />
        </>
        </ProtectedRoute>
    );
}    