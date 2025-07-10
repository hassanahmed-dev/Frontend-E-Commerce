"use client";
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import Banner from '../components/Banner'
import Navbar from '../components/Navbar'
import Product from '../components/Product'
import Testimonial from '../components/Testimonial'
import WhyChooseUs from '../components/WhyChooseUs'
import FooterContact from "../components/FooterContact";
import Footer from "../components/Footer";
import Link from 'next/link';
import  './page.module.css';

const page = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return (
    <div>
      <Navbar/>
      <Banner/>
      <Product/>
      <Product sectionLabel="Latest" sectionTitle="Latest Products" />
      <Testimonial/>
      <WhyChooseUs/>
      <FooterContact/>
      <Footer/>
    </div>
  )
}

export default page