"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Heart, User, LogOut, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";
import FooterContact from "../../components/FooterContact";
import Footer from "../../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout, updateProfile, changePassword, clearError, clearMessage } from "../../store/slices/authSlice";
import { useRouter } from "next/navigation";
import { message, Spin } from "antd";
import "./page.scss";
import ProtectedRoute from "../../components/ProtectedRoute";
import Loader from "../../components/Loader";

// Edit Name Modal Component
function EditNameModal({ isOpen, onClose, currentName, onSave }) {
  const [firstName, setFirstName] = useState(currentName.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentName.split(" ")[1] || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFirstName(currentName.split(" ")[0] || "");
    setLastName(currentName.split(" ")[1] || "");
  }, [currentName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      message.error("First and last name are required");
      return;
    }
    setLoading(true);
    await onSave(firstName, lastName, setLoading);
  };

  return (
    <div className="modal-overlay2" onClick={onClose}>
      <div className="modal2" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title2">Edit Name</h3>
        <div className="form-group2">
          <label className="label2">First Name</label>
          <input
            type="text"
            className="input2"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group2">
          <label className="label2">Last Name</label>
          <input
            type="text"
            className="input2"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="modal-actions2">
          <button className="button cancel-button2" onClick={onClose} disabled={loading}>
            {loading ? <Spin size="small" /> : "Cancel"}
          </button>
          <button className="button save-button2" onClick={handleSave} disabled={loading}>
            {loading ? <Spin size="small" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Phone Modal Component
function EditPhoneModal({ isOpen, onClose, currentPhone, onSave }) {
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setPhone(currentPhone);
  }, [currentPhone]);
  if (!isOpen) return null;

  const handleSave = async () => {
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      message.error("Please enter a valid phone number (10-15 digits)");
      return;
    }
    setLoading(true);
    await onSave(phone, setLoading);
  };

  return (
    <div className="modal-overlay2" onClick={onClose}>
      <div className="modal2" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title2">Edit Phone Number</h3>
        <div className="form-group2">
          <label className="label2">Phone Number</label>
          <input
            type="tel"
            className="input2 phone-input2"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="modal-actions2">
          <button className="button cancel-button2" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="button save-button2" onClick={handleSave} disabled={loading}>
            {loading ? <Spin size="small" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Change Password Modal Component
function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      message.error("New password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    await onSave(currentPassword, newPassword, setLoading);
  };

  return (
    <div className="modal-overlay2" onClick={onClose}>
      <div className="modal2" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title2">Change Password</h3>
        <div className="form-group2">
          <label className="label2">Current password</label>
          <div className="password-group2">
            <input
              type={showCurrent ? "text" : "password"}
              className="input2 password-input2"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <button className="eye-button2" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="form-group2">
          <label className="label2">New password</label>
          <div className="password-group2">
            <input
              type={showNew ? "text" : "password"}
              className="input2 password-input2"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button className="eye-button2" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="form-group2">
          <label className="label2">Confirm new password</label>
          <div className="password-group2">
            <input
              type={showConfirm ? "text" : "password"}
              className="input2 password-input2"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button className="eye-button2" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="modal-actions2">
          <button className="button cancel-button2" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="button save-button2" onClick={handleSave} disabled={loading}>
            {loading ? <Spin size="small" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Profile Page Component
export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading, error, message: successMessage } = useSelector((state) => state.auth);

  // AntD message context for reliable toasts
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const userFromStorage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    if (userFromStorage?.userId && userFromStorage?.token) {
      dispatch(getProfile({ id: userFromStorage.userId, token: userFromStorage.token }));
      
    } else {
      router.push("/login");
    }
  }, [dispatch, router]);

  const [modals, setModals] = useState({
    editName: false,
    editPhone: false,
    changePassword: false,
  });

  const [activeLink, setActiveLink] = useState("My Info");

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    dispatch(clearError());
    dispatch(clearMessage());
  };

  const handleNameSave = async (firstName, lastName, setLoading) => {
    if (!user?.userId || !user?.token) {
      messageApi.error("User not authenticated");
      setLoading(false);
      return;
    }
    const name = `${firstName} ${lastName}`.trim();
    try {
      await dispatch(updateProfile({ id: user.userId, name, phone: user.phone, token: user.token })).unwrap();
      messageApi.success("Name updated successfully!");
      closeModal("editName");
    } catch (err) {
      messageApi.error(err || "Failed to update name");
    }
    setLoading(false);
  };

  const handlePhoneSave = async (phone, setLoading) => {
    if (!user?.userId || !user?.token) {
      messageApi.error("User not authenticated");
      setLoading(false);
      return;
    }
    try {
      await dispatch(updateProfile({ id: user.userId, phone, name: user.name, token: user.token })).unwrap();
      messageApi.success("Phone updated successfully!");
      closeModal("editPhone");
    } catch (err) {
      messageApi.error(err || "Failed to update phone");
    }
    setLoading(false);
  };

  const handlePasswordSave = async (currentPassword, newPassword, setLoading) => {
    if (!user?.userId || !user?.token) {
      messageApi.error("User not authenticated");
      setLoading(false);
      return;
    }
    try {
      await dispatch(changePassword({ id: user.userId, currentPassword, newPassword, token: user.token })).unwrap();
      messageApi.success("Password updated successfully!");
      closeModal("changePassword");
    } catch (err) {
      messageApi.error(err || "Failed to update password");
    }
    setLoading(false);
  };

  const handleLinkClick = (linkName) => {
    if (linkName === "Sign out") {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      dispatch(logout());
      router.push('/');
    } else {
      setActiveLink(linkName);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ProtectedRoute>
      <>
        {contextHolder}
        <Navbar />
        <div className="container2">
          {/* Sidebar */}
          <div className="sidebar2">
            <div className="container breadcrumb">
              <div className="breadcrumb-list">
                <Link href="/" className="breadcrumb-link">
                  Home
                </Link>
                <span> / </span>
                <Link href="/profile" className="breadcrumb-link">
                  My Account
                </Link>
                <span> / </span>
                <Link href="/profile" className="breadcrumb-link">
                  Personal Info
                </Link>
              </div>
            </div>

            <div className="welcome2">
              <div className="alag">
                <div className="section-indicator"></div>
                <h2 className="welcome-title2">Hello, {user?.name}</h2>
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
            <div className="header2">
              <h1 className="header-title2">My Info</h1>
            </div>

            <div className="section2">
              <h2 className="section-title2">Contact Details</h2>

              <div className="field2">
                <div className="field-info2">
                  <p className="field-label2">Your Name</p>
                  <p className="field-value2">{user?.name}</p>
                </div>
                <button className="change-button2" onClick={() => openModal("editName")}>
                  Change
                </button>
              </div>

              <div className="field2">
                <div className="field-info2">
                  <p className="field-label2">Email Address</p>
                  <p className="field-value2">{user?.email}</p>
                </div>
              </div>

              <div className="field2">
                <div className="field-info2">
                  <p className="field-label2">Phone Number</p>
                  <p className="field-value2">{user?.phone || 'Not provided'}</p>
                </div>
                <button className="change-button2" onClick={() => openModal("editPhone")}>
                  Change
                </button>
              </div>

              <div className="field2">
                <div className="field-info2">
                  <p className="field-label2">Password</p>
                  <p className="field-value2">••••••••</p>
                </div>
                <button className="change-button2" onClick={() => openModal("changePassword")}>
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Modals */}
          {modals.editName && (
            <EditNameModal
              isOpen={modals.editName}
              onClose={() => closeModal("editName")}
              currentName={user?.name || ''}
              onSave={handleNameSave}
            />
          )}

          {modals.editPhone && (
            <EditPhoneModal
              isOpen={modals.editPhone}
              onClose={() => closeModal("editPhone")}
              currentPhone={user?.phone || ''}
              onSave={handlePhoneSave}
            />
          )}

          {modals.changePassword && (
            <ChangePasswordModal
              isOpen={modals.changePassword}
              onClose={() => closeModal("changePassword")}
              onSave={handlePasswordSave}
            />
          )}
        </div>
        <FooterContact />
        <Footer />
      </>
    </ProtectedRoute>
  );
}