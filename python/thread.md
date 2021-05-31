# python中的多线程和多进程

## 基本概念

### 进程和线程
进程：操作系统**分配资源**的最小单位。

线程：操作系统**调度**的最小单位。

一个进程中可以包含多个线程，而多个线程共享一个进程里面的内存空间。

### CPU密集型和IO密集型

CPU密集型（CPU-bound）：CPU密集型也叫计算密集型。其是指在系统运行中，大部分时间都在进行计算，逻辑判断等操作，CPU的占用率一直很高，而I/O在很短的时间就可以完成。其主要特点在于，运行需要**大量的计算**，消耗cpu资源，如：压缩，解压缩，加密解密，对视频进行高清解码等等。这种计算密集型任务虽然也可以用多任务完成，但是任务越多，花在任务切换的时间就越多，CPU执行任务的效率就越低，所以，要最高效地利用CPU，计算密集型任务同时进行的数量应当等于CPU的核心数。

IO密集型（I/O-bound）：IO密集型是指在系统运行中，大部分时间都在等待I/O (硬盘/内存) 的读/写操作，而CPU的占用率一直很低。

### 多进程和多线程
多进程：利用多核cpu并行计算，**并行**的执行任务。即：同一时间下，多个任务同时执行。

多线程：多线程只能**并发**执行，不能利用多个cpu。即：同一个时间下，多个任务间隔执行。

### 全局解释器锁GIL（Global Interpreter Lock）
每个CPU在同一时间只能执行一个线程，用于解决数据的完整性和状态同步问题

## 多线程/多进程在python中的应用

### 使用单线程和多线程爬数据

完整代码：single_multi_thread.py
```python
import threading
import time
import requests

urls = [f"https://www.cnblogs.com/#p{page}" for page in range(1, 50+1)]

def craw(url):
  r = requests.get(url)
  print(url)


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
```

### 使用消息队列完成生产者消费者模式的爬虫
使用多线程，生产者爬取页面数据并推入队列中。消费者从队列中取数据，并写入到本地文件中

完整代码：queue_thread.py
```python
import queue
import threading
import requests
from bs4 import BeautifulSoup

urls = [f"https://www.cnblogs.com/#p{page}" for page in range(1, 50+1)]

def craw(url):
  r = requests.get(url)
  return r.text

def parse(html):
    soup = BeautifulSoup(html, "html.parser")
    links = soup.find_all("a", class_="post-item-title")
    return [(link['href'], link.get_text()) for link in links]

# 生产者，将HTML推入到队列中
def do_craw(url_queue: queue.Queue, html_queue: queue.Queue):
  while True:
    url = url_queue.get()
    html = craw(url)
    html_queue.put(html)
    print(threading.current_thread().name, f"craw {url}", f'queue size {url_queue.qsize()}')

# 消费者 将HTML进行解析，写入到spider.txt文档中
def do_parse(html_queue: queue.Queue, fout):
  while True:
    html = html_queue.get()
    results = parse(html)
    for result in results:
      fout.write(str(result) + '\n')
    print(threading.current_thread().name, f"result size {len(results)}", f'queue size {html_queue.qsize()}')

if __name__ == "__main__":
  url_queue = queue.Queue()
  html_queue = queue.Queue()
  for url in urls:
    url_queue.put(url)

  for idx in range(3):
    t = threading.Thread(target=do_craw, args=(url_queue, html_queue), name=f"craw thread {idx}")
    t.start()

  fout = open("./spider.txt", "w")
  for idx in range(2):
    t = threading.Thread(target=do_parse, args=(html_queue, fout), name=f"parse thread {idx}")
    t.start()
```

### 使用lock规避线程共享数据时引发的问题
使用方式1：
```python
import threading
lock = threading.Lock()

lock.acquire()
try:
    # do something
finally:
    lock.release()
```

使用方式2：
```python
import threading
lock = threading.Lock()

with lock:
    # do something
```

举例：多线程取钱。如果不加锁的情况下，很可能出现连续取两次的情况，导致余额为负数。

完整代码：lock_thread.py
```python
import time
import threading

lock = threading.Lock()
class Account:
    def __init__(self, balance):
        self.balance = balance

def draw_money(account, amount):
    # 使用with lock包裹代码
    with lock:
        if account.balance >= amount:
            # time.sleep(1)
            print(threading.current_thread().name, '取钱成功')
            account.balance -= amount
            print(threading.current_thread().name, "余额", account.balance)
        else:
            print(threading.current_thread().name, '取消失败，余额不足')

if __name__ == '__main__':
    account = Account(1000)
    t1 = threading.Thread(target=draw_money, args=(account, 600))
    t2 = threading.Thread(target=draw_money, args=(account, 600))
    t1.start()
    t2.start()
```

### 线程池的使用

方式1：map
```python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor() as pool:
    results = pool.map(craw, urls) # 使用map方法可以保证入参和下方result的遍历顺序一致
    for result in results:
        print(result)
```

方式2：future模式
```python
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor() as pool:
    futures = [pool.submit(craw, url) for url in urls]
    for future in futures: # 直接遍历futures，会按照入参的顺序输出。即等待其前面的输出结果后，在输出后面的
        print(future.result())
    for future in as_completed(futures): # as_completed不会按照入参顺序返回，而是先完成，先返回结果
        print(future.result())
```

完整代码：pool_thread.py
```python
from concurrent.futures._base import as_completed
from concurrent.futures.thread import ThreadPoolExecutor

from queue_thread import craw, urls, parse

print('craw begin')
with ThreadPoolExecutor() as pool:
    htmls = pool.map(craw, urls)
    htmls = list(zip(urls, htmls)) # zip 将其转换为一个远组
    for url, html in htmls:
        print(url, len(html))

print('craw end')


print('parse begin')
with ThreadPoolExecutor() as pool:
    futures = {}
    for url, html in htmls:
        future = pool.submit(parse, html)
        futures[future] = url
    # 按顺序返回
    # for future, url in futures.items():
    #     print(url, future.result())

    # 某任务先执行完，先返回。无序
    for future in as_completed(futures):
        url = futures[future]
        print(url, future.result())
print('parse end')
```

线程池在web开发中的应用：在web开发中，我们时常会分步去处理一些数据。如：获取前端入参 => 读写服务器文件 => 读写数据库 => api response
```python
# 完整代码server_thread.py
import json
import time
import flask
from concurrent.futures import ThreadPoolExecutor

app = flask.Flask(__name__)
pool = ThreadPoolExecutor()

def read_file():
    time.sleep(0.1) # 模拟I/O操作
    return 'file result'

def read_db():
    time.sleep(0.2) # 模拟I/O操作
    return 'db result'

def read_api():
    time.sleep(0.3) # 模拟I/O操作
    return 'api result'

# 使用单线程，耗时6s+
# @app.route("/")
# def index():
#     result_file = read_file()
#     result_db = read_db()
#     result_api = read_api()
#     return json.dumps({
#         "result_file": result_file.result(),
#         "result_db": result_db.result(),
#         "result_api": result_api.result()
#     })

# 使用多线程，耗时3s+
@app.route("/")
def index():
    result_file = pool.submit(read_file)
    result_db = pool.submit(read_db)
    result_api = pool.submit(read_api)
    return json.dumps({
        "result_file": result_file.result(),
        "result_db": result_db.result(),
        "result_api": result_api.result()
    })

if __name__ == '__main__':
    app.run()
```

### CPU密集型计算对比多进程/多线程/单线程运行速度
计算一个列表中的素数

```python
# 完整代码speed.py
import math
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

PRIMES = [112272535095293] * 100


def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    sqrt_n = int(math.floor(math.sqrt(n)))
    for i in range(3, sqrt_n + 1, 2):
        if n % i == 0:
            return False
    return True


def single_thread():
    for number in PRIMES:
        is_prime(number)


def multi_thread():
    with ThreadPoolExecutor() as pool:
        pool.map(is_prime, PRIMES)


def multi_process():
    with ProcessPoolExecutor() as pool:
        pool.map(is_prime, PRIMES)


if __name__ == "__main__":
    start = time.time()
    single_thread()
    end = time.time()
    print("single_thread, cost:", end - start, "seconds") # single_thread, cost: 62.97091197967529 seconds

    start = time.time()
    multi_thread()
    end = time.time()
    print("multi_thread, cost:", end - start, "seconds") # multi_thread, cost: 64.66155695915222 seconds

    start = time.time()
    multi_process()
    end = time.time()
    print("multi_process, cost:", end - start, "seconds") # multi_process, cost: 18.89032483100891 seconds
```


## 总结

当我们遇到一些计算量很大的任务时，由于其是*计算密集型*，主要消耗cpu。那么可以考虑使用`多进程 multiprocess`来执行任务。相比原来的一个cpu计算，多个cpu同时计算会提升更多。

由于python中`GIL`的存在，一个进程中仅当有一个线程能够执行。注意，每个进程都有各自独立的GIL。

当遇到频繁的文件读写操作时，由于其主要是进行IO操作，而cpu几乎是处于等待状态。所以即使使用多进程，利用多核cpu的特性建立几个任务同时执行，耗费的时间也不不会减少，**反而会增加**。因为当多核的情况下，当第一个cpu上的线程执行完后，会释放GIL，而其他几个cpu上的线程进行竞争。但如果马上又被第一个cpu上的线程拿到GIL，那么其他cpu上的线程就会被唤醒后一直等待切换时间，又进入待调度状态，造成**线程颠簸(thrashing)**，导致效率更低。而如果是多线程的情况，也就是单核下多线程，每次释放GIL，当一个线程将被切换时，唤醒的另一个线程都能获取到GIL锁，所以能够无缝执行，不会造成cpu的浪费。

所以，我们可以简单的进行总结：

**多进程更适用于计算密集型任务。多线程更适用于IO密集型任务。在python中，由于GIL的存在，我们可以简单的理解为其多线程就是并行的单线程**

参考：

https://zhuanlan.zhihu.com/p/62766037

https://zhuanlan.zhihu.com/p/46368084

https://zhuanlan.zhihu.com/p/20953544

