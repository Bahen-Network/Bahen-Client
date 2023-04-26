// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library SharedStructs {
    struct TaskInfo {
        uint256 id;
        TaskType taskType;
        TaskStatus status;
        string modelUrl;
        string trainDataUrl;
        string validateDataUrl;
        // wei
        uint256 requiredPower;
        address creator;
        address worker;
    }

    enum TaskType {
        Training,
        Validation
    }
    enum TaskStatus {
        Created,
        Assigned,
        Completed
    }

    enum OrderStatus {
        Created,        
        Confirmed,      
        Completed,      
        Failed         
    }
}
