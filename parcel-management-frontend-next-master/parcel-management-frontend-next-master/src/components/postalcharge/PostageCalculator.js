"use client";

import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

const PostageCalculator = () => {
  const [formData, setFormData] = useState({
    serviceType: 'Domestic',
    senderPincode: '',
    receiverPincode: '',
    destCountry: 'India',
    articleType: '',
    weight: '',
    length: '',
    width: '',
    height: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Realistic 2026 base rates per 500g (0.5kg) from India
  const getInternationalBaseRate = (country) => {
    const rates = {
      'United States': 2500,
      'United Kingdom': 2400,
      'Canada': 3650,
      'Australia': 3800,
      'Germany': 3500,
      'France': 2500,
      'Japan': 2400,
      'Singapore': 2100,
      'UAE': 1900,
      'Saudi Arabia': 2200,
    };
    return rates[country] || 3000; // Default fallback for unlisted countries
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically set country to India if switched to Domestic
    if (name === 'serviceType') {
      setFormData({
        ...formData,
        serviceType: value,
        destCountry: value === 'Domestic' ? 'India' : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { articleType, weight, length, width, height, serviceType, destCountry } = formData;

    if (!articleType || !weight || !length || !width || !height || (serviceType === 'International' && !destCountry)) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // 1. Calculate Volumetric Weight (Standard Courier Formula: L x W x H / 5000)
      const volWeight = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000;
      const actualWeightKG = parseFloat(weight) / 1000;
      
      // Chargeable weight is whichever is greater: Actual vs Volumetric
      const chargeableWeight = Math.max(actualWeightKG, volWeight);
      const weightMultiplier = Math.ceil(chargeableWeight / 0.5); // Charge per 500g slab

      let calculatedCost = 0;

      // Blind Literature is legally exempt from postage fees
      if (articleType === 'BlindLiterature') {
        calculatedCost = 0;
      } else if (serviceType === 'Domestic') {
        // 2a. Domestic Base Rates
        let domesticBaseRate = 0;
        switch (articleType) {
          case 'Letter': domesticBaseRate = 15; break;
          case 'BookPacket': domesticBaseRate = 20; break;
          case 'RegisteredNewspaper': domesticBaseRate = 10; break;
          case 'Parcel': domesticBaseRate = 40; break;
          default: domesticBaseRate = 30;
        }
        calculatedCost = domesticBaseRate * weightMultiplier;
      } else if (serviceType === 'International') {
        // 2b. International Base Rates (Varies heavily by country)
        const internationalBaseRate = getInternationalBaseRate(destCountry);
        calculatedCost = internationalBaseRate * weightMultiplier;
      }

      setResult({ 
        cost: calculatedCost.toFixed(2), 
        chargeableWeight: chargeableWeight.toFixed(2),
        isFree: articleType === 'BlindLiterature'
      });
      
      setLoading(false);
    }, 600);
  };

  return (
    <div className="calc-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .calc-page-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #eef2f6 0%, #f8fafc 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem 1rem;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .calc-card {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            padding: 3rem;
            width: 100%;
            max-width: 680px;
            color: #1e293b;
        }
        .calc-card h1 {
            font-weight: 800;
            color: #0f172a;
            text-align: center;
            font-size: 1.8rem;
            margin-bottom: 2rem;
            letter-spacing: -0.5px;
        }
        .form-label {
            font-size: 0.9rem;
            font-weight: 700;
            color: #334155;
            margin-bottom: 0.5rem;
            display: block;
        }
        .custom-input {
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            color: #1e293b;
            border-radius: 10px;
            padding: 0.9rem 1.2rem;
            width: 100%;
            transition: all 0.2s ease;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }
        .custom-input:disabled {
            background-color: #f1f5f9;
            color: #94a3b8;
            cursor: not-allowed;
        }
        .custom-input::placeholder {
            color: #94a3b8;
        }
        .custom-input:focus:not(:disabled) {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            outline: none;
        }
        select.custom-input {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 16px;
        }
        .radio-group {
            display: flex;
            gap: 1.5rem;
            background: #f8fafc;
            padding: 0.8rem 1.2rem;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }
        .radio-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            color: #475569;
            font-weight: 600;
        }
        .radio-label input[type="radio"] {
            accent-color: #4f46e5;
            width: 18px;
            height: 18px;
        }
        .calc-btn {
            background-color: #0f172a;
            color: white;
            border: none;
            padding: 1.2rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
            width: 100%;
            margin-top: 1.5rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s;
        }
        .calc-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
            background-color: #1e293b;
        }
        .calc-btn:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .result-container {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 1.5rem;
            margin-top: 2rem;
            animation: slideDown 0.3s ease-out forwards;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .result-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .result-row:last-child {
            border-bottom: none;
        }
        .result-label {
            color: #64748b;
            font-weight: 600;
        }
        .result-value {
            font-weight: 800;
            color: #0f172a;
            font-size: 1.1rem;
        }
        .result-value.highlight {
            font-size: 1.5rem;
            color: #10b981; 
        }
      `}} />

      <div className="calc-card">
        <h1>Calculate Postage</h1>
        
        <form onSubmit={handleSubmit}>
          
          {/* Type of Service */}
          <div className="mb-4">
            <label className="form-label">Type of Service</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="serviceType"
                  value="Domestic"
                  checked={formData.serviceType === 'Domestic'}
                  onChange={handleInputChange}
                />
                Domestic
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="serviceType"
                  value="International"
                  checked={formData.serviceType === 'International'}
                  onChange={handleInputChange}
                />
                International
              </label>
            </div>
          </div>

          {/* Send From and Send To */}
          <div className="row mb-3">
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label">Origin Pincode</label>
              <input 
                type="text" 
                name="senderPincode"
                className="custom-input" 
                placeholder="e.g. 110001" 
                value={formData.senderPincode}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            {/* Dynamic Destination Country Dropdown */}
            <div className="col-md-4 mb-3 mb-md-0">
                <label className="form-label">Dest. Country</label>
                <select 
                    name="destCountry" 
                    value={formData.destCountry} 
                    onChange={handleInputChange} 
                    className="custom-input custom-select" 
                    disabled={formData.serviceType === 'Domestic'}
                    required
                >
                    {formData.serviceType === 'Domestic' ? (
                        <option value="India">India</option>
                    ) : (
                        <>
                            <option value="" disabled>Select Country...</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Japan">Japan</option>
                            <option value="Singapore">Singapore</option>
                            <option value="UAE">United Arab Emirates</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                        </>
                    )}
                </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Dest. Pincode</label>
              <input 
                type="text" 
                name="receiverPincode"
                className="custom-input" 
                placeholder="e.g. 90210" 
                value={formData.receiverPincode}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>

          {/* Article Type and Details */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <label className="form-label">Item Category</label>
              <select
                name="articleType"
                className="custom-input custom-select"
                value={formData.articleType}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Item Type...</option>
                <option value="Letter">Letter / Document</option>
                <option value="Parcel">Parcel</option>
                <option value="BookPacket">Book Packet</option>
                <option value="BlindLiterature">Blind Literature Packet</option>
                <option value="RegisteredNewspaper">Registered Newspaper</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Total Weight (grams)</label>
              <input
                type="number"
                name="weight"
                className="custom-input"
                placeholder="e.g. 250"
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="row mb-3">
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label">Length (cm)</label>
              <input
                type="number"
                name="length"
                className="custom-input"
                placeholder="L"
                value={formData.length}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label">Width (cm)</label>
              <input
                type="number"
                name="width"
                className="custom-input"
                placeholder="W"
                value={formData.width}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                name="height"
                className="custom-input"
                placeholder="H"
                value={formData.height}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="calc-btn" disabled={loading}>
            {loading ? "Calculating Rate..." : "Calculate Postage"}
          </button>
        </form>

        {/* Result Block */}
        {result && (
          <div className="result-container">
            <h5 className="text-center mb-3 fw-bold" style={{ color: '#0f172a' }}>Service Quotation</h5>
            <div className="result-row">
                <span className="result-label">Chargeable Weight</span>
                <span className="result-value">{result.chargeableWeight} kg</span>
            </div>
            <div className="result-row">
                <span className="result-label">Selected Category</span>
                <span className="result-value">{formData.serviceType} {formData.articleType}</span>
            </div>
            <div className="result-row mt-3" style={{ border: 'none' }}>
                <span className="result-label" style={{ fontSize: '1.1rem', color: '#0f172a' }}>Estimated Rate</span>
                {result.isFree ? (
                    <span className="result-value highlight text-info" style={{ color: '#0284c7' }}>Free Postage</span>
                ) : (
                    <span className="result-value highlight">₹{result.cost}</span>
                )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostageCalculator;