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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredPower !== null) {
      const orderId = await createOrderPreview(folderUrl, requiredPower);
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
    // Replace this with a call to the actual API when it's available
    setRequiredPower(999);
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
