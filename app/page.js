import React from 'react'
import Banner from '../components/Banner'
import Navbar from '../components/Navbar'
import Product from '../components/Product'
import Testimonial from '../components/Testimonial'
import WhyChooseUs from '../components/WhyChooseUs'
import FooterContact from "../components/FooterContact";
import Footer from "../components/Footer";
import Link from 'next/link';
import styles from './page.module.css';

const page = () => {
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