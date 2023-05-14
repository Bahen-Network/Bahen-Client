import GPUtil
import psutil

def get_cpu_power():
    # You can design a benchmark test here
    # For simplicity, we use CPU frequency as an indicator of CPU power
    return psutil.cpu_freq().current

def get_gpu_power():
    # You can design a benchmark test here
    # For simplicity, we use GPU memory as an indicator of GPU power
    GPUs = GPUtil.getGPUs()
    return sum([gpu.memoryTotal for gpu in GPUs]) if GPUs else 0

def get_power():
    return get_cpu_power() + get_gpu_power()
