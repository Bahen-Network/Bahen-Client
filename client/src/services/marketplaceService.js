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

const getContract = async () => {
  if (!contract) {
    const web3Instance = await getWeb3();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = Marketplace.networks[networkId];
    contract = new web3Instance.eth.Contract(Marketplace.abi, deployedNetwork && deployedNetwork.address);
  }
  return contract;
};

export const createOrderPreview = async (modelUrl, trainDataUrl, validateDataUrl, requiredPower) => {
  const contractInstance = await getContract();
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
    const marketplaceContract = getMarketplaceContractInstance();

    const userOrderIds = await marketplaceContract.methods.getUserOrders(userAddress).call();

    return userOrderIds;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const marketplaceContract = getMarketplaceContractInstance();
    const order = await marketplaceContract.methods.orders(orderId).call();
    return order;
  } catch (error) {
    console.error(`Error fetching order details for orderId: ${orderId}`, error);
    throw error;
  }
};



export const getOrderInfo = async (orderId) => {
  try {
    const marketplaceContract = getMarketplaceContractInstance();

    const orderInfo = await marketplaceContract.methods.getOrderInfo(orderId).call();

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
  const contractInstance = await getContract();
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

