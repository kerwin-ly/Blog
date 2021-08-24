import queue
import threading
import time
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

def do_craw(url_queue: queue.Queue, html_queue: queue.Queue):
  while True:
    url = url_queue.get()
    html = craw(url)
    html_queue.put(html)
    print(threading.current_thread().name, f"craw {url}", f'queue size {url_queue.qsize()}')

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