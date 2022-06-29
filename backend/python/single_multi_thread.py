import threading
import time
import requests

urls = [f"https://www.cnblogs.com/#p{page}" for page in range(1, 50+1)]

def craw(url):
  r = requests.get(url)
  print(url, r.text)


def single_thread():
  print('single thread begin')
  for url in urls:
    craw(url)
  print('single thread end')

def multi_thread():
  print('muiti thread begin')
  threads = []
  for url in urls:
      threads.append(
        threading.Thread(target=craw, args=(url,))  # 注意这里参数是一个元组，需要加逗号。否则识别为字符串
      )

  for thread in threads:
    thread.start() # 启动线程

  for thread in threads:
    thread.join() # 默认情况下，主线程会创建多个子线程，且互不干涉。如果希望主线程等待子线程完成后，在执行后续操作。需要使用join，将其阻塞。
  print('muiti thread end')

if __name__ == "__main__":
  start = time.time()
  single_thread()
  end = time.time()
  print('single thread cost', end - start, 'seconds') # 耗时12.030196905136108 seconds

  start = time.time()
  multi_thread()
  end = time.time()
  print('multi thread cost', end - start, 'seconds') # 耗时0.47228384017944336 seconds