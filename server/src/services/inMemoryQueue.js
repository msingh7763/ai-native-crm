const queue = [];
let isProcessing = false;

exports.addToQueue = (task) => {
  queue.push(task);
  console.log(`Task added to queue. Queue length: ${queue.length}`);
  if (!isProcessing) {
    processQueue();
  }
};

const processQueue = async () => {
  if (queue.length === 0) {
    isProcessing = false;
    return;
  }
  isProcessing = true;
  const task = queue.shift();
  try {
    await task();
  } catch (err) {
    console.error("Error processing task", err);
  }
  // Process next
  setTimeout(processQueue, 0);
};
