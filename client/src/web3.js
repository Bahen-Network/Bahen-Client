import Web3 from "web3";

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.enable();
} else {
  window.alert("Non-Ethereum browser detected. Please install MetaMask.");
}

export default web3;
