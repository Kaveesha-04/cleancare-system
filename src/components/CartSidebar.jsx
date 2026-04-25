import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { API_BASE_URL } from '../config';
import CheckoutModal from './CheckoutModal';
import './CartSidebar.css';

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    clearCart,
    removeFromCart, 
    updateQuantity
  } = useContext(CartContext);

  const { user, refreshUser } = useContext(AuthContext);
  const { formatPrice, currency, EXCHANGE_RATE } = useContext(CurrencyContext);
  const [applyPoints, setApplyPoints] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Real cart discount calculation per item based on active item discount
  const cartTrueTotalLKR = cartItems.reduce((acc, item) => {
    // Determine active price for user role
    const isWholesale = user?.role === 'wholesale';
    const activePrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
    const activeDiscount = isWholesale ? (item.wholesaleDiscount || 0) : (item.retailDiscount || item.discount || 0);
    const discountedPrice = activeDiscount > 0 ? activePrice * (1 - (activeDiscount / 100)) : activePrice;
    return acc + (discountedPrice * item.quantity);
  }, 0);

  // If using loyalty points, apply them to raw LKR total
  // Assuming 100 pts = $1, so 100 pts = 300 LKR
  const loyaltyDiscountLKR = applyPoints && user ? (user.loyaltyPoints / 100) * EXCHANGE_RATE : 0;
  const finalTotalLKR = Math.max(0, cartTrueTotalLKR - loyaltyDiscountLKR);

  const handleFinalCheckout = async (paymentMethod) => {
    try {
      const payload = {
        orderType: 'online',
        paymentMethod: paymentMethod === 'card' ? 'Stripe/Online' : 'Net-30 Invoice',
        userId: user ? user.id : null,
        applyPoints: applyPoints && user ? user.loyaltyPoints : 0,
        items: cartItems.map(i => ({ id: i.id, quantity: i.quantity }))
      };
      
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error('Failed to checkout on server');
      }
      
      if (user) await refreshUser(); // Update points globally
      
      // Notify ProductList to fetch fresh stocks immediately
      window.dispatchEvent(new Event('inventory-updated'));
      
      setApplyPoints(false);
      setShowCheckout(false);
      clearCart();
      toggleCart();
    } catch (err) {
      alert('Error finalizing checkout on backend: ' + err.message);
      setShowCheckout(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart}>
        <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button className="close-cart" onClick={toggleCart}>&times;</button>
          </div>
          
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart">Your cart is currently empty.</p>
            ) : (
              cartItems.map(item => {
                const isWholesale = user?.role === 'wholesale';
                const activePrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
                const activeDiscount = isWholesale ? (item.wholesaleDiscount || 0) : (item.retailDiscount || item.discount || 0);

                return (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <p className="cart-item-price">
                      {isWholesale && <span style={{fontSize: '0.65rem', color: '#16a34a', display: 'block'}}>Wholesale Rate</span>}
                      {formatPrice(activePrice, activeDiscount)}
                    </p>
                    
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <button className="remove-item" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              {user && user.loyaltyPoints > 0 && (
                <div className="loyalty-redeem" style={{marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1'}}>
                  <label style={{display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold'}}>
                    <input type="checkbox" checked={applyPoints} onChange={e => setApplyPoints(e.target.checked)} />
                    Redeem {user.loyaltyPoints} Pts ({formatPrice(user.loyaltyPoints / 100 * EXCHANGE_RATE)} off)
                  </label>
                </div>
              )}
              <div className="cart-total">
                <span>Total:</span>
                <span>{formatPrice(finalTotalLKR)}</span>
              </div>
              <button 
                className="btn btn-primary checkout-btn" 
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal 
          amount={formatPrice(finalTotalLKR)}
          onConfirm={handleFinalCheckout}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default CartSidebar;
