// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payment {
    mapping(address => uint256) public balanceOf;
    event Deposit(address indexed sender, uint256 amount);
    event Transfer(address indexed sender, address indexed recipient, uint256 amount);


    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
         emit Deposit(msg.sender, msg.value);
    }

    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance.");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }
}
