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