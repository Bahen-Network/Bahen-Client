# power.py
import psutil
import GPUtil
def get_cpu_power():
    # Here, we assume that the power of a CPU is proportional to the number of cores and the frequency
    cpu_freq = psutil.cpu_freq().current  # MHz
    cpu_count = psutil.cpu_count()
    return cpu_freq * cpu_count

def get_gpu_power():
    # Here, we assume that the power of a GPU is proportional to the memory and load
    total_gpu_power = 0
    gpus = GPUtil.getGPUs()
    for gpu in gpus:
        gpu_memory = gpu.memoryTotal # Total memory in MB
        gpu_load = gpu.load * 100  # GPU load is in [0, 1], convert it to percentage
        total_gpu_power += gpu_memory * gpu_load
    return total_gpu_power

def get_power():
    return get_cpu_power() + get_gpu_power()


