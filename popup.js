document.addEventListener('DOMContentLoaded', function() {
  const proxyInput = document.getElementById('proxyInput');
  const saveBtn = document.getElementById('saveBtn');
  const toggleBtn = document.getElementById('toggleBtn');
  const statusElement = document.getElementById('status');
  
  // 加载保存的代理配置
  chrome.storage.sync.get(['proxyConfig', 'proxyEnabled'], function(result) {
    if (result.proxyConfig) {
      proxyInput.value = result.proxyConfig;
    }
    
    updateUI(result.proxyEnabled);
  });
  
  // 保存代理配置
  saveBtn.addEventListener('click', function() {
    const proxyStr = proxyInput.value.trim();
    
    // 简单验证格式
    if (!proxyStr || proxyStr.split(':').length !== 4) {
      alert('请输入正确格式: ip:port:username:password');
      return;
    }
    
    chrome.storage.sync.set({ proxyConfig: proxyStr }, function() {
      alert('配置已保存');
    });
  });
  
  // 切换代理状态
  toggleBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['proxyConfig', 'proxyEnabled'], function(result) {
      const newState = !result.proxyEnabled;
      
      if (newState) {
        // 启用代理
        if (!result.proxyConfig) {
          alert('请先保存代理配置');
          return;
        }
        
        const [ip, port, username, password] = result.proxyConfig.split(':');
        
        // 配置代理
        const config = {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: ip,
              port: parseInt(port)
            },
            bypassList: ["localhost"]
          }
        };
        
        // 应用代理配置
        chrome.proxy.settings.set(
          { value: config, scope: 'regular' },
          function() {
            if (chrome.runtime.lastError) {
              alert('启用代理失败: ' + chrome.runtime.lastError.message);
              return;
            }
            
            // 向后台脚本发送认证信息
            chrome.runtime.sendMessage({
              type: 'setAuth',
              username: username,
              password: password
            });
            
            chrome.storage.sync.set({ proxyEnabled: true }, function() {
              updateUI(true);
            });
          }
        );
      } else {
        // 禁用代理
        chrome.proxy.settings.clear(
          { scope: 'regular' },
          function() {
            // 通知后台脚本清除认证信息
            chrome.runtime.sendMessage({
              type: 'clearAuth'
            });
            
            chrome.storage.sync.set({ proxyEnabled: false }, function() {
              updateUI(false);
            });
          }
        );
      }
    });
  });
  
  // 更新UI状态
  function updateUI(enabled) {
    if (enabled) {
      statusElement.textContent = '代理已启用';
      statusElement.className = 'status active';
      toggleBtn.textContent = '禁用代理';
    } else {
      statusElement.textContent = '代理未启用';
      statusElement.className = 'status inactive';
      toggleBtn.textContent = '启用代理';
    }
  }
});
