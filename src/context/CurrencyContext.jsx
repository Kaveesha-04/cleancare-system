import React, { createContext } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const formatPrice = (priceInLKR, discount = 0) => {
    const finalPriceLKR = discount > 0 ? priceInLKR * (1 - (discount / 100)) : priceInLKR;
    return `Rs. ${finalPriceLKR.toLocaleString()}`;
  };

  const getRawPrice = (priceInLKR, discount = 0) => {
    return discount > 0 ? priceInLKR * (1 - (discount / 100)) : priceInLKR;
  };

  return (
    <CurrencyContext.Provider value={{ formatPrice, getRawPrice, currency: 'LKR', EXCHANGE_RATE: 1 }}>
      {children}
    </CurrencyContext.Provider>
  );
};
