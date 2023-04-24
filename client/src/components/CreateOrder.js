import React, { useState } from 'react';
import { createOrderPreview } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const CreateOrder = () => {
  const [modelUrl, setModelUrl] = useState('');
  const [trainDataUrl, setTrainDataUrl] = useState('');
  const [validateDataUrl, setValidateDataUrl] = useState('');
  const [requiredPower, setRequiredPower] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredPower !== null) {
      const orderId = await createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower);
      navigate(`/order-preview/${orderId}`, { state: { requiredPower } });
    }
  };

  const calculateCost = async () => {
    // Replace this with a call to the actual API when it's available
    setRequiredPower(999999999999999);
  };

  return (
    <div className="container">
      <Link to="/">Back to Home</Link> {/* back home */}
      <h2 className="my-4">Create Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="modelUrl" className="form-label">
            Model URL:
          </label>
          <input type="text" className="form-control" id="modelUrl" value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="trainDataUrl" className="form-label">
            Training Data URL:
          </label>
          <input type="text" className="form-control" id="trainDataUrl" value={trainDataUrl} onChange={(e) => setTrainDataUrl(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="validateDataUrl" className="form-label">
            Validation Data URL:
          </label>
          <input type="text" className="form-control" id="validateDataUrl" value={validateDataUrl} onChange={(e) => setValidateDataUrl(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary mb-3" onClick={calculateCost}>Calculate Cost</button>
        {requiredPower !== null && (
          <>
            <p>Required Power: {requiredPower} (wei)</p>
            <br />
            <button type="submit" className="btn btn-success">Create Order Preview (need pay gas cost)</button>
          </>
        )}
      </form>
    </div>
  );
};

export default CreateOrder;
