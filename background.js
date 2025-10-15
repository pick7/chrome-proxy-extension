// 存储当前的认证信息
let authCredentials = null;

// 监听来自popup的消息，获取认证信息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setAuth') {
    authCredentials = {
      username: message.username,
      password: message.password
    };
  } else if (message.type === 'clearAuth') {
    authCredentials = null;
  }
});

// 处理认证请求
chrome.webRequest.onAuthRequired.addListener(
  (details) => {
    if (authCredentials) {
      return { authCredentials };
    }
    // 如果没有认证信息，让浏览器显示默认的认证对话框
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking", "extraHeaders"]
);
