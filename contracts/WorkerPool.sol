// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SharedStructs.sol";

contract WorkerPool
{
    uint256 private nextWorkerId = 1;
    struct Worker {
        uint256 workerId;
        uint256 computingPower;
        bool isBusy;
        bool isActivate;
    }
    mapping(address => Worker) public workers;
    mapping(uint256 => address) public workerIds;
    address[] private workerAddresses;
    uint256 public Invalid_WorkerId = 0;

    function addWorker(address _workerAddress, uint256 _computingPower) public
    {
        uint256 _workerId = nextWorkerId++;
        workers[_workerAddress] = Worker(_workerId, _computingPower, false, true);
        workerIds[_workerId] = _workerAddress;
        workerAddresses.push(_workerAddress);
    }

    function removeWorker(address _workerAddress) public
    {
        workers[_workerAddress].isActivate = false;
    }

    function getWorkerByWorkerId(uint256 _workerId) public view returns (Worker memory) {
        address workerAddress = workerIds[_workerId];
        return workers[workerAddress];
    }

    function findWorker(uint256 _requiredComputingPower) public view returns (uint256 workerId) {
        address[] memory qualifiedWorkers = new address[](workerAddresses.length);
        uint256 qualifiedCount = 0;

        for (uint256 i = 0; i < workerAddresses.length; i++) {
            address workerAddress = workerAddresses[i];
            Worker storage worker = workers[workerAddress];
            if (!worker.isBusy && worker.computingPower >= _requiredComputingPower && worker.isActivate == true) {
                qualifiedWorkers[qualifiedCount] = workerAddress;
                qualifiedCount++;
            }
        }

        if (qualifiedCount == 0) {
            return Invalid_WorkerId;
        }

        uint256 randomIndex = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % qualifiedCount);
        return workers[qualifiedWorkers[randomIndex]].workerId;
    }

    function assignTask(uint256 _requiredComputingPower) public returns (uint256) {
        uint256 workerId = findWorker(_requiredComputingPower);
        if (workerId == Invalid_WorkerId) {
            return Invalid_WorkerId;
        }

        Worker storage worker = workers[workerIds[workerId]];
        worker.isBusy = true;
        return workerId;
    }

    function finishTask(uint256 workerId) public {
        Worker storage worker = workers[workerIds[workerId]];
        worker.isBusy = false;
    }
}