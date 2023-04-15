// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Order {
    uint256 public trainTaskId;
    uint256 public validateTaskId;
    address public client;
    uint256 public paymentAmount;
    bool public isConfirmed;

    constructor(uint256 _trainTaskId, uint256 _validateTaskId, address _client) {
    trainTaskId = _trainTaskId;
    validateTaskId = _validateTaskId;
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
