"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineBell, AiOutlineUser, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList, AiOutlineSearch, AiOutlineEye } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import "./page.scss";
import Sidebar from "../../components/Sidebar";
import OrderDetailDrawer from "../../components/OrderDetailDrawer";
import ProtectedRoute from '../../components/ProtectedRoute';

const OrdersPage = () => {
  // Dynamic orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.token : null;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/orders`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Add filter state
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter orders based on active filter
  const filteredOrders = orders
    .filter(order => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'New' && order.orderStatus === 'pending') return true;
      if (activeFilter === 'Accepted' && order.orderStatus === 'accepted') return true;
      if (activeFilter === 'Out for Delivery' && order.orderStatus === 'out-for-delivery') return true;
      if (activeFilter === 'Delivered' && order.orderStatus === 'delivered') return true;
      if (activeFilter === 'Canceled' && (order.orderStatus === 'cancelled' || order.orderStatus === 'failed')) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Available status options
  const statusOptions = [
    { label: 'New', color: 'status-new' },
    { label: 'Accepted', color: 'status-accepted' },
    { label: 'Out for Delivery', color: 'status-out' },
    { label: 'Delivered', color: 'status-delivered' },
    { label: 'Canceled', color: 'status-cancelled' },
  ];

  // Status mapping for admin and user
  const statusMap = {
    pending: { label: "New", color: "#1976d2" },
    accepted: { label: "Order Accepted", color: "#17A2B8" },
    "out-for-delivery": { label: "Out For Delivery", color: "#f5b50a" },
    delivered: { label: "Delivered", color: "#43a047" },
    cancelled: { label: "Declined", color: "#E53911" },
    failed: { label: "Declined", color: "#E53911" },
  };

  // Handle status change (for UI only, not backend update)
  const handleStatusChange = (index, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[index].uiStatus = {
      label: newStatus.label,
      type: 'dropdown',
      color: newStatus.color,
      disabled: newStatus.label === 'Delivered' || newStatus.label === 'Canceled',
    };
    setOrders(updatedOrders);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Helper to map order data to drawer format
  const mapOrderToDrawer = (order) => {
    return {
      id: order.id || order._id,
      items: order.cartItems?.map(item => ({
        image: item.image || "/product1.png",
        name: item.name,
        qty: item.quantity,
        color: item.color,
        price: item.price,
      })) || [],
      currentStatus: order.paymentStatus === "pending"
          ? "Order Received"
        : order.paymentStatus === "paid"
          ? "Order Accepted"
        : order.paymentStatus === "failed"
          ? "Declined"
          : "Order Received",
      customer: {
        name: order.userName || (order.user && order.user.name) || "",
        phone: order.billingDetails?.phone || "",
        email: order.billingDetails?.email || "",
      },
      shipping: {
        country: order.shippingDetails?.country || order.billingDetails?.country || "",
        state: order.shippingDetails?.state || order.billingDetails?.state || "",
        city: order.shippingDetails?.city || order.billingDetails?.city || "",
        address: order.shippingDetails?.address || order.billingDetails?.address || "",
        postalCode: order.billingDetails?.postalCode || "",
        paymentMethod: order.paymentMethod,
        invoiceNo: order.id || order._id,
      },
      statusUpdates: [
        {
          date: new Date(order.createdAt).toLocaleString(),
          status: order.paymentStatus === "pending"
            ? "Order Received"
            : order.paymentStatus === "paid"
            ? "Order Accepted"
            : order.paymentStatus === "failed"
            ? "Declined"
            : "Order Received",
        },
      ],
      total: order.finalTotal || order.total || 0,
    };
  };

  // Handler for status change from drawer (UI only)
  const handleDrawerStatusChange = async (newStatus) => {
    // Refetch orders after status change
    setDrawerOpen(false);
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.token : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ProtectedRoute adminOnly>
      <div className="order-management">
        <Sidebar activePage="order-management" />
        <div className="order-management-main">
          <header className="dashboard-header">
            <h1>Order Management</h1>
            <div className="dashboard-actions">
              <span className="notif-icon"><AiOutlineBell size={22} /></span>
              <span className="profile-icon"><AiOutlineUser size={22} /></span>
            </div>
          </header>

          <div className="orders-page">
            <section className="orders-section">
              <div className="orders-header">
                <span>Order Lists</span>
                <div className="orders-actions-right">
                  <div className="filter-buttons1">
                    <button 
                      className={`filter-btn1 ${activeFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('All')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-btn1 ${activeFilter === 'Accepted' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('Accepted')}
                    >
                      Accepted
                    </button>
                    <button 
                      className={`filter-btn1 ${activeFilter === 'Out for Delivery' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('Out for Delivery')}
                    >
                      Out for Delivery
                    </button>
                    <button 
                        className={`filter-btn1 ${activeFilter === 'Delivered' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('Delivered')}
                      >
                        Delivered
                      </button>

                    <button 
                      className={`filter-btn1 ${activeFilter === 'Canceled' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('Canceled')}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="search-box">
                    <input type="text" placeholder="input search text" className="search-input" />
                    <AiOutlineSearch className="search-icon" />
                  </div>
                </div>
              </div>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Contact details</th>
                    <th>City</th>
                    <th>Ordered on</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr key={order._id}>
                      <td>
                        <div>#{order.id}</div>
                      </td>
                      <td>
                        <div>{order.billingDetails?.firstName || order.userName || 'N/A'}</div>
                        <div>{order.billingDetails?.lastName || ''}</div>
                      </td>
                      <td>
                        <div>{order.billingDetails?.email || 'N/A'}</div>
                        <div>{order.billingDetails?.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <span>{order.billingDetails?.city || 'N/A'}</span>,<div>{order.billingDetails?.country || 'N/A'}</div>
                      </td>
                      <td>{order.createdAt
                        ? (() => {
                            const d = new Date(order.createdAt);
                            return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
                          })()
                        : "-"
                      }</td>
                      <td>
                        {(() => {
                          const statusKey = order.orderStatus || 'pending';
                          const statusInfo = statusMap[statusKey] || { label: statusKey, color: '#888' };
                          return (
                            <span className={`status-badge`} style={{ color: statusInfo.color, fontWeight: 600 }}>
                              {statusInfo.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td>Rs:{order.finalTotal || order.total || 0}</td>
                      <td>
                        <AiOutlineEye
                          size={20}
                          style={{ color: '#888', cursor: 'pointer' }}
                          onClick={() => {
                            // Always get the latest order object from orders list
                            const latestOrder = orders.find(o => o._id === order._id);
                            setSelectedOrder(mapOrderToDrawer(latestOrder || order));
                            setDrawerOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
      <OrderDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
        onStatusChange={handleDrawerStatusChange}
      />
    </ProtectedRoute>
  );
};

export default OrdersPage;

