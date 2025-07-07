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

const statusMap = {
  pending: { label: "Order Received", color: "#1976d2" },
  accepted: { label: "Order Accepted", color: "#17A2B8" },
  "out-for-delivery": { label: "Out For Delivery", color: "#f5b50a" },
  delivered: { label: "Delivered", color: "#43a047" },
  cancelled: { label: "Declined", color: "#E53911" },
  failed: { label: "Declined", color: "#E53911" },
};

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
  if (currentStatus === "accepted") {
    return [
      { value: "out-for-delivery", label: STATUS_MAP["out-for-delivery"].label },
      { value: "delivered", label: STATUS_MAP["delivered"].label },
      { value: "cancelled", label: STATUS_MAP["cancelled"].label },
    ];
  }
  if (currentStatus === "out-for-delivery") {
    return [
      { value: "delivered", label: STATUS_MAP["delivered"].label },
      { value: "cancelled", label: STATUS_MAP["cancelled"].label },
    ];
  }
  return [];
}

function getStatusKey(order) {
  if (!order) return "pending";
  const validKeys = Object.keys(STATUS_MAP);

  // Check orderStatus (key or label)
  if (order.orderStatus && validKeys.includes(order.orderStatus)) return order.orderStatus;
  if (order.orderStatus) {
    const labelToKey = {};
    for (const [key, val] of Object.entries(STATUS_MAP)) {
      labelToKey[val.label.toLowerCase()] = key;
    }
    if (labelToKey[order.orderStatus.toLowerCase()]) return labelToKey[order.orderStatus.toLowerCase()];
  }

  // Check currentStatus (key or label)
  if (order.currentStatus && validKeys.includes(order.currentStatus)) return order.currentStatus;
  if (order.currentStatus) {
    const labelToKey = {};
    for (const [key, val] of Object.entries(STATUS_MAP)) {
      labelToKey[val.label.toLowerCase()] = key;
    }
    if (labelToKey[order.currentStatus.toLowerCase()]) return labelToKey[order.currentStatus.toLowerCase()];
  }

  return "pending";
}

function getToken() {
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(localStorage.getItem("user"))?.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

export default function OrderDetailDrawer({ open, onClose, order, onStatusChange }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.order);

  // Move all useState hooks to the top
  const [localOrder, setLocalOrder] = useState(order || {});
  const [declineReason, setDeclineReason] = useState("");
  const [drawerWidth, setDrawerWidth] = useState("50%");
  const [statusUpdatesOpen, setStatusUpdatesOpen] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);
  const [localDeclineReason, setLocalDeclineReason] = useState("");

  // DEBUG: Log statusKey and orderStatus to verify mapping
  const statusKey = getStatusKey(localOrder);
  console.log('DEBUG statusKey:', statusKey, 'orderStatus:', localOrder.orderStatus, localOrder);

  useEffect(() => {
    setLocalOrder(order || {});
    setDeclineReason("");
    setCancelModalOpen(false);
    setCancelReason("");
    setPendingStatus(null);
    setLocalDeclineReason("");
    if (error) dispatch(clearOrderError());
  }, [order, open]);

  useEffect(() => {
    if (success && onStatusChange) {
      onStatusChange(localOrder.orderStatus);
    }
    // eslint-disable-next-line
  }, [success]);

  // Responsive drawer width
  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth <= 1100) {
        setDrawerWidth("100%");
      } else if (window.innerWidth <= 1440) {
        setDrawerWidth("70%");
      } else {
        setDrawerWidth("50%");
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!open) return null;
  if (!localOrder) return null;

  const isFinal = FINAL_STATUSES.includes(statusKey);
  const statusInfo = STATUS_MAP[statusKey] || {};
  const statusIndex = STATUS_STEPS.indexOf(statusKey);

  function handleAccept() {
    const token = getToken();
    dispatch(updateOrderStatus({
      orderId: localOrder.orderId || localOrder.id || localOrder._id,
      status: "accepted",
      token,
    }));
    // Drawer close par state reset
    setDeclineReason("");
    setCancelModalOpen(false);
    setCancelReason("");
    setPendingStatus(null);
    setLocalDeclineReason("");
  }
  function handleDecline() {
    if (!declineReason.trim()) return;
    const token = getToken();
    dispatch(updateOrderStatus({
      orderId: localOrder.orderId || localOrder.id || localOrder._id,
      status: "cancelled",
      reason: declineReason.trim(),
      cancelledBy: "admin",
      token,
    }));
    // Drawer close par state reset
    setDeclineReason("");
    setCancelModalOpen(false);
    setCancelReason("");
    setPendingStatus(null);
    setLocalDeclineReason("");
  }
  function handleDropdownChange(e) {
    const value = e.target.value;
    const token = getToken();
    if (value === "cancelled") {
      const reason = prompt("Please provide a reason for cancelling this order:");
      if (!reason) return;
      dispatch(updateOrderStatus({
        orderId: localOrder.orderId || localOrder.id || localOrder._id,
        status: "cancelled",
        reason,
        cancelledBy: "admin",
        token,
      }));
    } else {
      dispatch(updateOrderStatus({
        orderId: localOrder.orderId || localOrder.id || localOrder._id,
        status: value,
        token,
      }));
    }
  }

  // Status steps index logic (use statusKey)
  const statusStepsKeys = ['pending', 'accepted', 'out-for-delivery', 'delivered'];

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          onClose();
          // Drawer close par state reset
          setDeclineReason("");
          setCancelModalOpen(false);
          setCancelReason("");
          setPendingStatus(null);
          setLocalDeclineReason("");
        }}
        width={drawerWidth}
        closable={false}
        maskClosable={true}
        className="order-detail-drawer"
        styles={{ body: { padding: 0, background: '#fff', overflow: 'auto', height: '100%' } }}
        destroyOnClose
      >
        {/* Header */}
        <div className="order-detail-drawer__header">
          <div>Order #{localOrder.orderId || localOrder.id || localOrder._id}</div>
          <button className="order-detail-drawer__close" onClick={onClose}>&times;</button>
        </div>

        {/* Cancelled Alert */}
        {statusKey === "cancelled" && (
          <div style={{
            background: 'rgba(208, 38, 38, 0.05)',
            border: 'none',
            borderRadius: 4,
            padding: '18px 20px 14px 20px',
            margin: '18px 24px 0 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <svg style={{marginTop: 2, flexShrink: 0}} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="11" fill="#FF4D4F" fillOpacity="0.12"/>
              <path d="M11 6.5V12.5" stroke="#FF4D4F" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="11" cy="15.2" r="1.1" fill="#FF4D4F"/>
            </svg>
            <div>
              <div style={{fontWeight: 700, color: 'rgba(0, 0, 0, 1)', fontSize: 16, marginBottom: 2}}>Order cancelled by Admin</div>
              <div style={{fontWeight: 500, color: '#222', fontSize: 15}}>
                <span style={{fontWeight: 600}}>Reason:</span> {localDeclineReason || localOrder.cancelReason || "The shipping address provided was incorrect or incomplete."}
              </div>
            </div>
          </div>
        )}

        <div className="section-divider"></div>

        {/* Ordered Items */}
        <div className="order-detail-drawer__items">
          <div className="order-detail-drawer__section-title">Ordered Items</div>
          {Array.isArray(localOrder.items) && localOrder.items.map((item, idx) => (
            <div className="order-detail-drawer__item-row" key={idx}>
              <img className="order-detail-drawer__item-img" src={item.image} alt={item.name} />
              <div className="order-detail-drawer__item-info">
                <div className="order-detail-drawer__item-name">{item.name} <span style={{ fontWeight: 400, color: "#888" }}>x {item.qty}</span></div>
                <div className="order-detail-drawer__item-color">Color : <span
                                        style={{
                                          display: "inline-block",
                                          width: "16px",
                                          height: "12px",
                                          backgroundColor: item.color,
                                          border: "1px solid #ccc",
                                          verticalAlign: "middle",
                                          marginLeft: "5px",
                                        }}
                                      ></span></div>
              </div>
              <div className="order-detail-drawer__item-price">Rs:{item.price}</div>
            </div>
          ))}
        </div>

        <div className="section-divider"></div>

        {/* Status Steps */}
        <div className="order-detail-drawer__status-steps">
          {statusSteps.map((step, idx) => {
            // If cancelled/declined, only highlight up to the last status before cancellation/decline
            const highlight = statusKey === 'cancelled' || statusKey === 'failed' ? idx < statusIndex : idx <= statusIndex;
            return (
            <div className="order-detail-drawer__status-step" key={step}>
                <div className={`order-detail-drawer__status-circle${highlight ? " order-detail-drawer__status-circle--active" : ""}`}>{highlight ? "✓" : idx + 1}</div>
                <div className={`order-detail-drawer__status-label${highlight ? " order-detail-drawer__status-label--active" : ""}`}>{step}</div>
            </div>
            );
          })}
        </div>
        
        {/* Status Progress Bar */}
        <div className="order-detail-drawer__progress-bar">
          <div
            className="order-detail-drawer__progress"
            style={{ width: `${((statusKey === 'cancelled' || statusKey === 'failed' ? statusIndex : statusIndex + 1) / statusSteps.length) * 100}%` }}
          />
        </div>

        <div className="section-divider"></div>

        {/* Info Sections */}
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
                <span className="order-detail-drawer__info-row-label" style={{marginLeft: 14}}>State:</span>
                <span className="order-detail-drawer__info-row-value">{localOrder.shipping?.state || ""}</span>
                <span className="order-detail-drawer__info-row-label" style={{marginLeft: 14}}>City:</span>
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
                <span className="order-detail-drawer__info-row-label" style={{marginLeft: 14}}>Invoice no:</span>
                <span className="order-detail-drawer__info-row-value">#{localOrder.shipping?.invoiceNo || ""}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Updates */}
        <div className="order-detail-drawer__status-updates">
          <div
            className="order-detail-drawer__status-updates-card"
            style={{marginTop: 20}}
          >
            <div
              className="order-detail-drawer__status-updates-header"
              onClick={() => setStatusUpdatesOpen((open) => !open)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              aria-expanded={statusUpdatesOpen}
              tabIndex={0}
            >
              Order Status Updates
              <svg
                width="20"
                height="16"
                viewBox="0 0 22 16"
                style={{
                  marginLeft: 8,
                  transform: statusUpdatesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="11,13 3,3 19,3"
                  fill="#222"
                  stroke="#F2994A"
                  strokeWidth="1"
                />
              </svg>
            </div>
            {Array.isArray(localOrder.statusUpdates) && localOrder.statusUpdates.map((update, idx) => (
              <div className="order-detail-drawer__status-update-row" key={idx}>
                <span className="order-detail-drawer__status-update-date">{update.date}</span>
                <span className="order-detail-drawer__status-update-status">{update.status}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Total Bill & Actions */}
        <div className="order-detail-drawer__footer">
          <div className="order-detail-drawer__total">Total bill: <span>Rs:{localOrder.total || 0}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            {statusKey === 'pending' ? (
              // Accept/Decline buttons
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  style={{
                    background: '',
                    color: 'rgba(229, 46, 6, 1)',
                    fontWeight: 500,
                    fontSize: 14,
                    border: '2px solid rgba(229, 46, 6, 1)',
                    borderRadius: 4,
                    padding: '8px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={handleDecline}
                >
                  Decline Order
                </button>
                <button
                  style={{
                    background: 'rgba(229, 46, 6, 1)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 14,
                    border: 'rgba(229, 46, 6, 1)',
                    borderRadius: 4,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(67,160,71,0.2)',
                  }}
                  onClick={handleAccept}
                >
                  Accept Order
                </button>
              </div>
            ) : (statusKey === 'accepted' || statusKey === 'out-for-delivery') ? (
              // Dropdown for accepted or out-for-delivery
              <select
                style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontWeight: 500 }}
                value={statusKey}
                onChange={handleDropdownChange}
              >
                {getStatusOptions(statusKey).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              // Only status label for delivered/cancelled/failed
              <span style={{ color: statusInfo.color, fontWeight: 600, fontSize: 16, marginLeft: 4 }}>{statusInfo.label}</span>
            )}
          </div>
        </div>
      </Drawer>
      {/* Cancel Reason Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => { setCancelModalOpen(false); setCancelReason(""); setPendingStatus(null); }}
        footer={null}
        centered
        closable={false}
        width={400}
        bodyStyle={{ borderRadius: 24, padding: 16, background: '#fff' }}
      >
        <div style={{ fontWeight: 600, fontSize: 28, color: 'rgba(60, 66, 66, 1)', marginBottom: 24 }}>Cancel Order</div>
        <div style={{ fontWeight: 500, fontSize: 16, color: 'rgba(0, 0, 0, 1)', marginBottom: 10 }}>Enter Reason</div>
        <textarea
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          placeholder="Message"
          style={{
            width: '90%',
            minHeight: 120,
            border: 'none',
            background: '#F7F7F7',
            borderRadius: 12,
            padding: 18,
            fontSize: 16,
            color: '#444',
            marginBottom: 32,
            resize: 'none',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#222',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              padding: '12px 16px 12px 16px',
              borderRadius: 8,
            }}
            onClick={() => { setCancelModalOpen(false); setCancelReason(""); setPendingStatus(null); }}
          >
            Cancel
          </button>
          <button
            style={{
              background: '#E53911',
              color: '#fff',
              fontWeight: 500,
              fontSize: 16,
              border: 'none',
              borderRadius: 4,
              padding: '12px 16px 12px 16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(229,57,17,0.08)',
              transition: 'background 0.2s',
            }}
            disabled={!cancelReason.trim()}
            onClick={() => {
              setCancelModalOpen(false);
              setLocalDeclineReason(cancelReason);
              setCancelReason("");
              if (pendingStatus) {
                handleDecline();
                setPendingStatus(null);
              }
            }}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
} 
