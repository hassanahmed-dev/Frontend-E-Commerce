import React from "react";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineDashboard, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUnorderedList } from "react-icons/ai";
import "./Sidebar.scss";

const Sidebar = ({ activePage = "" }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        AEPL Store
        <span style={{ float: "right", fontSize: 20, marginTop: 2 }}>
          <AiOutlineMenu />
        </span>
      </div>
      <div className="sidebar-section">
        <p>MAIN MENU</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={activePage === "dashboard" ? "active" : ""}>
            <Link href="/dashboard">
              <AiOutlineDashboard style={{ marginRight: 8 }} />Dashboard
            </Link>
          </li>
          <li className={activePage === "order-management" ? "active" : ""}>
            <Link href="/order-management">
              <AiOutlineShoppingCart style={{ marginRight: 8 }} />Order Management
            </Link>
          </li>
          <li className={activePage === "reviews" ? "active" : ""}>
            <Link href="/reviews">
              <AiOutlineStar style={{ marginRight: 8 }} />Reviews
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-section">
        <p>PRODUCTS</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={activePage === "product-list" ? "active" : ""}>
            <Link href="/product-list">
              <AiOutlineUnorderedList style={{ marginRight: 8 }} />Product List
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 