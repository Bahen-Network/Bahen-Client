// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payment {
    mapping(address => uint256) public balanceOf;
    event Deposit(address indexed sender, uint256 amount);
    event Balance(address indexed sender, uint256 Balance);
    event Transfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event Withdrawal(address indexed sender, uint256 amount);

    // Users can deposit ETH into the contract
    function deposit(address user) external payable {
        // Update the user's balance in the contract
        balanceOf[user] += msg.value;
        // Emit the Deposit event
        emit Deposit(user, msg.value);
        emit Balance(user, address(this).balance);
    }

    // Transfer ETH between users
    function transfer(address to, uint256 amount) external {
        // Ensure the sender has a sufficient balance
        require(balanceOf[msg.sender] >= amount, "Insufficient balance.");

        // Deduct the transfer amount from the sender's balance
        balanceOf[msg.sender] -= amount;
        // Add the amount to the recipient's balance
        balanceOf[to] += amount;

        // Emit the Transfer event
        emit Transfer(msg.sender, to, amount);
    }

    // Users can withdraw ETH from the contract
    function withdraw(uint256 amount) external {
        // Ensure the user has a sufficient balance
        require(balanceOf[msg.sender] >= amount, "Insufficient balance.");

        // Deduct the withdrawal amount from the user's balance
        balanceOf[msg.sender] -= amount;
        // Send the withdrawal amount to the user
        payable(msg.sender).transfer(amount);

        // Emit the Withdrawal event
        emit Withdrawal(msg.sender, amount);
    }

    function payWorker(address worker, uint256 amount) public {
        _transferETH(worker, amount);
    }

    // Internal function to transfer ETH to a specific address
    function _transferETH(address to, uint256 amount) internal {
        // Ensure the contract has a sufficient balance
        require(
            address(this).balance >= amount,
            "Insufficient contract balance."
        );

        // Transfer the specified amount of ETH to the recipient
        payable(to).transfer(amount);
    }

    // Receive function
    receive() external payable {
        // Add the ETH to the sender's balance
        balanceOf[msg.sender] += msg.value;
        // Emit the Deposit event
        emit Deposit(msg.sender, msg.value);
    }

    // Fallback function to handle ETH sent directly to the contract address
    fallback() external payable {
        // Add the ETH to the sender's balance
        balanceOf[msg.sender] += msg.value;
        // Emit the Deposit event
        emit Deposit(msg.sender, msg.value);
    }
}
