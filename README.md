# Proxy Extension with Authentication

[中文文档](./README.zh-CN.md) | English

A lightweight Chrome extension that supports HTTP/HTTPS proxy with username and password authentication. Perfect for developers and users who need to route their browser traffic through authenticated proxy servers.

## ✨ Features

- 🔐 **Authentication Support**: Full support for proxy servers requiring username and password
- 🔄 **Protocol Selection**: Switch between HTTP and HTTPS proxy protocols
- 💾 **Auto Persistence**: Automatically saves and restores proxy settings after browser restart
- 🧪 **Proxy Testing**: Built-in proxy connectivity testing with IP verification
- 🚀 **Quick Toggle**: Enable/disable proxy with a single click
- 🎯 **Lightweight**: Minimal resource usage, no performance impact
- 🔒 **Secure Storage**: Credentials stored using Chrome's secure storage API

## 📦 Installation

### Install from Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The proxy extension icon will appear in your browser toolbar

## 🚀 Quick Start

### 1. Configure Proxy

1. Click the extension icon in the toolbar
2. Select protocol: **HTTP** or **HTTPS**
3. Enter proxy configuration in format: `ip:port:username:password`
   - Example: `192.168.42.118:5907:myuser:mypass`
4. Click **"Save Configuration"**

### 2. Test Proxy (Optional)

1. Click **"Test Proxy"** button
2. Wait for the test to complete
3. View results:
   - ✅ Success: Shows your proxy IP address
   - ❌ Failure: Check your configuration

### 3. Enable Proxy

1. Click **"Enable Proxy"** button
2. The status will change to "Proxy Enabled (HTTP/HTTPS)"
3. All browser traffic now routes through the proxy

### 4. Disable Proxy

1. Click **"Disable Proxy"** button
2. Browser returns to direct connection

## 📖 Usage Guide

### Configuration Format

```
ip:port:username:password
```

- **ip**: Proxy server IP address
- **port**: Proxy server port number
- **username**: Authentication username
- **password**: Authentication password

### Protocol Selection

- **HTTP**: Standard HTTP proxy (most common)
- **HTTPS**: Secure HTTPS proxy (encrypted connection)

### Status Indicators

- 🔴 **Proxy Not Enabled**: Direct connection, no proxy
- 🟢 **Proxy Enabled (HTTP)**: Traffic routed through HTTP proxy
- 🟢 **Proxy Enabled (HTTPS)**: Traffic routed through HTTPS proxy

### Test Results

- 🔵 **Testing**: Connecting to proxy server...
- ✅ **Success**: Connection established, displays proxy IP
- ❌ **Failure**: Connection failed, check settings

## 🔧 Technical Details

### Architecture

```
┌─────────────┐
│  popup.html │  ← User Interface
│  popup.js   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  background.js  │  ← Service Worker
│                 │     - Manages auth credentials
│                 │     - Handles auth requests
└─────────────────┘
       │
       ↓
┌─────────────────┐
│ Chrome Proxy API│  ← System Level
│   + Storage API │
└─────────────────┘
```

### Permissions

- `proxy`: Configure browser proxy settings
- `storage`: Store configuration and credentials
- `webRequest`: Intercept authentication requests
- `webRequestAuthProvider`: Provide authentication credentials
- `<all_urls>`: Handle requests to all URLs

### Auto-Recovery

The extension automatically recovers from:
- ✅ Browser restart
- ✅ Extension reload
- ✅ Network disconnection/reconnection
- ✅ Computer sleep/wake

## 🛡️ Security

- Credentials are stored using Chrome's `chrome.storage.sync` API
- Data is encrypted and synchronized across devices (if Chrome sync is enabled)
- No data is sent to external servers
- Authentication only happens through Chrome's native mechanisms

## 🐛 Troubleshooting

### Proxy keeps asking for credentials

- Make sure you clicked "Save Configuration" before enabling
- Check if username and password are correct
- Try disabling and re-enabling the proxy

### Test fails but manual browsing works

- Some proxy servers may block the test API (`api.ipify.org`)
- If regular browsing works, the proxy is functioning correctly

### Proxy doesn't work after browser restart

- Reload the extension from `chrome://extensions/`
- This is a rare issue with Chrome's extension system

### Connection is slow

- This is typically related to proxy server performance
- Try switching between HTTP and HTTPS protocols
- Contact your proxy provider

## 📝 Development

### File Structure

```
my-proxy-extension/
├── manifest.json       # Extension manifest
├── background.js       # Background service worker
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── icon.png           # Extension icon
└── README.md          # Documentation
```

### Key APIs Used

- `chrome.proxy`: Proxy configuration
- `chrome.storage.sync`: Persistent storage
- `chrome.webRequest.onAuthRequired`: Authentication handling
- `chrome.runtime.onMessage`: Internal messaging

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Issues and pull requests are welcome!

## 📧 Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

Made with ❤️ for developers who need proxy authentication

