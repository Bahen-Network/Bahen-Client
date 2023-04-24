pragma solidity ^0.8.0;

import "../contracts/Marketplace.sol";
import "../contracts/Payment.sol";
import "../contracts/Task.sol";

contract MarketplaceTest {
    Marketplace private marketplaceInstance;
    Payment private paymentInstance;
    Task private taskInstance;

    constructor() {
        paymentInstance = new Payment();
        taskInstance = new Task();
        marketplaceInstance = new Marketplace(payable(address(paymentInstance)), address(taskInstance));
    }

    function test_create_order_preview() public returns (string memory) {
        string memory modelUrl = "https://example.com/model";
        string memory trainDataUrl = "https://example.com/train-data";
        string memory validateDataUrl = "https://example.com/validate-data";
        uint256 requiredPower = 100;

        uint256 orderId = marketplaceInstance.createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower);

        require(orderId == 0, "OK");
        return "test_create_order_preview: passed";
    }

    function test_confirm_order() public {
        string memory modelUrl = "https://example.com/model";
        string memory trainDataUrl = "https://example.com/train-data";
        string memory validateDataUrl = "https://example.com/validate-data";
        uint256 requiredPower = 100;

        uint256 orderId = marketplaceInstance.createOrderPreview(modelUrl, trainDataUrl, validateDataUrl, requiredPower);

        uint256 paymentAmount = 1 ether;
        marketplaceInstance.confirmOrder{value: paymentAmount}(orderId, paymentAmount);

        Order order = Order(marketplaceInstance.orders(orderId));
        // require(order.client() == msg.sender, "The client of the order should be the sender of the transaction.");
        require(order.isConfirmed(), "Order should be confirmed.");
    }
}
