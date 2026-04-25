import React from 'react';
import Navbar from './Navbar';
import CategorySidebar from './CategorySidebar';
import Hero from './Hero';
import ProductList from './ProductList';
import WhyChooseUs from './WhyChooseUs';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import './Store.css';

const Store = () => {
  return (
    <div className="store-container">
      <Navbar />
      <CartSidebar />
      <div className="store-layout">
        <CategorySidebar />
        <main className="store-main">
          <Hero />
          <ProductList />
          <WhyChooseUs />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Store;
