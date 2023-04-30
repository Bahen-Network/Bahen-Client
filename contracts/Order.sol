// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol"; // 导入SharedStructs库

contract Order {
    uint256 public trainTaskId;
    uint256 public validateTaskId;
    address public client;
    uint256 public paymentAmount;
    string public trainDataUrl;
    string public modelUrl;
    string public validateDataUrl;
    uint256 public requiredComputingPower;
    SharedStructs.OrderStatus public orderStatus; 

    constructor(address _client, string memory _modelUrl, string memory _trainDataUrl, string memory _validateDataUrl, uint256 _requiredComputingPower) {
        validateTaskId = 0;
        trainTaskId = 0;
        client = _client;
        paymentAmount = 0;
        orderStatus = SharedStructs.OrderStatus.Created; 
        modelUrl = _modelUrl;
        trainDataUrl = _trainDataUrl;
        validateDataUrl = _validateDataUrl;
        requiredComputingPower = _requiredComputingPower;
    }

    function confirm(uint256 _paymentAmount) public {
        require(orderStatus == SharedStructs.OrderStatus.Confirmed , "Order already confirmed.");
        paymentAmount = _paymentAmount;
        orderStatus = SharedStructs.OrderStatus.Confirmed; 
    }

    function SetOrderStatus(SharedStructs.OrderStatus _orderStatus) public{
        orderStatus = _orderStatus;
    }
}
