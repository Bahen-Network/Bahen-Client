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
  const orderIdHex = await contractInstance.methods
    .createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower)
    .send({ from: accounts[0] });
  console.log(`Order Preview Created: ${orderIdHex.parseInt}`);

  return parseInt(orderIdHex);
};

export const confirmOrder = async (orderId, paymentAmount) => {
  const contractInstance = await getContract();
  const web3Instance = await getWeb3();
  const accounts = await web3Instance.eth.getAccounts();
  const result = await contractInstance.methods
    .confirmOrder(orderId, paymentAmount)
    .send({ from: accounts[0], value: paymentAmount });

  return result;
};
