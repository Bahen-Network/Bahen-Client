import Web3 from 'web3';
import Marketplace from '../api/Marketplace.json';

let web3;
let contract;

const getWeb3 = async () => {
  if (!web3) {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        // User denied account access...
        console.error('User denied account access');
      }
    } else {
      const provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(provider);
    }
  }
  return web3;
};

export const getUserAddress = async () => {
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  return accounts[0];
};


const getMarketplaceContractInstance = async () => {
  if (!contract) {
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = Marketplace.networks[networkId];
    contract = new web3Instance.eth.Contract(Marketplace.abi, deployedNetwork && deployedNetwork.address);
  }
  return contract;
};

export const createOrderPreview = async (modelUrl, trainDataUrl, validateDataUrl, requiredPower) => {
  const contractInstance = await getMarketplaceContractInstance();
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  try {
    const result = await contractInstance.methods
      .createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower)
      .send({ from: accounts[0] });

    const orderId = result.events.OrderCreated.returnValues.orderId;
    console.log(`Order Preview Created: ${orderId}`);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const getUserOrders = async (userAddress) => {
  try {
    const contractInstance = await getMarketplaceContractInstance();
    const userOrderIds = await contractInstance.methods.getUserOrders(userAddress).call();

    return userOrderIds;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const getOrderInfo = async (orderId) => {
  try {
    const contractInstance = await getMarketplaceContractInstance(); // 添加 await 关键字

    const orderInfo = await contractInstance.methods.getOrderInfo(orderId).call();

    console.log("get orderInfo:", orderInfo);
    return {
      taskId: orderInfo._taskId,
      validateTaskId: orderInfo._validateTaskId,
      client: orderInfo._client,
      paymentAmount: orderInfo._paymentAmount,
      isConfirmed: orderInfo._isConfirmed,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};


export const confirmOrder = async (orderId, paymentAmount) => {
  const contractInstance = await getMarketplaceContractInstance();
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  let result;
  try {
    result = await contractInstance.methods
      .confirmOrder(orderId, paymentAmount)
      .send({ from: accounts[0], value: paymentAmount });
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
  return result;
};

