// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol"; // 导入SharedStructs库

contract Order {
    uint256 public trainTaskId;
    uint256 public validateTaskId;
    address public client;
    uint256 public paymentAmount;
    string public folderUrl;
    uint256 public requiredComputingPower;
    SharedStructs.OrderStatus public orderStatus; 
    uint256 public orderLevel;

    constructor(address _client, string memory _folderUrl, uint256 _requiredComputingPower, uint256 _orderLevel) {
        validateTaskId = 0;
        trainTaskId = 0;
        client = _client;
        paymentAmount = 0;
        orderStatus = SharedStructs.OrderStatus.Created; 
        folderUrl = _folderUrl;
        requiredComputingPower = _requiredComputingPower;
        orderLevel = _orderLevel; // Assign the new variable
    }
    
    function confirm(uint256 _paymentAmount) public {
        require(orderStatus != SharedStructs.OrderStatus.Confirmed , "Order already confirmed.");
        paymentAmount = _paymentAmount;
        orderStatus = SharedStructs.OrderStatus.Confirmed; 
    }

    function SetOrderStatus(SharedStructs.OrderStatus _orderStatus) public{
        orderStatus = _orderStatus;
    }

    function SetOrdertrainTaskId(uint256 taskId) public
    {
        trainTaskId = taskId;
    }

    function SetOrderValidateTaskId(uint256 taskId) public
    {
        validateTaskId = taskId;
    }
}
