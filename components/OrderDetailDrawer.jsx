"use client";

import React, { useState, useEffect } from "react";
import { Drawer, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus, clearOrderError } from "../store/slices/orderSlice";
import "./OrderDetailDrawer.scss";

const statusSteps = [
  "Order Received",
  "Order Accepted",
  "Out For Delivery",
  "Delivered",
];

const STATUS_MAP = {
  pending: { label: "Order Received", color: "#1976D2" },
  accepted: { label: "Order Accepted", color: "#43a047" },
  "out-for-delivery": { label: "Out For Delivery", color: "#F9A825" },
  delivered: { label: "Delivered", color: "#388e3c" },
  cancelled: { label: "Cancelled", color: "#E53935" },
  failed: { label: "Failed", color: "#E53935" },
};

const STATUS_STEPS = ["pending", "accepted", "out-for-delivery", "delivered"];
const FINAL_STATUSES = ["delivered", "cancelled", "failed"];

function getStatusOptions(currentStatus) {
  console.log("getStatusOptions called with:", currentStatus);
  switch (currentStatus) {
    case "pending":
      return [
        { value: "accepted", label: STATUS_MAP["accepted"].label },
        { value: "cancelled", label: STATUS_MAP["cancelled"].label },
      ];
    case "accepted":
      return [
        { value: "out-for-delivery", label: STATUS_MAP["out-for-delivery"].label },
        { value: "delivered", label: STATUS_MAP["delivered"].label },
        { value: "cancelled", label: STATUS_MAP["cancelled"].label },
      ];
    case "out-for-delivery":
      return [
        { value: "delivered", label: STATUS_MAP["delivered"].label },
        { value: "cancelled", label: STATUS_MAP["cancelled"].label },
      ];
    default:
      return [];
  }
}

function getStatusKey(order) {
  if (!order) return "pending";
  const validKeys = Object.keys(STATUS_MAP);
  const status = order.orderStatus?.toLowerCase() || "pending";
  if (validKeys.includes(status)) {
    console.log("Matched orderStatus:", status);
    return status;
  }
  console.log("Defaulting to pending, order:", order);
  return "pending";
}

function getToken() {
  if (typeof window !== "undefined") {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      console.log("Retrieved token:", token);
      return token || null;
    } catch (e) {
      console.error("Token parsing error:", e);
      return null;
    }
  }
  return null;
}

const isOrderCancelled = (order) => {
  const status = (order?.orderStatus || '').toLowerCase();
  return status === 'cancelled' || status === 'failed';
};

function isValidObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
}

export default function OrderDetailDrawer({ open, onClose, order, onStatusChange, role }) {
  const dispatch = useDispatch();
  const { loading, error, success, orders } = useSelector((state) => state.order);

  const [localOrder, setLocalOrder] = useState(order || {});
  const [cancelReason, setCancelReason] = useState("");
  const [drawerWidth, setDrawerWidth] = useState("50%");
  const [statusUpdatesOpen, setStatusUpdatesOpen] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    console.log("Order prop received:", order);
    if (order) {
      console.log("Order details:", {
        _id: order._id,
        orderStatus: order.orderStatus,
        customer: order.customer?.name,
        shipping: order.shipping?.city,
      });
    }
    setLocalOrder(order || {});
    setCancelReason("");
    setCancelModalOpen(false);
    if (error) dispatch(clearOrderError());
  }, [order, open, dispatch, error]);

  useEffect(() => {
    if (success && orders.length > 0) {
      const updatedOrder = orders.find(o => o._id === localOrder._id);
      if (updatedOrder) {
        console.log("Syncing localOrder with Redux store:", updatedOrder);
        setLocalOrder(updatedOrder);
      }
      if (onStatusChange) onStatusChange(localOrder.orderStatus, localOrder);
    }
  }, [success, orders, onStatusChange, localOrder._id]);

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth <= 1100) setDrawerWidth("100%");
      else if (window.innerWidth <= 1440) setDrawerWidth("70%");
      else setDrawerWidth("50%");
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!open || !localOrder) return null;

  const statusKey = getStatusKey(localOrder);
  console.log("Current statusKey:", statusKey, "LocalOrder:", localOrder);
  const isFinal = FINAL_STATUSES.includes(statusKey);
  const statusInfo = STATUS_MAP[statusKey] || {};
  const statusIndex = STATUS_STEPS.indexOf(statusKey);

  function handleAccept() {
    const token = getToken();
    const orderId = localOrder._id;
    if (!token) {
      console.error("No token available for accept action");
      return;
    }
    if (!isValidObjectId(orderId)) {
      alert("Order cannot be updated. Please refresh the page or contact support.");
      console.error("Invalid or missing MongoDB _id for accept action, LocalOrder:", localOrder);
      return;
    }
    console.log("Accepting order. OrderId:", orderId, "Current Status:", localOrder.orderStatus, "Customer:", localOrder.customer?.name);
    dispatch(updateOrderStatus({
      orderId,
      status: "accepted",
      token,
    })).then((action) => {
      if (action.payload) {
        setLocalOrder((prev) => ({
          ...prev,
          orderStatus: "accepted",
          statusUpdates: [...(prev.statusUpdates || []), { status: "accepted", date: new Date() }],
        }));
      } else if (action.error) {
        console.error("Accept failed:", action.error.message);
      }
    });
    setCancelReason("");
    setCancelModalOpen(false);
  }

  function handleDecline() {
    if (!cancelReason.trim()) {
      console.error("Cancel reason is empty");
      return;
    }
    const token = getToken();
    const orderId = localOrder._id;
    if (!token) {
      console.error("No token available for decline action");
      return;
    }
    if (!isValidObjectId(orderId)) {
      alert("Order cannot be updated. Please refresh the page or contact support.");
      console.error("Invalid or missing MongoDB _id for decline action, LocalOrder:", localOrder);
      return;
    }
    console.log("Declining order. OrderId:", orderId, "Reason:", cancelReason, "Current Status:", localOrder.orderStatus, "Customer:", localOrder.customer?.name);
    dispatch(updateOrderStatus({
      orderId,
      status: "cancelled",
      reason: cancelReason.trim(),
      cancelledBy: role === "admin" ? "admin" : "user",
      token,
    })).then((action) => {
      if (action.payload) {
        setLocalOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
          cancellationReason: cancelReason,
          cancelledBy: role === "admin" ? "admin" : "user",
          statusUpdates: [...(prev.statusUpdates || []), { status: "cancelled", date: new Date() }],
        }));
      } else if (action.error) {
        console.error("Decline failed:", action.error.message);
      }
    });
    setCancelReason("");
    setCancelModalOpen(false);
  }

  function handleDropdownChange(e) {
    const value = e.target.value;
    const token = getToken();
    const orderId = localOrder._id;
    if (!token) {
      console.error("No token available for status change");
      return;
    }
    if (!isValidObjectId(orderId)) {
      alert("Order cannot be updated. Please refresh the page or contact support.");
      console.error("Invalid or missing MongoDB _id for status change, LocalOrder:", localOrder);
      return;
    }
    if (value === "cancelled") {
      setCancelModalOpen(true);
    } else {
      console.log("Changing status to:", value, "OrderId:", orderId, "Current Status:", localOrder.orderStatus, "Customer:", localOrder.customer?.name);
      dispatch(updateOrderStatus({
        orderId,
        status: value,
        token,
      })).then((action) => {
        if (action.payload) {
          setLocalOrder((prev) => ({
            ...prev,
            orderStatus: value,
            statusUpdates: [...(prev.statusUpdates || []), { status: value, date: new Date() }],
          }));
        } else if (action.error) {
          console.error("Status change failed:", action.error.message);
        }
      });
    }
  }

  const isDelivered = statusKey === 'delivered';
  const cancelled = isOrderCancelled(localOrder);

  function renderFooterActions() {
    if (isDelivered) {
      return (
        <span style={{ color: '#388e3c', fontWeight: 600, fontSize: 16, marginLeft: 4 }}>Delivered</span>
      );
    }
    if (cancelled) {
      return (
        <span style={{ color: '#E53935', fontWeight: 600, fontSize: 16, marginLeft: 4 }}>Cancelled</span>
      );
    }
    if (statusKey === 'pending' && role === 'user') {
      return (
        <button
          style={{
            background: '#E53935',
            color: '#fff',
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(229,57,17,0.08)',
          }}
          onClick={() => setCancelModalOpen(true)}
          disabled={loading}
        >
          Cancel Order
        </button>
      );
    }
    if (role === 'admin') {
      if (statusKey === 'pending') {
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{
                color: 'rgba(229, 46, 6, 1)',
                fontWeight: 500,
                fontSize: 14,
                border: '2px solid rgba(229, 46, 6, 1)',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
              onClick={() => setCancelModalOpen(true)}
              disabled={loading}
            >
              Decline
            </button>
            <button
              style={{
                background: 'rgba(67, 160, 71, 1)',
                color: 'white',
                fontWeight: 500,
                fontSize: 14,
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(67,160,71,0.2)',
              }}
              onClick={handleAccept}
              disabled={loading}
            >
              Accept
            </button>
          </div>
        );
      }
      if (getStatusOptions(statusKey).length > 0) {
        return (
          <select
            value={statusKey}
            onChange={handleDropdownChange}
            style={{
              padding: '6px 12px',
              fontSize: 14,
              borderRadius: 4,
              border: '1px solid #ccc',
              outline: 'none',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            <option value={statusKey} disabled>{statusInfo.label}</option>
            {getStatusOptions(statusKey).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      }
    }
    return null;
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          onClose();
          setCancelReason("");
          setCancelModalOpen(false);
        }}
        width={drawerWidth}
        closable={false}
        maskClosable={true}
        className="order-detail-drawer"
        styles={{ body: { padding: 0, background: "#fff", overflow: "auto", height: "100%" } }}
        destroyOnClose
      >
        <div className="order-detail-drawer__header">
          <div>Order #{localOrder.id || localOrder._id}</div>
          <button className="order-detail-drawer__close" onClick={onClose}>×</button>
        </div>

        {cancelled && (
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
            <span style={{ color: '#E53911', fontSize: 22, marginTop: 2, flexShrink: 0 }}>⚠</span>
            <div>
              <div style={{ fontWeight: 700, color: '#222', fontSize: 16, marginBottom: 2 }}>
                Order cancelled by {localOrder.cancelledBy === 'user' ? 'You' : 'Admin'}
              </div>
              <div style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>
                <span style={{ fontWeight: 600 }}>Reason:</span> {localOrder.cancellationReason || 'No reason provided.'}
              </div>
            </div>
          </div>
        )}

        <div className="section-divider"></div>

        <div className="order-detail-drawer__items">
          <div className="order-detail-drawer__section-title">Ordered Items</div>
          {Array.isArray(localOrder.items) &&
            localOrder.items.map((item, idx) => (
              <div className="order-detail-drawer__item-row" key={idx}>
                <img className="order-detail-drawer__item-img" src={item.image} alt={item.name} />
                <div className="order-detail-drawer__item-info">
                  <div className="order-detail-drawer__item-name">
                    {item.name} <span style={{ fontWeight: 400, color: "#888" }}>x {item.quantity}</span>
                  </div>
                  <div className="order-detail-drawer__item-color">
                    Color: <span style={{ display: "inline-block", width: "16px", height: "12px", backgroundColor: item.color, border: "1px solid #ccc", verticalAlign: "middle", marginLeft: "5px" }}></span>
                  </div>
                </div>
                <div className="order-detail-drawer__item-price">Rs:{item.price}</div>
              </div>
            ))}
        </div>

        <div className="section-divider"></div>

        {!cancelled && (
          <div className="order-detail-drawer__status-steps">
            {statusSteps.map((step, idx) => {
              const highlight = idx <= statusIndex;
              return (
                <div className="order-detail-drawer__status-step" key={step}>
                  <div className={`order-detail-drawer__status-circle${highlight ? " order-detail-drawer__status-circle--active" : ""}`}>
                    {highlight ? "✓" : idx + 1}
                  </div>
                  <div className={`order-detail-drawer__status-label${highlight ? " order-detail-drawer__status-label--active" : ""}`}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="order-detail-drawer__progress-bar">
          <div className="order-detail-drawer__progress" style={{ width: `${((statusIndex + 1) / statusSteps.length) * 100}%` }} />
        </div>

        <div className="section-divider"></div>

        <div className="order-detail-drawer__info-row">
          <div className="order-detail-drawer__info-card">
            <span className="order-detail-drawer__info-label">Customer Info</span>
            <div className="order-detail-drawer__info-list">
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Full name:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.customer?.name || ""}</span>
              </div>
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Phone:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.customer?.phone || ""}</span>
              </div>
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Email:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.customer?.email || ""}</span>
              </div>
            </div>
          </div>
          <div className="order-detail-drawer__info-card">
            <span className="order-detail-drawer__info-label">Shipping / Payment Info</span>
            <div className="order-detail-drawer__info-list">
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Country:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.country || ""}</span>
                <span className="order-detail-drawer__info-row-label" style={{ marginLeft: 14 }}>State:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.state || ""}</span>
                <span className="order-detail-drawer__info-row-label" style={{ marginLeft: 14 }}>City:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.city || ""}</span>
              </div>
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Address:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.address || ""}</span>
              </div>
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Postal Code:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.postalCode || ""}</span>
              </div>
              <div className="order-detail-drawer__info-row-item">
                <span className="order-detail-drawer__info-row-label">Payment Method:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.paymentMethod || ""}</span>
                <span className="order-detail-drawer__info-row-label" style={{ marginLeft: 14 }}>Invoice no:</span>
                <span className="order-detail-drawer__info-row-value">#{localOrder.shipping?.invoiceNo || ""}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-detail-drawer__status-updates">
          <div className="order-detail-drawer__status-updates-card" style={{ marginTop: 20 }}>
            <div
              className="order-detail-drawer__status-updates-header"
              onClick={() => setStatusUpdatesOpen((open) => !open)}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-expanded={statusUpdatesOpen}
              tabIndex={0}
            >
              Order Status History
              <svg
                width="20"
                height="16"
                viewBox="0 0 22 16"
                style={{
                  marginLeft: 8,
                  transform: statusUpdatesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="11,13 3,3 19,3" fill="#222" stroke="#F2994A" strokeWidth="1" />
              </svg>
            </div>
            {statusUpdatesOpen && Array.isArray(localOrder.statusUpdates) &&
              localOrder.statusUpdates.map((update, idx) => (
                <div className="order-detail-drawer__status-update-row" key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span className="order-detail-drawer__status-update-status" style={{ fontWeight: 600 }}>
                    {STATUS_MAP[update.status]?.label || update.status}
                  </span>
                  <span className="order-detail-drawer__status-update-date" style={{ color: '#888', fontSize: 13 }}>
                    {update.date ? new Date(update.date).toLocaleString() : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="order-detail-drawer__footer">
          <div className="order-detail-drawer__total">
            Total bill: <span>Rs:{localOrder.total || 0}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            {cancelled && (
              <span style={{ color: '#E53935', fontWeight: 600, fontSize: 16, marginLeft: 4 }}>{statusInfo.label}</span>
            )}
            {!cancelled && renderFooterActions()}
          </div>
        </div>
      </Drawer>

      <Modal
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
        }}
        footer={null}
        centered
        closable={false}
        width={400}
        bodyStyle={{ borderRadius: 24, padding: 16, background: "#fff" }}
      >
        <div style={{ fontWeight: 600, fontSize: 28, color: "rgba(60, 66, 66, 1)", marginBottom: 24 }}>
          Cancel Order
        </div>
        <div style={{ fontWeight: 500, fontSize: 16, color: "rgba(0, 0, 0, 1)", marginBottom: 10 }}>
          Enter Reason
        </div>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Message"
          style={{
            width: "90%",
            minHeight: 120,
            border: "none",
            background: "#F7F7F7",
            borderRadius: 12,
            padding: 18,
            fontSize: 16,
            color: "#444",
            marginBottom: 32,
            resize: "none",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 18 }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              padding: "12px 16px",
              borderRadius: 8,
            }}
            onClick={() => {
              setCancelModalOpen(false);
              setCancelReason("");
            }}
          >
            Cancel
          </button>
          <button
            style={{
              background: "#E53911",
              color: "#fff",
              fontWeight: 500,
              fontSize: 16,
              border: "none",
              borderRadius: 4,
              padding: "12px 16px",
              cursor: 'pointer',
              boxShadow: "0 2px 8px rgba(229,57,17,0.08)",
              transition: "background 0.2s",
            }}
            disabled={!cancelReason.trim() || loading}
            onClick={handleDecline}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </Modal>
    </>
  );
}