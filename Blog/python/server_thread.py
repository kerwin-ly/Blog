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