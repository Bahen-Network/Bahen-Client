// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol"; // 导入SharedStructs库

contract Order {
    uint256 public taskId;
    uint256 public validateTaskId;
    address public client;
    uint256 public paymentAmount;
    SharedStructs.OrderStatus public orderStatus; 

    constructor(uint256 _taskId, address _client) {
        taskId = _taskId;
        client = _client;
        paymentAmount = 0;
        orderStatus = SharedStructs.OrderStatus.Created; 
    }

    function confirm(uint256 _paymentAmount) public {
        require(orderStatus != SharedStructs.OrderStatus.Confirmed , "Order already confirmed.");
        paymentAmount = _paymentAmount;
        orderStatus = SharedStructs.OrderStatus.Confirmed; 
    }
}
