// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payment {
    // 状态变量
    mapping(address => uint) public balances;

    // 事件
    event PaymentReceived(address from, uint amount);
    event PaymentSent(address to, uint amount);

    // 接收付款
    function receivePayment(address from, uint amount) public payable {
        require(msg.value >= amount, "Insufficient payment");
        balances[from] += msg.value;
        emit PaymentReceived(from, msg.value);
    }

    // 发送付款
    function sendPayment(address to, uint amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(to).transfer(amount);
        emit PaymentSent(to, amount);
    }
}
