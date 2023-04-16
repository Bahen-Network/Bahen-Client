import React, { useState } from 'react';
import { createOrderPreview } from '../services/marketplaceService';

const CreateOrder = () => {
  const [modelUrl, setModelUrl] = useState('');
  const [trainDataUrl, setTrainDataUrl] = useState('');
  const [validateDataUrl, setValidateDataUrl] = useState('');
  const [requiredPower, setRequiredPower] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderId = await createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower);
    console.log(`Order Preview Created: ${orderId}`);
  };

  return (
    <div>
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Model URL:
          <input type="text" value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} />
        </label>
        <br />
        <label>
          Training Data URL:
          <input type="text" value={trainDataUrl} onChange={(e) => setTrainDataUrl(e.target.value)} />
        </label>
        <br />
        <label>
          Validation Data URL:
          <input type="text" value={validateDataUrl} onChange={(e) => setValidateDataUrl(e.target.value)} />
        </label>
        <br />
        <label>
          Required Power:
          <input type="number" value={requiredPower} onChange={(e) => setRequiredPower(e.target.value)} />
        </label>
        <br />
        <button type="submit">Create Order Preview</button>
      </form>
    </div>
  );
};

export default CreateOrder;
