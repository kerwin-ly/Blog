# 使用subprocess管理子进程，可以用于启动电脑上的应用/打开文件等操作
import subprocess

if __name__ == '__main__':
    proc = subprocess.Popen(['open', '/Applications/Apifox.app'])
    proc.communicate()