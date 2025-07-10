"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input, Button, message as antdMessage } from "antd"
import { Spin } from "antd"
import { ChevronRight, Trash2, Tag, ArrowRight, Minus, Plus } from "lucide-react"
import "./page.scss"
import FooterContact from "../../components/FooterContact"
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import ProtectedRoute from "../../components/ProtectedRoute"
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { useRouter } from "next/navigation"
// import Loader from "../../components/Loader";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: cartItems, total, discount, shipping, finalTotal, loading, error } = useSelector(state => state.cart);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // AntD message context for reliable toasts
  const [messageApi, contextHolder] = antdMessage.useMessage();

  // Fetch cart items from Redux store
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Show error message if cart fetch fails
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

  // Handle quantity change (sync with backend)
  const updateQuantity = useCallback(async (item, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await dispatch(updateCartItem({ 
        productId: item.productId, 
        size: item.size, 
        color: item.color, 
        quantity: newQuantity 
      })).unwrap();
    } catch (err) {
      messageApi.error(err || "Failed to update quantity");
    }
  }, [dispatch, messageApi])

  // Handle item removal (sync with backend)
  const removeItem = useCallback(async (item) => {
    try {
      await dispatch(removeFromCart({ 
        productId: item.productId, 
        size: item.size, 
        color: item.color 
      })).unwrap();
      messageApi.success("Removed from cart");
    } catch (err) {
      messageApi.error(err || "Failed to remove item");
    }
  }, [dispatch, messageApi])

  // Define a color code to name mapping (you can expand this or fetch from DB)

// Function to get color name from code
const getColorName = (colorCode) => {
  return colorMap[colorCode] || "Unknown Color"; // Fallback if color code not found
};

  // if (loading) {
  //   return <Loader />;
  // }

  return (
    <ProtectedRoute>
      <>
        {contextHolder}
        <Navbar />
        <div className="cart-container">
          <div className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span> / </span>
            <Link href="/cart" className="breadcrumb-link">Cart</Link>
          </div>

          <h1>Your Cart</h1>

          <div className="cart-content">
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <p>Your cart is empty. <Link href="/products">Shop now</Link></p>
              ) : (
                cartItems.map((item) => (
                  // <div className="cart-item" key={item.productId + item.size + item.color}>
                  //   <div className="item-image">
                  //     <Image
                  //       src={item.image || "/placeholder.svg"}
                  //       alt={item.name}
                  //       width={100}
                  //       height={100}
                  //       style={{ objectFit: "cover" }}
                  //     />
                  //   </div>
                  //   <div className="item-details">
                  //     <h3>{item.name}</h3>
                  //     <p>Color: {item.color}</p>
                  //     <p className="item-price">Rs.{item.price}</p>
                  //   </div>
                  //   <div className="item-actions">
                  //     <button className="delete-button" onClick={() => removeItem(item)} aria-label="Remove item">
                  //       <Trash2 size={18} color="#ff4d4f" />
                  //     </button>
                  //     <div className="quantity-controls">
                  //       <button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">
                  //         <Minus size={16} />
                  //       </button>
                  //       <span>{item.quantity}</span>
                  //       <button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Increase quantity">
                  //         <Plus size={16} />
                  //       </button>
                  //     </div>
                  //   </div>
                  // </div>
                      <div className="cart-item" key={item.productId + item.size + item.color}>
                    <div className="item-image">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={100}
                        height={100}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>
                        Color: {" "}
                        <span
                          style={{
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            backgroundColor: item.color,
                            border: "1px solid #ccc",
                            verticalAlign: "middle",
                            marginLeft: "5px",
                          }}
                        ></span>
                      </p>
                      <p className="item-price">Rs.{item.price}</p>
                    </div>
                    <div className="item-actions">
                      <button className="delete-button" onClick={() => removeItem(item)} aria-label="Remove item">
                        <Trash2 size={18} color="#ff4d4f" />
                      </button>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Increase quantity">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs.{total}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>Rs.{shipping}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs.{finalTotal}</span>
              </div>
              <button
                className="checkout-button"
                onClick={async () => {
                  setCheckoutLoading(true);
                  router.push("/checkout");
                }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Spin size="small" /> : <>Go to checkout <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>
        <FooterContact />
        <Footer />
      </>
    </ProtectedRoute>
  )
}