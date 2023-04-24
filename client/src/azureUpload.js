import { BlobServiceClient, logger } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';

const account = "kejie1";
const sasToken = "?sv=2021-12-02&ss=bfqt&srt=sco&sp=rwlacupx&se=2023-06-07T00:18:30Z&st=2023-04-24T16:18:30Z&spr=https,http&sig=6iwbqxUizMmJLBn6kdmwbiXhZeo0HWZmgimPu7mcaik%3D";

// Init blob service client
let blobServiceClient;

try {
  blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net${sasToken}`
  );
} catch (error) {
  console.error('Error constructing URL:', error);
}

// Create a new container with the name of OrderID
const createContainerIfNotExists = async (blobServiceClient, containerName) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  try {
    await containerClient.createIfNotExists();
    console.log(`Container "${containerName}" created or already exists.`);
  } catch (error) {
    console.error(`Failed to create container "${containerName}":`, error);
    throw error;
  }
  return containerClient;
};

// Upload files to Azure Blob Storage
export const uploadToAzure = async (files) => {
  if (!blobServiceClient) {
    console.error('BlobServiceClient not initialized');
    return;
  }

  const containerId = uuidv4();

  const containerClient =await createContainerIfNotExists(blobServiceClient, containerId);

  const promises = files.map(async (file) => {
    const blockBlobClient = containerClient.getBlockBlobClient(file.webkitRelativePath);
    await blockBlobClient.uploadData(file);
  });

  await Promise.all(promises);
  const containerUrl = containerClient.url.split("?")[0];
  return containerUrl

};