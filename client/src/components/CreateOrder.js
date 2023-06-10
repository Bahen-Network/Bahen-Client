import React, { useState, useRef } from 'react';
import { createOrderPreview } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const CreateOrder = ({ onUpload }) => {
  const scriptInputRef = useRef();
  const trainingInputRef = useRef();
  const testInputRef = useRef();
  const [folderUrl, setFolderUrl] = useState('');
  const [requiredPower, setRequiredPower] = useState(null);
  const navigate = useNavigate();
  const [orderLevel, setOrderLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleLevelChange = (e) => setOrderLevel(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredPower !== null) {
      const orderId = await createOrderPreview(folderUrl, requiredPower, orderLevel);
      navigate(`/order-preview/${orderId}`, { state: { requiredPower } });
    }
  };

  const handleScriptUploadChange = handleUploadChange(scriptInputRef);
  const handleTrainingUploadChange = handleUploadChange(trainingInputRef);
  const handleTestUploadChange = handleUploadChange(testInputRef);

  function handleUploadChange(inputRef) {
    return async (e) => {
      if (e.target.files.length > 0) {
        const folderUrl = await onUpload(Array.from(e.target.files), inputRef.current ? "" : folderUrl);
        setFolderUrl(folderUrl);
      }
    };
  }

  const calculateCost = async () => {
    setLoading(true);
    try{
      const azureFunctionUrl = 'https://cost-calculate-v3.azurewebsites.net/api/HttpTrigger1?code=4rfvfm-4EvfSb_zcFkO4GKDeT24s-xlTIV290YOlAGsmAzFub4xLAA==';
      const container = folderUrl.split("/").pop();
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'container': container })
      };
      const response = await fetch(azureFunctionUrl, requestOptions);
      const data = await response.json();
      setRequiredPower(data.result_unit);
    }
    catch(error) {
      setRequiredPower(999);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link className="mb-4 d-block" to="/">Back to Home</Link>
      <h2 className="my-4">Create Order</h2>
      <form onSubmit={handleSubmit}>
        <FileInputGroup 
          ref={scriptInputRef} 
          label="Scripts Directory:"
          onChange={handleScriptUploadChange}
        />
        <FileInputGroup 
          ref={trainingInputRef} 
          label="Training Data Directory:"
          onChange={handleTrainingUploadChange}
        />
        <FileInputGroup 
          ref={testInputRef} 
          label="Test Data Directory:"
          onChange={handleTestUploadChange}
        />

        <div className="mb-3">
          <label>
            Order Level:
            <select onChange={handleLevelChange}>
              <option value="1">1 (highest power)</option>
              <option value="2">2 (medium power)</option>
              <option value="3">3 (lowest power)</option>
            </select>
          </label>
        </div>

        <div className="mb-3">
          <label htmlFor="folderUrl" className="form-label">
            Folder URL:
          </label>
          <input type="text" className="form-control" id="folderUrl" value={folderUrl} onChange={(e) => setFolderUrl(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary mb-3" onClick={calculateCost} disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : 'Calculate Cost'}
        </button>

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

const FileInputGroup = React.forwardRef(({ label, onChange }, ref) => (
  <div className="mb-3">
    <label>
      {label}
      <input
        type="file"
        ref={ref}
        onChange={onChange}
        directory=""
        webkitdirectory=""
        multiple
        style={{ display: 'none' }}
      />
      <button type="button" onClick={() => ref.current.click()}>Select Folder</button>
    </label>
  </div>
));

export default CreateOrder;
