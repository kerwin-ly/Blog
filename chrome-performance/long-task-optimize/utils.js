function runWorker(url, num) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(url);
    worker.postMessage(num);
    worker.addEventListener('message', (e) => {
      resolve(e.data);
    });
    worker.onerror = reject;
  });
}
