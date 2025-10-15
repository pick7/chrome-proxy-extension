// 存储当前的认证信息
let authCredentials = null;

// 启动时从storage恢复认证信息
chrome.storage.sync.get(['proxyEnabled', 'authUsername', 'authPassword'], function(result) {
  if (result.proxyEnabled && result.authUsername && result.authPassword) {
    authCredentials = {
      username: result.authUsername,
      password: result.authPassword
    };
    console.log('代理认证信息已自动恢复');
  }
});

// 监听来自popup的消息，获取认证信息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setAuth') {
    authCredentials = {
      username: message.username,
      password: message.password
    };
    // 同时保存到storage，以便浏览器重启后恢复
    chrome.storage.sync.set({
      authUsername: message.username,
      authPassword: message.password
    });
  } else if (message.type === 'clearAuth') {
    authCredentials = null;
    // 清除storage中的认证信息
    chrome.storage.sync.remove(['authUsername', 'authPassword']);
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
