// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol";

contract WorkerPool
{
    struct WrokerInfo {
        uint256 workerId;

    }
    address[] private workers;
}