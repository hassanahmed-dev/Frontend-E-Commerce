"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineBell, AiOutlineUser, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList, AiOutlineSearch, AiOutlineEye } from "react-icons/ai";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import "./page.scss";
import Sidebar from "../../components/Sidebar";
import OrderDetailDrawer from "../../components/OrderDetailDrawer";
import ProtectedRoute from '../../components/ProtectedRoute';
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus } from "../../store/slices/orderSlice";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { allOrders, loading, error } = useSelector((state) => state.order);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.token : null;
    if (token) {
      dispatch(fetchAllOrders(token)).finally(() => setInitialLoad(false));
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const filteredOrders = allOrders
    .filter(order => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'New' && order.orderStatus === 'pending') return true;
      if (activeFilter === 'Accepted' && order.orderStatus === 'accepted') return true;
      if (activeFilter === 'Out for Delivery' && order.orderStatus === 'out-for-delivery') return true;
      if (activeFilter === 'Delivered' && order.orderStatus === 'delivered') return true;
      if (activeFilter === 'Cancelled' && (order.orderStatus === 'cancelled' || order.orderStatus === 'failed')) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusMap = {
    pending: { label: "New", color: "#1976d2" },
    accepted: { label: "Order Accepted", color: "#17A2B8" },
    "out-for-delivery": { label: "Out For Delivery", color: "#f5b50a" },
    delivered: { label: "Delivered", color: "#43a047" },
    cancelled: { label: "Cancelled", color: "#E53911" },
    failed: { label: "Failed", color: "#E53911" },
  };

  const mapOrderToDrawer = (order) => {
    return {
      id: order.id || order._id,
      _id: order._id, // always include MongoDB ObjectId
      items: (order.cartItems || []).map(item => ({
        image: item.image || "/product1.png",
        name: item.name || "Unknown Item",
        quantity: item.quantity || 0,
        color: item.color || "",
        price: item.price || 0,
      })) || [],
      orderStatus: order.orderStatus || "pending",
      customer: {
        name: order.userName || (order.customer?.name || ""),
        phone: order.billingDetails?.phone || "",
        email: order.billingDetails?.email || "",
      },
      shipping: {
        country: order.shippingDetails?.country || order.billingDetails?.country || "",
        state: order.shippingDetails?.state || order.billingDetails?.state || "",
        city: order.shippingDetails?.city || order.billingDetails?.city || "",
        address: order.shippingDetails?.address || order.billingDetails?.address || "",
        postalCode: order.billingDetails?.postalCode || "",
        paymentMethod: order.paymentMethod || "",
        invoiceNo: order.id || order._id,
      },
      statusUpdates: order.statusUpdates || [],
      total: order.finalTotal || order.total || 0,
      cancellationReason: order.cancellationReason || "",
      cancelledBy: order.cancelledBy || "",
    };
  };

  const handleDrawerStatusChange = async (newStatus, updatedOrder) => {
    const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.token : null;
    if (!token) {
      console.error("No token available for status update");
      return;
    }
    await dispatch(updateOrderStatus({
      orderId: updatedOrder._id,
      status: newStatus,
      token,
    })).then((action) => {
      if (updateOrderStatus.fulfilled.match(action)) {
        setSelectedOrder(updatedOrder);
        setDrawerOpen(false);
      } else {
        console.error("Status update failed:", action.payload);
      }
    });
  };

  if (initialLoad) {
    return <Loader />;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

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
              <span className="logout-icon" onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: 10 }} title="Sign out"><FiLogOut size={22} /></span>
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
                      className={`filter-btn1 ${activeFilter === 'New' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('New')}
                    >
                      New
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
                      className={`filter-btn1 ${activeFilter === 'Cancelled' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('Cancelled')}
                    >
                      Cancelled
                    </button>
                  </div>
                  <div className="search-box">
                    <input type="text" placeholder="input search text" className="search-input1" />
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
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div>#{order.id || order._id.slice(-4).toUpperCase()}</div>
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
                        <span className={`status-badge`} style={{ color: statusMap[order.orderStatus || 'pending'].color, fontWeight: 600 }}>
                          {statusMap[order.orderStatus || 'pending'].label}
                        </span>
                      </td>
                      <td>Rs:{order.finalTotal || order.total || 0}</td>
                      <td>
                        <AiOutlineEye
                          size={20}
                          style={{ color: '#888', cursor: 'pointer' }}
                          onClick={() => {
                            const latestOrder = allOrders.find(o => o._id === order._id);
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
        onClose={() => {
          setDrawerOpen(false);
          // Silent refresh: fetch orders but don't show loader
          const token = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.token : null;
          if (token) {
            dispatch(fetchAllOrders(token));
          }
        }}
        order={selectedOrder}
        onStatusChange={handleDrawerStatusChange}
        role="admin"
      />
    </ProtectedRoute>
  );
};

export default OrdersPage;