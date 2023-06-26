import { BlobServiceClient, logger } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';

const account = "kejie1";
const sasToken = "?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupyx&se=2023-07-09T18:21:11Z&st=2023-06-24T10:21:11Z&spr=https&sig=G%2FbwEZ0zl87Im3trxFFRTCeLJZ3qjHZfjkpRigY%2BKSg%3D";
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
export const uploadToAzure = async (files, folderUrl) => {
  if (!blobServiceClient) {
    console.error('BlobServiceClient not initialized');
    return;
  }
  
  let containerId;
  if (folderUrl == "") {
    containerId = uuidv4();
  }
  else{
    const containerIdList = folderUrl.split("/");
    containerId = containerIdList[containerIdList.length - 1];
  }

  const containerClient = await createContainerIfNotExists(blobServiceClient, containerId);

  const promises = files.map(async (file) => {
    const blockBlobClient = containerClient.getBlockBlobClient(file.webkitRelativePath);
    await blockBlobClient.uploadData(file);
  });

  await Promise.all(promises);
  const containerUrl = containerClient.url.split("?")[0];
  return containerUrl

};

export const downloadFromAzure = async (containerName) => {
  if (!blobServiceClient) {
    console.error('BlobServiceClient not initialized');
    return;
  }
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobList = containerClient.listBlobsFlat();

    for await (const blob of blobList) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      const response = await blockBlobClient.download(0);
      const blobURL = blockBlobClient.url;

      const link = document.createElement('a');
      link.href = blobURL;
      link.setAttribute('download', blob.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  } catch (error) {
    console.error('Error downloading from Azure:', error);
  }
};