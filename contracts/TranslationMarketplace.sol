pragma solidity ^0.8.0;

contract TranslationMarketplace {
    // 定义任务结构体
    struct Task {
        uint256 id;
        address payable client;
        address payable worker;
        uint256 payment;
        string sourceFileUrl;
        string translatedFileUrl;
        bool completed;
    }

    // 任务计数器
    uint256 private taskCounter;

    // 任务映射
    mapping(uint256 => Task) public tasks;

    // 随机数生成器种子
    uint256 private randNonce;

    // 可接单worker数组
    address payable[] public availableWorkers;

    // 事件
    event TaskCreated(uint256 taskId, address client, string sourceFileUrl);
    event TaskAssigned(uint256 taskId, address worker);
    event TaskCompleted(uint256 taskId, address worker, string translatedFileUrl);

    // 发起任务
    function createTask(string memory sourceFileUrl, uint256 payment) public payable {
        require(msg.value == payment, "Payment does not match the task payment.");
        taskCounter++;
        address payable emptyAddress;
        tasks[taskCounter] = Task(taskCounter, msg.sender, emptyAddress, payment, sourceFileUrl, "", false);
        emit TaskCreated(taskCounter, msg.sender, sourceFileUrl);
    }

    // 选取worker
    function assignWorker(uint256 taskId) public {
        require(tasks[taskId].client != address(0), "Task does not exist.");
        require(tasks[taskId].worker == address(0), "Task already assigned.");
        uint256 rand = uint256(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % availableWorkers.length;
        randNonce++;
        tasks[taskId].worker = availableWorkers[rand];
        emit TaskAssigned(taskId, availableWorkers[rand]);
    }

    // 任务完成并支付
    function completeTask(uint256 taskId, string memory translatedFileUrl) public {
        require(tasks[taskId].worker == msg.sender, "Only the assigned worker can complete the task.");
        tasks[taskId].translatedFileUrl = translatedFileUrl;
        tasks[taskId].completed = true;
        tasks[taskId].worker.transfer(tasks[taskId].payment);
        emit TaskCompleted(taskId, msg.sender, translatedFileUrl);
    }

    // 注册为worker
    function registerAsWorker() public {
        availableWorkers.push(payable(msg.sender));
    }
}
