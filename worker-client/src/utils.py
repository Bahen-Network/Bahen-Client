import json

def perform_training_task(task):
    print("Performing training task...")
    # Here you should add your code to perform the training task
    # For the sake of simplicity, I'm just printing the task details and writing them to a text file
    print("Task details: ", task)
    with open('task.txt', 'w') as f:
        f.write(json.dumps(task))
    print("Training task completed.")
