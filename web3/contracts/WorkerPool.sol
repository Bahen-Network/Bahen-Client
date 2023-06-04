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
        uint256 taskId;
    }
    mapping(address => Worker) public workers;
    mapping(uint256 => address) public workerIds;
    address[] private workerAddresses;
    uint256 public Invalid_WorkerId = 0;

    function addWorker(address _workerAddress, uint256 _computingPower) public
    {
        require(workers[_workerAddress].isActivate == false, "This address has already registered.");
        uint256 _workerId = nextWorkerId++;
        workers[_workerAddress] = Worker(_workerId, _computingPower, false, true, 0);
        workerIds[_workerId] = _workerAddress;
        workerAddresses.push(_workerAddress);
    }

    function getWorkerList() public view returns(address[] memory) 
    {
        return workerAddresses;
    }

    function removeWorker(address _workerAddress) public
    {
        workers[_workerAddress].isActivate = false;
    }

    function getWorkerByWorkerId(uint256 _workerId) public view returns (Worker memory)
    {
        require(workers[workerIds[_workerId]].isActivate == true, "This worker not registered.");
        address workerAddress = workerIds[_workerId];
        return workers[workerAddress];
    }

    function getWorkerByWorkerAddress(address workerAddress) public view returns(Worker memory)
    {
        require(workers[workerAddress].isActivate == true, "This worker not registered.");
        return workers[workerAddress];
    }

    function getWorkerIdByWorkerAddress(address workerAddress) public view returns(uint256 workerId)
    {
        require(workers[workerAddress].isActivate == true, "This worker not registered.");
        Worker memory worker = workers[workerAddress];
        return worker.workerId;
    }

    function findWorker(uint256 _requiredComputingPower, uint256 _order, Leveluint256 exceptWorkerId) private view returns (uint256 workerId) 
    {
        address[] memory qualifiedWorkers = new address[](workerAddresses.length);
        uint256 qualifiedCount = 0;

        for (uint256 i = 0; i < workerAddresses.length; i++) 
        {
            address workerAddress = workerAddresses[i];
            Worker memory worker = workers[workerAddress];
            if (!worker.isBusy && worker.computingPower >= _requiredComputingPower && worker.isActivate == true && worker.workerId != exceptWorkerId) 
            {
                qualifiedWorkers[qualifiedCount] = workerAddress;
                qualifiedCount++;
            }
        }

        if (qualifiedCount == 0) {
            return Invalid_WorkerId;
        }

        // Sort the qualifiedWorkers based on their computing power

        // Choose the worker based on the order level
        if (_orderLevel == 1) {
            // Choose the worker with the highest computing power
            return workers[qualifiedWorkers[0]].workerId;
        } else if (_orderLevel == 2) {
            // Choose the worker with the median computing power
            return workers[qualifiedWorkers[qualifiedCount / 2]].workerId;
        } else if (_orderLevel == 3) {
            // Choose the worker with the lowest computing power
            return workers[qualifiedWorkers[qualifiedCount - 1]].workerId;
        }
    }


    function assignTask(uint256 _requiredComputingPower, uint256 _orderLevel, uint256 exceptWorkerId, uint256 taskId) public returns (uint256) 
    {
        uint256 workerId = findWorker(_requiredComputingPower, _orderLevel, exceptWorkerId);
        if (workerId == Invalid_WorkerId) 
        {
            return Invalid_WorkerId;
        }

        Worker storage worker = workers[workerIds[workerId]];
        worker.isBusy = true;
        worker.taskId = taskId;
        return workerId;
    }


    function assignTask(uint256 _requiredComputingPower, uint256 taskId) public returns (uint256) 
    {
        return assignTask(_requiredComputingPower, taskId, 0);
    }

    function finishTask(uint256 workerId) private 
    {
        Worker storage worker = workers[workerIds[workerId]];
        worker.taskId = 0;
        worker.isBusy = false;
    }

    function finishTask(address workerAddress) public 
    {
        Worker storage worker = workers[workerAddress];
        worker.taskId = 0;
        worker.isBusy = false;
    }

    function validateWorkerTask(address workerAddress, uint256 taskId)public view returns(bool)
    {
        Worker memory worker = workers[workerAddress];
        if(worker.taskId == taskId)
        {
            return true;
        }

        return false;
    }
}
