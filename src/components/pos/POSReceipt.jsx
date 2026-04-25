import React, { useContext } from 'react';
import { CurrencyContext } from '../../context/CurrencyContext';

const POSReceipt = ({ lastOrder }) => {
  const { formatPrice } = useContext(CurrencyContext);

  if (!lastOrder) return null;

  return (
    <div className="receipt-print-container" style={{fontFamily: "'Courier New', Courier, monospace", fontSize: '12px', background: 'white', color: 'black', padding: '0', width: '100%', maxWidth: '80mm', margin: '0 auto'}}>
      <div className="receipt-header" style={{textAlign: 'center', marginBottom: '10px'}}>
        <h2 style={{margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold'}}>CLEANCARE SUPPLY</h2>
        <p style={{margin: '0', fontSize: '12px'}}>Avissawella Road,<br/>Kaluaggala, Hanwella</p>
        <p style={{margin: '5px 0 0 0', fontSize: '12px'}}>Tel: +94751854938</p>
      </div>
      
      <div style={{borderBottom: '1px dashed black', margin: '10px 0'}}></div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px'}}>
        <span>Receipt: #{lastOrder.id.substring(0, 8).toUpperCase()}</span>
        <span>{lastOrder.date}</span>
      </div>

      <div style={{borderBottom: '1px dashed black', margin: '10px 0'}}></div>
      
      <div className="receipt-items" style={{marginBottom: '10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '5px'}}>
           <span>ITEM</span>
           <span>AMT</span>
        </div>
        {lastOrder.items.map(item => (
          <div key={item.id || item._id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px'}}>
            <span style={{flex: 1, paddingRight: '5px'}}>{item.quantity}x {item.name.length > 20 ? item.name.substring(0, 20) + '..' : item.name}</span>
            <span style={{fontWeight: 'bold'}}>{formatPrice(item.price * item.quantity, item.discount)}</span>
          </div>
        ))}
      </div>
      
      <div style={{borderBottom: '1px dashed black', margin: '10px 0'}}></div>
      
      <div className="receipt-totals" style={{marginBottom: '10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '5px'}}>
          <span>TOTAL</span>
          <span>{formatPrice(lastOrder.total)}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
          <span>Payment Type:</span>
          <span style={{textTransform: 'uppercase'}}>{lastOrder.method}</span>
        </div>
      </div>
      
      <div style={{borderBottom: '1px dashed black', margin: '10px 0'}}></div>
      
      <div className="receipt-footer" style={{textAlign: 'center', fontSize: '11px', marginTop: '10px'}}>
        <p style={{margin: '0 0 5px 0'}}>Thank you for your business!</p>
        <p style={{margin: '0 0 5px 0'}}>Returns accepted within 30 days w/ receipt.</p>
        <p style={{margin: '0', fontWeight: 'bold'}}>*** CUSTOMER COPY ***</p>
        <p style={{marginTop: '15px', fontFamily: "'Libre Barcode 39', monospace", fontSize: '30px', letterSpacing: '2px'}}>*{lastOrder.id.substring(0, 8).toUpperCase()}*</p>
      </div>
    </div>
  );
};

export default POSReceipt;
