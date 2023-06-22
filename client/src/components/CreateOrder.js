import React, { useState, useRef } from 'react';
import { createOrderPreview } from '../services/marketplaceService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Upload, Select, Divider, Steps } from 'antd';

const { Title, Paragraph } = Typography;

function Section({ title, children }) {
  return (
    <div
      style={{ borderRadius: 24, backgroundColor: '#1B1B1B', marginBottom: 20 }}
    >
      <Title
        level={3}
        style={{
          borderRadius: 24,
          backgroundColor: '#242424',
          height: '63px',
          lineHeight: '63px',
          padding: '0 24px',
          marginBottom: 0,
          color: '#fff',
        }}
      >
        {title}
      </Title>
      <div
        style={{
          padding: 24,
        }}
      >
        {children}
      </div>
    </div>
  );
}

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
      const orderId = await createOrderPreview(
        folderUrl,
        requiredPower,
        orderLevel
      );
      navigate(`/order-preview/${orderId}`, { state: { requiredPower } });
    }
  };

  const handleScriptUploadChange = handleUploadChange(scriptInputRef);
  const handleTrainingUploadChange = handleUploadChange(trainingInputRef);
  const handleTestUploadChange = handleUploadChange(testInputRef);

  function handleUploadChange(inputRef) {
    return async (e) => {
      if (e.target.files.length > 0) {
        const folderUrl = await onUpload(
          Array.from(e.target.files),
          inputRef.current ? '' : folderUrl
        );
        setFolderUrl(folderUrl);
      }
    };
  }

  const calculateCost = async () => {
    setLoading(true);
    try {
      const azureFunctionUrl =
        'https://calc-cost.azurewebsites.net/api/HttpTrigger2?code=hTRlWthKKGKDAZ2F4NbpRIOXF688VIEa7ulSV8uWIeGGAzFuA14rkQ==';
      const container = folderUrl.split('/').pop();
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container: container }),
      };
      const response = await fetch(azureFunctionUrl, requestOptions);
      const data = await response.json();
      setRequiredPower(data.result_unit);
    } catch (error) {
      setRequiredPower(999);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex' }}>
      <div
        style={{
          width: '50%',
          paddingTop: 36,
          paddingBottom: 36,
          paddingRight: 64,
          borderRight: '2px solid #1F1F1F',
        }}
      >
        <div style={{ marginLeft: 20, marginBottom: 30 }}>
          <Title style={{ marginBottom: 10, color: '#fff' }} level={2}>
            Create Order
          </Title>
          <Paragraph style={{ color: '#fff' }}>Create your AI today</Paragraph>
        </div>
        <Section title="Training Files">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: '14px' }}>Data Set</div>
            <div>
              <Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                onChange={({ file, fileList }) => {
                  if (file.status !== 'uploading') {
                    console.log(file, fileList);
                  }
                }}
              >
                <Button style={{ color: '#000' }} icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: '14px' }}>
              <div>Train Script</div>
              <div style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                model_test.py
              </div>
            </div>
            <div>
              <Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                onChange={({ file, fileList }) => {
                  if (file.status !== 'uploading') {
                    console.log(file, fileList);
                  }
                }}
              >
                <Button style={{ color: '#000' }} icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </div>
          </div>
          <div style={{ display: 'flex', fontStyle: 'italic' }}>
            <div style={{ fontSize: '14px', marginRight: 4 }}>Folder URL: </div>
            <div style={{ color: '#666' }}>https://apexlab.windows.net</div>
          </div>
        </Section>
        <Section title="Pretrain Settings">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: '14px' }}>Version of PyTorch</div>
            <div>
              <Select
                defaultValue="PyTorch 1.9"
                style={{ width: 210 }}
                onChange={(value) => {
                  console.log(`selected ${value}`);
                }}
                options={[
                  { value: 'jack', label: 'Jack' },
                  { value: 'PyTorch 1.9', label: 'PyTorch 1.9' },
                  { value: 'Yiminghe', label: 'yiminghe' },
                  { value: 'disabled', label: 'Disabled', disabled: true },
                ]}
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: '14px' }}>Service Class</div>
            <div>
              <Select
                defaultValue="Flat"
                style={{ width: 210 }}
                onChange={(value) => {
                  console.log(`selected ${value}`);
                }}
                options={[
                  { value: 'Flat', label: 'Flat' },
                  { value: 'Economy', label: 'Economy' },
                  { value: 'Business', label: 'Business' },
                ]}
              />
            </div>
          </div>
        </Section>
        <Section title="Cost Estimation">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: '14px' }}>Required Power</div>
            <div>
              <Button type="primary">Calculate</Button>
            </div>
          </div>
        </Section>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}
        >
          <Button size="large" style={{ marginRight: 16 }}>
            Cancel
          </Button>
          <Button size="large" type="primary">
            Train
          </Button>
        </div>
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
            <input
              type="text"
              className="form-control"
              id="folderUrl"
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={calculateCost}
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              'Calculate Cost'
            )}
          </button>

          {requiredPower !== null && (
            <>
              <p>Required Power: {requiredPower} (wei)</p>
              <br />
              <button type="submit" className="btn btn-success">
                Create Order Preview (need pay gas cost)
              </button>
            </>
          )}
        </form>
      </div>
      <div style={{ width: 380, paddingTop: 36, paddingLeft: 64 }}>
        <ConfigProvider theme={{ token: { colorTextBase: '#fff' } }}>
          <Steps
            progressDot
            direction="vertical"
            items={[
              {
                title: 'Step 1',
                description: 'Upload your training files.',
              },
              {
                title: 'Step 2',
                description:
                  'Choose the corresponding PyTorch version you were using when developing your model.',
              },
              {
                title: 'Step 3',
                description:
                  'Choose the service class that’s suitable for your training.',
              },
              {
                title: 'Step 4',
                description:
                  'Click calculate the cost to get a fee estimation.',
              },
            ]}
          />
        </ConfigProvider>
      </div>
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
      <button type="button" onClick={() => ref.current.click()}>
        Select Folder
      </button>
    </label>
  </div>
));

export default CreateOrder;
