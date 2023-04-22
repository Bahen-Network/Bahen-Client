// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Order {
    uint256 public taskId;
    uint256 public validateTaskId;
    address public client;
    uint256 public paymentAmount;
    bool public isConfirmed;

    constructor(uint256 _taskId, address _client) {
        taskId = _taskId;
        client = _client;
        paymentAmount = 0;
        isConfirmed = false;
    }

    function confirm(uint256 _paymentAmount) public {
        require(!isConfirmed, "Order already confirmed.");
        paymentAmount = _paymentAmount;
        isConfirmed = true;
    }
}
