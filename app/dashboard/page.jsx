"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineBell, AiOutlineUser, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList, AiOutlineEye, AiOutlineArrowUp } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ScatterChart, Scatter, ZAxis } from "recharts";
import "./page.scss";
import Sidebar from "../../components/Sidebar";
import OrderDetailDrawer from "../../components/OrderDetailDrawer";
import ProtectedRoute from '../../components/ProtectedRoute';

const ordersZigZag = [
  { value: 2 },
  { value: 8 },
  { value: 3 },
  { value: 12 },
  { value: 5 },
  { value: 18 },
  { value: 1 },
  { value: 22 },
  { value: 7 },
  { value: 27 },
];
const salesZigZag = [
  { value: 7 },
  { value: 4 },
  { value: 12 },
  { value: 6 },
  { value: 15 },
  { value: 8 },
  { value: 18 },
  { value: 10 },
  { value: 22 },
  { value: 14 },
];
const productsZigZag = [
  { value: 5 },
  { value: 9 },
  { value: 7 },
  { value: 13 },
  { value: 8 },
  { value: 16 },
  { value: 10 },
  { value: 18 },
  { value: 12 },
  { value: 20 },
];

const categoryData = [
  { x: 1, y: 1, z: 4567, name: "T-shirt", color: "#1976d2" },
  { x: 2, y: 2, z: 3167, name: "Jeans", color: "#00bcd4" },
  { x: 3, y: 3, z: 845, name: "Kid's Collection", color: "#43a047" },
];

export default function DashboardPage() {
  // 1. State variables for summary cards
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 2. Fetch data from backend API
  useEffect(() => {
    async function fetchDashboardData() {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Fetch summary data
      const summaryRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/summary`, { headers });
      const summary = await summaryRes.json();
      setTotalOrders(summary.totalOrders || 0);
      setTotalSales(summary.totalSales || 0);
      setTotalProducts(summary.totalProducts || 0);
      setTotalRevenue(summary.totalRevenue || 0);

      // Fetch revenue chart data (fixed endpoint)
      const revenueChartRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/revenue`, { headers });
      const revenueChart = await revenueChartRes.json();
      setRevenueChartData(Array.isArray(revenueChart) ? revenueChart : []);

      // Fetch recent orders
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, { headers });
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Fetch best selling products from new API
      const bestSellingRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/product-order-counts`, { headers });
      const bestSellingData = await bestSellingRes.json();
      setTopRatedProducts(Array.isArray(bestSellingData) ? bestSellingData : []);
    }

    fetchDashboardData();
  }, []);

  // Best selling products by order count (from API)
  const bestSellingProducts = React.useMemo(() => {
    if (!topRatedProducts.length) return [];
    return [...topRatedProducts].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
  }, [topRatedProducts]);

  return (
    <ProtectedRoute adminOnly>
    <div className="admin-dashboard">
   <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-actions">
            <span className="notif-icon"><AiOutlineBell size={22} /></span>
            <span className="profile-icon"><AiOutlineUser size={22} /></span>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="summary-cards summary-cards-row">
          <div className="summary-card">
            <div className="summary-title">Total Orders </div>
            <div className="summary-desc">Last 7 days</div>
            <div className="summary-value">{totalOrders ?? 0}</div>
            <div className="summary-growth positive">+6% <span>vs last 7 days</span></div>
            <div className="summary-mini-chart">
              <img src="/total-orders.png" alt="Orders Chart" width={190} height={90} style={{ objectFit: 'contain', marginRight:40 }} />
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Total Sales </div>
            <div className="summary-desc">Last 7 days</div>
            <div className="summary-value">{totalSales ? totalSales.toLocaleString() : 0}</div>
            <div className="summary-growth positive">+12% <span>vs last 7 days</span></div>
            <div className="summary-mini-chart">
              <img src="/total-sales.png" alt="Sales Chart"  width={150} height={90} style={{ objectFit: 'contain', marginLeft:30 }} />
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-title1">Total products</div>
            <div className="summary-value">{totalProducts ?? 0}</div>
            <div className="summary-mini-chart">
              <img src="/total-products.png" alt="Products Chart" width={190} height={100} style={{ objectFit: 'contain',}} />
            </div>
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="revenue-section">
          <div className="revenue-header">
            <div>
              <div className="revenue-label">Revenue</div>
              <span className="revenue-value">{totalRevenue ? totalRevenue.toLocaleString() : 0}</span>
              <span className="revenue-growth positive">
                <AiOutlineArrowUp style={{ color: '#27ae60', fontSize: 16, marginRight: 2, verticalAlign: 'middle' }} />
                6% <span>vs last 7 days</span>
              </span>
            </div>
            <div className="revenue-period">This week <FiChevronDown /></div>
          </div>
          <div className="revenue-chart-placeholder" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#rgba(37, 49, 84, 1)" stopOpacity={0.13}/>
                    <stop offset="100%" stopColor="rgba(37, 49, 84, 1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3" stroke="#ececec" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={value => value >= 1000 ? `${value/1000}K` : value}
                />
                <Tooltip contentStyle={{ borderRadius: 1, fontSize: 12, }} />
                <Area type="monotone" dataKey="value" stroke={false} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="value" stroke="#222a3a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Orders Table */}
        <section className="orders-section">
          <div className="orders-header">
            <span>Recent Orders</span>
            <Link href="/order-management" className="view-all">View all</Link>
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
              {orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((order, idx) => (
                  <tr key={order.id || order._id}>
                  <td>
                    <div>#{order.id || order._id}</div>
                  </td>
                  <td>
                    <div>{order.billingDetails?.firstName}</div>
                    <div>{order.billingDetails?.lastName}</div>
                  </td>
                  <td>
                    <div>{order.billingDetails?.email}</div>
                    <div>{order.billingDetails?.phone}</div>
                  </td>
                  <td>
                    <span> {order.billingDetails?.city}</span>,<div>{order.billingDetails?.country}</div>
                   
                  </td>
                  <td>{order.createdAt
                    ? (() => {
                        const d = new Date(order.createdAt);
                        return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
                      })()
                    : "-"
                  }</td>
                  <td>
                    <select
                      className={`status-badge ${order.uiStatus?.color || 'status-new'}`}
                      value={order.paymentStatus}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${order._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          if (!res.ok) throw new Error('Failed to update status');
                          const updatedOrder = await res.json();
                          setOrders((prev) =>
                            prev.map((o) => (o._id === order._id ? { ...o, paymentStatus: updatedOrder.paymentStatus } : o))
                          );
                        } catch (err) {
                          alert('Status update failed: ' + err.message);
                        }
                      }}
                      style={{ padding: '4px 0px', borderRadius: 6, fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer' }}
                      disabled={order.paymentStatus === 'delivered' || order.paymentStatus === 'failed'}
                    >
                      <option value="pending">New</option>
                      <option value="paid">Accepted</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="failed">Canceled</option>
                    </select>
                  </td>
                  <td>Rs:{order.finalTotal}</td>
                  <td>
                    <AiOutlineEye
                      size={20}
                      style={{ color: '#888', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedOrder(mapOrderToDrawer(order));
                        setDrawerOpen(true);
                      }}
                    />
                  </td>
                </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Bottom Section: Top Selling Category & Best Selling Products */}
        <section className="bottom-section">
          <div className="best-products">
            <div className="section-title">Best Selling Products</div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>No. of Orders</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img src={product.imageUrl || "/product1.png"} alt={product.productName} style={{ width: 30, height: 30, marginRight: 10, verticalAlign: "middle" }} />
                      <b>{product.productName}</b>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'rgba(0, 0, 0, 1)', fontSize: 15 }}>
                        {product.orderCount}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${product.status === 'In Stock' ? 'status-green-dot' : 'status-red-dot'}`}></span>
                      <span className="status-text">{product.status === 'In Stock' ? 'Stock' : 'Out'}</span>
                    </td>
                    <td>RS:{Number(product.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
      <OrderDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
      />
    </div>
    </ProtectedRoute>
  );
}