import React from 'react';

const POSScanner = ({ barcodeBuffer, setBarcodeBuffer, handleBarcodeSubmit, hiddenInputRef }) => {
  return (
    <div className="pos-main">
      {/* Hidden input for Barcode Scanner (Scanner acts as keyboard) */}
      <form onSubmit={handleBarcodeSubmit} className="scanner-form">
        <input 
          ref={hiddenInputRef}
          type="text" 
          value={barcodeBuffer}
          onChange={(e) => setBarcodeBuffer(e.target.value)}
          className="scanner-hidden-input"
          autoFocus
        />
      </form>

      <div className="pos-instructions">
        <h3>Scanner Active</h3>
        <p>The barcode scanner is listening. You can also manually type the 12-digit barcode below and hit Enter.</p>
        <input 
          type="text" 
          placeholder="Manual Barcode Entry..." 
          value={barcodeBuffer}
          onChange={(e) => setBarcodeBuffer(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') handleBarcodeSubmit(e) }}
          className="pos-manual-entry"
        />
        <div className="mock-barcodes mt-2">
          <h4>Test Barcodes (In Database):</h4>
          <ul>
            <li>012345678905 (Microfiber Cloths)</li>
            <li>098765432109 (Eco-Safe Cleaner)</li>
            <li>112233445566 (HEPA Vacuum)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default POSScanner;
