import React, { useState, useRef } from 'react';
import { createOrderPreview } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const CreateOrder = ({ onUpload }) => {
  const inputRef1 = useRef();
  const inputRef2 = useRef();
  const [folderUrl, setFolderUrl] = useState('');
  const [requiredPower, setRequiredPower] = useState(null);
  const navigate = useNavigate();
  const [orderLevel, setOrderLevel] = useState(1);

  const handleLevelChange = (e) => {
    setOrderLevel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredPower !== null) {
      const orderId = await createOrderPreview(folderUrl, requiredPower, orderLevel);
      navigate(`/order-preview/${orderId}`, { state: { requiredPower } });
    }
  };

  const handleChangeUpload = async (e) => {
    if (e.target.files.length > 0) {
      console.log("folderUrl:", folderUrl)
      await onUpload(Array.from(e.target.files), folderUrl);
    }
  };

  const handleChangeFirstUpload = async (e) => {
    if (e.target.files.length > 0) {
      const folderUrl = await onUpload(Array.from(e.target.files), "");
      setFolderUrl(folderUrl);
    }
  };

  const calculateCost = async () => {
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
  };

  return (
    <div className="container">
      <Link to="/">Back to Home</Link> {/* back home */}
      <h2 className="my-4">Create Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>
            Scripts Directory:
            <input
              type="file"
              ref={inputRef1}
              onChange={handleChangeFirstUpload}
              directory="" // This attribute allows folder selection
              webkitdirectory="" // This attribute allows folder selection in Webkit-based browsers
              multiple
              style={{ display: 'none' }}
            />
            <button onClick={() => inputRef1.current.click()}>Select Folder</button>
          </label>
        </div>
        <div className="mb-2">
          <label>
            Training Data Directory:
            <input
              type="file"
              ref={inputRef2}
              onChange={handleChangeUpload}
              directory="" // This attribute allows folder selection
              webkitdirectory="" // This attribute allows folder selection in Webkit-based browsers
              multiple
              style={{ display: 'none' }}
            />
            <button onClick={() => inputRef2.current.click()}>Select Folder</button>
          </label>
        </div>
        <div className="mb-1">
          <label>
            Test Data Directory:
            <input
              type="file"
              ref={inputRef2}
              name="test"
              onChange={handleChangeUpload}
              directory="" // This attribute allows folder selection
              webkitdirectory="" // This attribute allows folder selection in Webkit-based browsers
              multiple
              style={{ display: 'none' }}
            />
            <button onClick={() => inputRef2.current.click()}>Select Folder</button>
          </label>
        </div>

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
