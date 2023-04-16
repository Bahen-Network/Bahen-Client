import web3 from "./web3";
import Marketplace from "../build/contracts/Marketplace.json";

const contractAddress = "0x84Ae1C0BA55981A81fAa1f3e73FfB35B253e4161";
const marketplace = new web3.eth.Contract(Marketplace.abi, contractAddress);

export default marketplace;
