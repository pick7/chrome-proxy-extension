document.addEventListener('DOMContentLoaded', function() {
  const proxyInput = document.getElementById('proxyInput');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const toggleBtn = document.getElementById('toggleBtn');
  const statusElement = document.getElementById('status');
  const testResultElement = document.getElementById('testResult');
  const protocolRadios = document.querySelectorAll('input[name="protocol"]');
  
  // 加载保存的代理配置
  chrome.storage.sync.get(['proxyConfig', 'proxyEnabled', 'proxyProtocol'], function(result) {
    if (result.proxyConfig) {
      proxyInput.value = result.proxyConfig;
    }
    
    // 恢复协议选择
    if (result.proxyProtocol) {
      const protocolRadio = document.querySelector(`input[name="protocol"][value="${result.proxyProtocol}"]`);
      if (protocolRadio) {
        protocolRadio.checked = true;
      }
    }
    
    updateUI(result.proxyEnabled, result.proxyProtocol);
  });
  
  // 保存代理配置
  saveBtn.addEventListener('click', function() {
    const proxyStr = proxyInput.value.trim();
    
    // 简单验证格式
    if (!proxyStr || proxyStr.split(':').length !== 4) {
      alert('请输入正确格式: ip:port:username:password');
      return;
    }
    
    // 获取选择的协议
    const selectedProtocol = document.querySelector('input[name="protocol"]:checked').value;
    
    chrome.storage.sync.set({ 
      proxyConfig: proxyStr,
      proxyProtocol: selectedProtocol
    }, function() {
      alert('配置已保存');
    });
  });
  
  // 测试代理
  testBtn.addEventListener('click', function() {
    const proxyStr = proxyInput.value.trim();
    
    // 验证格式
    if (!proxyStr || proxyStr.split(':').length !== 4) {
      showTestResult('请先输入代理配置', 'failure');
      return;
    }
    
    const [ip, port, username, password] = proxyStr.split(':');
    const protocol = document.querySelector('input[name="protocol"]:checked').value;
    
    // 显示测试中状态
    showTestResult('正在测试代理连接...', 'loading');
    testBtn.disabled = true;
    
    // 保存当前代理状态
    chrome.storage.sync.get(['proxyEnabled'], function(result) {
      const wasEnabled = result.proxyEnabled;
      
      // 临时配置代理
      const config = {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
            scheme: protocol,
            host: ip,
            port: parseInt(port)
          },
          bypassList: ["localhost"]
        }
      };
      
      // 设置认证信息
      chrome.runtime.sendMessage({
        type: 'setAuth',
        username: username,
        password: password
      });
      
      // 应用代理配置
      chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function() {
          if (chrome.runtime.lastError) {
            showTestResult('代理配置失败: ' + chrome.runtime.lastError.message, 'failure');
            testBtn.disabled = false;
            return;
          }
          
          // 测试代理连接 - 访问一个可靠的IP检测API
          fetch('https://api.ipify.org?format=json', {
            method: 'GET',
            cache: 'no-cache'
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('请求失败');
          })
          .then(data => {
            showTestResult(`✓ 代理连接成功！\n代理IP: ${data.ip}`, 'success');
            
            // 如果之前没启用，恢复状态
            if (!wasEnabled) {
              setTimeout(() => {
                chrome.proxy.settings.clear({ scope: 'regular' });
                chrome.runtime.sendMessage({ type: 'clearAuth' });
              }, 100);
            }
            testBtn.disabled = false;
          })
          .catch(error => {
            showTestResult('✗ 代理连接失败\n请检查代理配置是否正确', 'failure');
            
            // 恢复之前的状态
            if (!wasEnabled) {
              chrome.proxy.settings.clear({ scope: 'regular' });
              chrome.runtime.sendMessage({ type: 'clearAuth' });
            }
            testBtn.disabled = false;
          });
        }
      );
    });
  });
  
  // 切换代理状态
  toggleBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['proxyConfig', 'proxyEnabled', 'proxyProtocol'], function(result) {
      const newState = !result.proxyEnabled;
      
      if (newState) {
        // 启用代理
        if (!result.proxyConfig) {
          alert('请先保存代理配置');
          return;
        }
        
        const [ip, port, username, password] = result.proxyConfig.split(':');
        const protocol = result.proxyProtocol || 'http';  // 默认使用 http
        
        // 配置代理
        const config = {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: protocol,
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
              updateUI(true, protocol);
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
              updateUI(false, null);
            });
          }
        );
      }
    });
  });
  
  // 更新UI状态
  function updateUI(enabled, protocol) {
    if (enabled) {
      const protocolText = protocol ? protocol.toUpperCase() : 'HTTP';
      statusElement.textContent = `代理已启用 (${protocolText})`;
      statusElement.className = 'status active';
      toggleBtn.textContent = '禁用代理';
    } else {
      statusElement.textContent = '代理未启用';
      statusElement.className = 'status inactive';
      toggleBtn.textContent = '启用代理';
    }
  }
  
  // 显示测试结果
  function showTestResult(message, type) {
    testResultElement.textContent = message;
    testResultElement.className = 'test-result';
    testResultElement.style.display = 'block';
    
    if (type === 'success') {
      testResultElement.classList.add('test-success');
    } else if (type === 'failure') {
      testResultElement.classList.add('test-failure');
    } else if (type === 'loading') {
      testResultElement.classList.add('test-loading');
    }
  }
});
