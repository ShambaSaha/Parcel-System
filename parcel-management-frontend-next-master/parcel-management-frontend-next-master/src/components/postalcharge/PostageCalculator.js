import React, { useState } from 'react';

const PostageCalculator = () => {
  const [serviceType, setServiceType] = useState('Domestic');
  const [articleType, setArticleType] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!articleType || !weight) {
      alert("Please fill in all required fields!");
      return;
    }
    alert(`Calculating postage for a ${articleType} weighing ${weight} grams.`);
  };

  return (
    <div className="container">
      <h2>Calculate Postage</h2>
      <form onSubmit={handleSubmit}>
        {/* Type of Service */}
        <div className="row">
          <div className="field">
            <label>Type of Service:</label>
            <div>
              <input
                type="radio"
                id="domestic"
                name="serviceType"
                value="Domestic"
                checked={serviceType === 'Domestic'}
                onChange={() => setServiceType('Domestic')}
              />
              <label htmlFor="domestic">Domestic</label>
              <input
                type="radio"
                id="international"
                name="serviceType"
                value="International"
                checked={serviceType === 'International'}
                onChange={() => setServiceType('International')}
              />
              <label htmlFor="international">International</label>
            </div>
          </div>
        </div>

        {/* Send From and Send To */}
        <div className="row">
          <div className="field">
            <label>Send From</label>
            <input type="text" placeholder="Pincode" required />
            <input type="text" placeholder="City / District" required />
            <input type="text" placeholder="State / Union Territory" required />
          </div>
          <div className="field">
            <label>Send To</label>
            <input type="text" placeholder="Pincode" required />
            <input type="text" placeholder="City / District" required />
            <input type="text" placeholder="State / Union Territory" required />
          </div>
        </div>

        {/* Article Type and Details */}
        <div className="row">
          <div className="field">
            <label>Select an Item:</label>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
              required
            >
              <option value="">--Select--</option>
              <option value="Letter">Letter/Document</option>
              <option value="Parcel">Parcel</option>
              <option value="BookPacket">Book Packet</option>
              <option value="BlindLiterature">Blind Literature Packet</option>
              <option value="RegisteredNewspaper">Registered Newspaper</option>
            </select>
          </div>
          <div className="field">
            <label>Weight (in grams):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Length (in cm):</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Width (in cm):</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Height (in cm):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit">Get Available Services</button>
      </form>

      <style jsx>{`
        .container {
          width: 90%;
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background: white;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        h2 {
          text-align: center;
          color: #333;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .field {
          flex: 1;
          margin: 0 10px;
        }

        label {
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }

        input,
        select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default PostageCalculator;
