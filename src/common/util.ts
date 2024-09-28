export const sleep = (waitTime) => {
  if (waitTime < 1) {
    return;
  }
  const startTime = Date.now();
  while (Date.now() - startTime < waitTime);
};

export const log = (title, message) => {
  console.log(title + ":" + message);
};
