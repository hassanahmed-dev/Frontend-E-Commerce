"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  Row,
  Col,
  Spin,
  message as antdMessage,
} from "antd";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import "./page.scss";
import Navbar from "../../components/Navbar";
import FooterContact from "../../components/FooterContact";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import { fetchCart, clearCart } from "../../store/slices/cartSlice";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createOrder } from "../../store/slices/orderSlice";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import React from "react";

// import { fetchCart } from '../store/slices/cartSlice';


const { Option } = Select;

const stripePromise = loadStripe(
  "pk_test_51RfeF5P6kR2rtFLKSlWEgAG4j1IOUSRhtP2nfUpdVwDwf7aXQJf6dEE0S5dnJr6qM8qLzSUZyo1W8iKaCNh5DUtG00TQNrQB1m"
); // TODO: Replace with your real publishable key

const StripeCheckoutForm = forwardRef(function StripeCheckoutForm(
  { form, cartItems, finalTotal, token, buildOrderData },
  ref
) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  // Placeholder: Call your backend to create a PaymentIntent and return clientSecret
  const createPaymentIntent = async (amount, values) => {
    // Send PKR amount and currency to backend for real-time conversion
    const res = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        "/api/payment/create-payment-intent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "pkr" }),
      }
    );
    const data = await res.json();
    return data.clientSecret;
  };

  const handleStripeSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      if (!cardName) throw new Error("Please enter the name on your card");
      const clientSecret = await createPaymentIntent(finalTotal, values);
      if (!clientSecret) throw new Error("Failed to get payment secret");
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardName,
            email: values.email,
          },
        },
      });
      if (result.error) {
        antdMessage.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        antdMessage.success("Payment successful!");
        const orderData = buildOrderData(
          values,
          "credit-card",
          "paid",
          result.paymentIntent.id
        );
        await dispatch(createOrder({ orderData, token }));
        dispatch(clearCart());
        router.push("/chat");
      }
    } catch (err) {
      antdMessage.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleStripeSubmit,
    setLoading,
  }));

  const ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: "16px",
        color: "#333",
        fontFamily: "inherit",
        "::placeholder": { color: "#aaa" },
        backgroundColor: "#fafafa",
      },
      invalid: { color: "#e5424d" },
    },
    classes: { base: "stripe-like-input" },
  };

  return (
    <div className="modern-payment-form">
      <div
        className="payment-icons-row"
        style={{ display: "flex", gap: 16, marginBottom: 16 }}
      >
        <img src="/google-pay.png" alt="Google Pay" width={48} height={32} />
        <img src="/visa.png" alt="Visa" width={48} height={32} />
        <img src="/paypal.png" alt="PayPal" width={48} height={32} />
        <img src="/paypass.png" alt="PayPass" width={48} height={32} />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label>Card number</label>
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Name of card</label>
          <input
            className="stripe-like-input"
            type="text"
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label>Expiration date (MM/YY)</label>
          <CardExpiryElement options={ELEMENT_OPTIONS} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Security Code</label>
          <CardCvcElement options={ELEMENT_OPTIONS} />
        </div>
      </div>
      {/* No button here! Button is in the summary section. */}
    </div>
  );
});

const saveOrder = async (orderData, token) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${backendUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Order saving failed");
  return await res.json();
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const {
    items: cartItems,
    total,
    shipping,
    finalTotal,
    loading,
    error,
  } = useSelector((state) => state.cart);
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [addressType, setAddressType] = useState("same");
  const [paymentMethod, setPaymentMethod] = useState("");
  const stripeFormRef = useRef();
  const router = useRouter();
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);

  // AntD message context for reliable toasts
  const [messageApi, contextHolder] = antdMessage.useMessage();

  // Fetch cart data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Show error message if cart fetch fails
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

  const handleRadioChange = (e) => {
    setAddressType(e.target.value);
  };

  // Helper to build orderData object
  const buildOrderData = (
    values,
    paymentMethod,
    paymentStatus,
    stripePaymentId
  ) => ({
    cartItems,
    billingDetails: {
      firstName: values.firstName,
      lastName: values.lastName,
      country: values.country,
      address: values.address,
      apartment: values.apartment,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      phone: values.phone,
      email: values.email,
    },
    shippingDetails:
      values.addressType === "different"
        ? {
            country: values.shippingCountry,
            address: values.shippingAddress,
            apartment: values.shippingApartment,
            city: values.shippingCity,
            state: values.shippingState,
          }
        : {
            country: values.country,
            address: values.address,
            apartment: values.apartment,
            city: values.city,
            state: values.state,
          },
    paymentMethod,
    paymentStatus,
    total,
    shipping,
    finalTotal,
    ...(stripePaymentId ? { stripePaymentId } : {}),
  });

  // Place Order button handler
  const handlePlaceOrder = () => {
    setPlaceOrderLoading(true);
    form
      .validateFields()
      .then(async (values) => {
        debugger;
        if (paymentMethod === "credit-card") {
          // Trigger Stripe payment flow
          if (
            stripeFormRef.current &&
            stripeFormRef.current.handleStripeSubmit
          ) {
            await stripeFormRef.current.handleStripeSubmit(messageApi);
            setPlaceOrderLoading(false);
          } else {
            messageApi.error("Stripe form not ready");
            setPlaceOrderLoading(false);
          }
        } else if (paymentMethod === "cash-on-delivery") {
          // Save order directly for COD
          const orderData = buildOrderData(
            values,
            "cash-on-delivery",
            "pending"
          );
          const result = await dispatch(createOrder({ orderData, token }));
          if (!createOrder.rejected.match(result)) {
            // Push order to chat (using localStorage for demo)
            localStorage.setItem("lastOrder", JSON.stringify(orderData));
            dispatch(clearCart());
            messageApi.success("Order placed successfully!");
            router.push("/chat");
          }
          setPlaceOrderLoading(false);
        } else {
          messageApi.error("Please select a payment method");
          setPlaceOrderLoading(false);
        }
      })
      .catch(() => {
        messageApi.error("Please fill in all required fields");
        setPlaceOrderLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ProtectedRoute>
        <>
          <Navbar />
          <div className="checkout-container">
            <div style={{ textAlign: "center", padding: "50px" }}>
              <h2>Error loading cart</h2>
              <p>{error}</p>
              <Button onClick={() => dispatch(fetchCart())}>Retry</Button>
            </div>
          </div>
        </>
      </ProtectedRoute>
    );
  }

  if (cartItems.length === 0) {
    return (
      <ProtectedRoute>
        <>
          <Navbar />
          <div className="checkout-container">
            <div style={{ textAlign: "center", padding: "50px" }}>
              <h2>Your cart is empty</h2>
              <p>Please add some items to your cart before checkout.</p>
              <Link href="/products">
                <Button type="primary">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Elements stripe={stripePromise}>
        <React.Fragment>
          {contextHolder}
          <Navbar />
          <div className="checkout-container">
            <div className="breadcrumb">
              <Link href="/">Home </Link>
              <ChevronRight size={16} />
              <Link href="/cart">Cart</Link>
            </div>

            <h1>Checkout</h1>

            <Form
              form={form}
              name="checkout"
              layout="vertical"
              requiredMark={false}
            >
              <div className="checkout-content">
                <div className="billing-details">
                  <h2>Billing Details</h2>

                  <div className="form-row">
                    <Form.Item
                      label="First Name*"
                      name="firstName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your first name",
                        },
                      ]}
                    >
                      <Input placeholder="Enter First Name" />
                    </Form.Item>

                    <Form.Item
                      label="Last Name*"
                      name="lastName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your last name",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Last Name" />
                    </Form.Item>
                  </div>

                  <div className="form-row">
                    <Form.Item
                      label="Country*"
                      name="country"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your country",
                        },
                      ]}
                    >
                      <Input placeholder="Country" />
                    </Form.Item>

                    <Form.Item
                      label="Province*"
                      name="state"
                      rules={[
                        {
                          required: true,
                          message: "Please select your province",
                        },
                      ]}
                    >
                      <Select placeholder="Province">
                        <Option value="Azad Jammu & Kashmir">
                          Azad Jammu & Kashmir
                        </Option>
                        <Option value="Balochistan">Balochistan</Option>
                        <Option value="Gilgit-Baltistan">
                          Gilgit-Baltistan
                        </Option>
                        <Option value="Islamabad Capital Territory">
                          Islamabad Capital Territory
                        </Option>
                        <Option value="Khyber Pakhtunkhwa">
                          Khyber Pakhtunkhwa
                        </Option>
                        <Option value="Punjab">Punjab</Option>
                        <Option value="Sindh">Sindh</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="City*"
                      name="city"
                      rules={[
                        { required: true, message: "Please enter your city" },
                      ]}
                    >
                      <Input placeholder="Select City" />
                    </Form.Item>
                  </div>
                  <div className="form-row ">
                    <Form.Item
                      label="Street Address*"
                      name="address"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your street address",
                        },
                      ]}
                    >
                      <Input placeholder="Street, House number, Area, etc." />
                    </Form.Item>
                  </div>

                  <div className="form-row">
                    <Form.Item
                      label="Postal Code*"
                      name="postalCode"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your postal code",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Postal Code" />
                    </Form.Item>

                    <Form.Item
                      label="Phone*"
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your phone number",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Phone" />
                    </Form.Item>

                    <Form.Item
                      label="Email*"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email" },
                        {
                          type: "email",
                          message: "Please enter a valid email address",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Email" />
                    </Form.Item>
                  </div>
                </div>

                <div className="order-summary">
                  <h2>Order Summary</h2>

                  <div className="order-items">
                    {cartItems.map((item, index) => (
                      <div
                        className="order-item"
                        key={`${item.productId}-${item.size}-${item.color}-${index}`}
                      >
                        <div className="item-image">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={60}
                            height={60}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="item-details">
                          <div className="item-name">
                            {item.name}{" "}
                            <span className="item-quantity">
                              × {item.quantity}
                            </span>
                          </div>
                          <div className="item-color">
                            {(
                              <p>
                                Color:{" "}
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "16px",
                                    height: "12px",
                                    backgroundColor: item.color,
                                    border: "1px solid #ccc",
                                    verticalAlign: "middle",
                                    marginLeft: "5px",
                                  }}
                                ></span>
                              </p>
                            ) || "Default"}
                          </div>
                        </div>
                        <div className="item-price">
                          Rs:{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>Rs.{total}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span>Rs.{shipping}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>Rs.{finalTotal}</span>
                    </div>
                  </div>

                  <button
                    className="place-order-button"
                    onClick={handlePlaceOrder}
                    type="button"
                    disabled={placeOrderLoading}
                  >
                    {placeOrderLoading
                      ? <Spin size="small" />
                      : <>Place an order &rarr;</>
                    }
                  </button>
                </div>
              </div>

              <div className="section-divider"></div>

              <div className="main-width">

              <div className="shipping-container">
                <h1 className="shipping-title">Shipping Address</h1>
                <p className="shipping-subtitle">
                  Select the address that matches your card or payment method.
                </p>
                <div className="radio-container">
                  <Form.Item name="addressType" initialValue="same" className="bottom-khattam">
                    <Radio.Group
                      onChange={handleRadioChange}
                      value={addressType}
                      className="custom-radio-group"
                    >
                      <div className="radio-option">
                        <Radio value="same" className="custom-radio">
                          Same as Billing address
                        </Radio>
                      </div>
                      <div className="radio-divider"></div>
                      <div className="radio-option">
                        <Radio value="different" className="custom-radio">
                          Use a different shipping address
                        </Radio>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                </div>

                {addressType === "different" && (
                  <div className="shipping-address-form">
                    <h2>Shipping Address</h2>
                    <div className="form-row">
                      <Form.Item
                        label="Country"
                        name="shippingCountry"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your country",
                          },
                        ]}
                      >
                        <Input placeholder="Country" />
                      </Form.Item>
                      <Form.Item
                        label="Street Address"
                        name="shippingAddress"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your street address",
                          },
                        ]}
                      >
                        <Input placeholder="House number and street name" />
                      </Form.Item>
                    </div>

                    <div className="form-row three-columns">
                      <Form.Item
                        label="Apt, suite, unit"
                        name="shippingApartment"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your Apt, suite, uni",
                          },
                        ]}
                      >
                        <Input placeholder="apartment, suite, unit, etc. (optional)" />
                      </Form.Item>

                      <Form.Item
                        label="State"
                        name="shippingState"
                        rules={[
                          {
                            required: true,
                            message: "Please select your state",
                          },
                        ]}
                      >
                        <Select placeholder="State">
                          <Option value="Azad Jammu & Kashmir">
                            Azad Jammu & Kashmir
                          </Option>
                          <Option value="Balochistan">Balochistan</Option>
                          <Option value="Gilgit-Baltistan">
                            Gilgit-Baltistan
                          </Option>
                          <Option value="Islamabad Capital Territory">
                            Islamabad Capital Territory
                          </Option>
                          <Option value="Khyber Pakhtunkhwa">
                            Khyber Pakhtunkhwa
                          </Option>
                          <Option value="Punjab">Punjab</Option>
                          <Option value="Sindh">Sindh</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="City"
                        name="shippingCity"
                        rules={[
                          { required: true, message: "Please enter your city" },
                        ]}
                      >
                        <Input placeholder="Town / City" />
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>

              <div className="section-divider1"></div>

              <div className="shipping-container2">
                <h3>Shipping Method</h3>
                <div className="shipping-box2">
                  <div className="shipping-header2">
                    <span className="delivery-date">
                    "Delivery will be made within 4 working days after placing the order"
                    </span>
                  </div>

                  <hr />
                  <div className="shipping-details2">
                    <div className="charge-label">Delivery Charges</div>
                    <div className="charge-price">Rs:210.00</div>
                  </div>
                  <p className="note2">Additional fees may apply</p>
                </div>
              </div>

              <div className="section-divider1"></div>

              <div className="payment-container">
                <div className="payment-inner">
                  <h2 className="payment-title">Payment Method</h2>
                  <p className="payment-subtitle">
                    All transactions are secure and encrypted.
                  </p>
                  <div className="payment-box-ui">
                    <Form.Item
                      name="paymentMethod"
                      rules={[
                        {
                          required: true,
                          message: "Please select a payment method.",
                        },
                      ]}
                    >
                      <Radio.Group
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        value={paymentMethod}
                        className="payment-radio-group"
                      >
                        <div className="payment-radio-option">
                          <Radio value="credit-card" className="custom-radio">
                            <b>Credit Card</b>
                            <div className="payment-note">
                              We accept all major credit cards.
                            </div>
                          </Radio>
                        </div>
                        {paymentMethod === "credit-card" && (
                          <div style={{ marginLeft: 32 }}>
                            <StripeCheckoutForm
                              ref={stripeFormRef}
                              form={form}
                              cartItems={cartItems}
                              finalTotal={finalTotal}
                              token={token}
                              buildOrderData={buildOrderData}
                            />
                          </div>
                        )}
                        <hr className="payment-divider-ui" />
                        <div className="payment-radio-option">
                          <Radio
                            value="cash-on-delivery"
                            className="custom-radio"
                          >
                            <b>Cash on delivery</b>
                            <div className="payment-note">
                              Pay with cash upon delivery.
                            </div>
                          </Radio>
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </div>
              </div>

              </div>
            </Form>
          </div>
          <FooterContact />
          <Footer />
        </React.Fragment>
      </Elements>
    </ProtectedRoute>
  );
}
