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
        future = pool.submit(parse, html) # 返回一个 future 对象
        futures[future] = url
    # 按顺序返回
    # for future, url in futures.items():
    #     print(url, future.result())

    # 某任务先执行完，先返回。无序
    for future in as_completed(futures):
        url = futures[future]
        print(url, future.result())
print('parse end')