"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';
import { Package, Heart, User, LogOut } from "lucide-react"
import Navbar from "../../components/Navbar"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import ProtectedRoute from "../../components/ProtectedRoute"
import "./page.scss"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserOrders } from "../../store/slices/orderSlice"
import { message as antdMessage } from "antd";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [activeLink, setActiveLink] = useState("My orders")
  const [activeTab, setActiveTab] = useState("Active")
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [messageApi, contextHolder] = antdMessage.useMessage();

  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const userName = user?.firstName || user?.name || "User";
  const router = useRouter();

  useEffect(() => {
    if (token) {
      dispatch(fetchUserOrders(token));
    }
  }, [dispatch, token]);

  const statusMap = {
    pending: { label: "Order Received", color: "#1976d2" },
    accepted: { label: "Order Accepted", color: "#17A2B8" },
    "out-for-delivery": { label: "Out For Delivery", color: "#f5b50a" },
    delivered: { label: "Delivered", color: "#43a047" },
    cancelled: { label: "Cancelled", color: "#E53911" },
    failed: { label: "Failed", color: "#E53911" },
  };

  const getOrderStatus = (order) => {
    return order.orderStatus || "pending";
  };

  const getProductSummary = (order) => {
    const item = order.cartItems && order.cartItems[0];
    if (!item) return { name: "-", image: "/product1.png", color: "-", quantity: 0, total: "$0.00" };
    return {
      name: item.name,
      image: item.image || "/product1.png",
      color: item.color || "-",
      quantity: item.quantity,
      total: `$${item.price * item.quantity}`,
    };
  };

  const getShortOrderId = (order) => {
    return order.id ? `#${order.id}` : `#${order._id.slice(-4).toUpperCase()}`;
  };

  const handleLinkClick = (linkName) => {
    if (linkName === "Sign out") {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/');
    } else {
      setActiveLink(linkName);
    }
  };

  const cancelOrder = async (id) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      messageApi.success('Order cancelled!');
      dispatch(fetchUserOrders(token));
    } catch (err) {
      messageApi.error('Failed to cancel order.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  function addWorkingDays(date, days) {
    let result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        added++;
      }
    }
    return result;
  }

  const filteredOrders = orders && orders.length > 0 ? orders.filter(order => {
    const status = order.orderStatus || 'pending';
    if (activeTab === 'Active') return status === 'pending' || status === 'accepted' || status === 'out-for-delivery';
    if (activeTab === 'Cancelled') return status === 'cancelled' || status === 'failed';
    if (activeTab === 'Completed') return status === 'delivered';
    return true;
  }) : [];

  return (
    <ProtectedRoute>
      <>
        {contextHolder}
        <Navbar />
        <div className="container2">
          <div className="sidebar2">
            <div className="container breadcrumb">
              <div className="breadcrumb-list">
                <Link href="/" className="breadcrumb-link">Home</Link>
                <span> / </span>
                <Link href="/profile" className="breadcrumb-link">My Account</Link>
                <span> / </span>
                <Link href="/orderpage" className="breadcrumb-link">My Order</Link>
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
                    href="/wishlist"
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
                    href="/"
                    className={`nav-link2 ${activeLink === "Sign out" ? "active" : ""}`}
                    onClick={() => handleLinkClick("Sign out")}
                  >
                    <LogOut size={16} /> Sign out
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="main-content2">
            <div className="orders-header">
              <h1 className="orders-title">My Orders</h1>
            </div>
            <div className="orders-tabs">
              <button
                className={`orders-tab ${activeTab === "Active" ? "active" : ""}`}
                onClick={() => setActiveTab("Active")}
              >
                Active
              </button>
              <button
                className={`orders-tab ${activeTab === "Cancelled" ? "active" : ""}`}
                onClick={() => setActiveTab("Cancelled")}
              >
                Cancelled
              </button>
              <button
                className={`orders-tab ${activeTab === "Completed" ? "active" : ""}`}
                onClick={() => setActiveTab("Completed")}
              >
                Completed
              </button>
            </div>

            {loading && <div>Loading orders...</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}

            <div className="orders-list">
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const summary = getProductSummary(order);
                  const statusKey = getOrderStatus(order);
                  const statusInfo = statusMap[statusKey] || { label: statusKey, color: '#888' };
                  const isCancelled = statusKey === 'cancelled' || statusKey === 'failed';
                  return (
                    <div key={order._id || order.id} className="order-item-orderpage">
                      <div className="order-header">
                        <div className="order-info">
                          <p>Order no: {getShortOrderId(order)}</p>
                          <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
                          <p>Estimated Delivery Date: {
                            order.createdAt
                              ? addWorkingDays(order.createdAt, 4).toLocaleDateString()
                              : "-"
                          }</p>
                        </div>
                        <div className="order-status-info">
                          <p>Order Status: <span className={`status-badge`} style={{ color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span></p>
                          <p>Payment Method: {order.paymentMethod}</p>
                        </div>
                        <button
                          className="order-toggle-btn"
                          onClick={() => toggleExpand(order._id || order.id)}
                          aria-label={expandedOrder === (order._id || order.id) ? "Hide details" : "Show details"}
                        >
                          {expandedOrder === (order._id || order.id) ? "Hide details ▲" : "Show details ▼"}
                        </button>
                      </div>
                      {expandedOrder === (order._id || order.id) && (
                        <div className="order-content">
                          {isCancelled && (
                            <div style={{
                              background: '#fff6f6',
                              borderRadius: 6,
                              padding: '16px 20px',
                              marginBottom: 12,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              border: 'none',
                            }}>
                              <span style={{ color: '#E53911', fontSize: 22, marginTop: 2, flexShrink: 0 }}>&#9888;</span>
                              <div>
                                <div style={{ fontWeight: 700, color: '#222', fontSize: 16, marginBottom: 2 }}>
                                  Order cancelled by {order.cancelledBy === 'user' ? 'You' : 'Admin'}
                                </div>
                                <div style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>
                                  <span style={{ fontWeight: 600 }}>Reason:</span> {order.cancellationReason || 'No reason provided.'}
                                </div>
                              </div>
                            </div>
                          )}
                          {order.cartItems && order.cartItems.length > 0 ? (
                            <div className="order-products-list">
                              {order.cartItems.map((item, idx) => (
                                <div key={idx} className="order-product-row">
                                  <img src={item.image || '/product1.png'} alt={item.name} className="order-product-image" />
                                  <div className="order-product-main">
                                    <div className="order-product-info">
                                      <span className="order-product-name">{item.name}</span>
                                      <span className="order-product-color">Color: <span
                                        style={{
                                          display: "inline-block",
                                          width: "16px",
                                          height: "12px",
                                          backgroundColor: item.color,
                                          border: "1px solid #ccc",
                                          verticalAlign: "middle",
                                          marginLeft: "5px",
                                        }}
                                      ></span></span>
                                    </div>
                                    <div className="order-product-meta">
                                      <span className="order-product-qty">Qty: <b>{item.quantity}</b></span>
                                      <span className="order-product-price">Rs:{item.price.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="order-product-details">
                              <p>No products found.</p>
                            </div>
                          )}
                          {activeTab === "Active" && !isCancelled && (
                            <button
                              className="order-button-cancel-button"
                              style={{ marginTop: '16px', width: 'fit-content' }}
                              onClick={() => { setShowCancelModal(true); setCancellingOrderId(order._id || order.id); }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                !loading && <div>No orders found.</div>
              )}
            </div>
          </div>
        </div>
        <FooterContact />
        <Footer />

        {showCancelModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Cancel Order</h3>
              <label htmlFor="cancel-reason">Enter Reason</label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Message"
              />
              <div className="modal-actions">
                <button
                  className="modal-cancel-btn"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setCancellingOrderId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-confirm-btn"
                  disabled={!cancelReason.trim()}
                  onClick={() => {
                    if (!cancellingOrderId) return;
                    cancelOrder(cancellingOrderId);
                    setShowCancelModal(false);
                    setCancelReason("");
                    setCancellingOrderId(null);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}