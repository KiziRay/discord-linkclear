# Discord 連結阻擋系統 - 模組版本

## 📋 目錄
- [快速開始](#快速開始)
- [設定說明](#設定說明)
- [使用範例](#使用範例)
- [配置範例](#配置範例)

## 🚀 快速開始

### 步驟 1：下載模組
只下載 `linkclear-standalone.js` 檔案。

### 步驟 2：設定配置
編輯 `linkclear-standalone.js`，修改 `CONFIG` 物件：
```javascript
const CONFIG = {
  enabled: true,                                    // ← 是否啟用連結阻擋功能
  blockedRoleId: '123456789012345678',             // ← 被阻擋的角色 ID
  allowedRoleId: '876543210987654321',             // ← 允許的角色 ID
  excludedChannels: ['111111111111111111'],        // ← 排除的頻道
  enableChannelRestrictions: true,                 // ← 是否啟用頻道限制
  customMessages: {                                // ← 自定義警告訊息
    linkBlocked: '您沒有權限發送連結',
    inviteBlocked: '邀請連結只能在指定頻道發送'
  }
};
```

### 步驟 3：在您的程式中引用
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { registerLinkBlocker } = require('./linkclear-standalone.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('機器人已準備就緒');
  registerLinkBlocker(client);
});

client.login('YOUR_BOT_TOKEN');
```

## ⚙️ 設定說明

### 需要設定的項目

#### 連結阻擋配置（linkclear-standalone.js）
```javascript
const CONFIG = {
  enabled: true,                                    // ← 是否啟用連結阻擋功能
  blockedRoleId: '',                               // ← 被阻擋的角色 ID（留空則阻擋所有成員）
  allowedRoleId: '',                               // ← 允許發送連結的角色 ID（留空則不限制）
  excludedChannels: [],                            // ← 排除的頻道 ID（這些頻道不會被檢查）
  enableChannelRestrictions: false,                // ← 是否啟用頻道限制（邀請連結只能在指定頻道發送）
  customMessages: {                                // ← 自定義警告訊息（可選）
    linkBlocked: '您的訊息包含連結，已被阻擋',
    inviteBlocked: '您的訊息包含邀請連結，已被阻擋'
  }
};
```

## 💻 使用範例

### 基本使用
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { registerLinkBlocker } = require('./linkclear-standalone.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('機器人已準備就緒');
  registerLinkBlocker(client);
});

client.login('YOUR_BOT_TOKEN');
```

### 自定義配置
```javascript
const { registerLinkBlocker } = require('./linkclear-standalone.js');

const customConfig = {
  enabled: true,
  blockedRoleId: '123456789012345678',
  allowedRoleId: '876543210987654321',
  excludedChannels: ['111111111111111111'],
  enableChannelRestrictions: true,
  customMessages: {
    linkBlocked: '您沒有權限發送連結',
    inviteBlocked: '邀請連結只能在指定頻道發送'
  }
};

registerLinkBlocker(client, customConfig);
```

## 🎯 配置範例

### 驗證系統伺服器
```javascript
const CONFIG = {
  enabled: true,
  blockedRoleId: '未驗證角色ID',
  allowedRoleId: '已驗證角色ID',
  excludedChannels: [],
  enableChannelRestrictions: false,
  customMessages: {
    linkBlocked: '請先完成驗證才能發送連結',
    inviteBlocked: '請先完成驗證才能發送邀請連結'
  }
};
```

### 嚴格控制伺服器
```javascript
const CONFIG = {
  enabled: true,
  blockedRoleId: '', // 阻擋所有成員
  allowedRoleId: '管理員角色ID',
  excludedChannels: ['管理員頻道ID'],
  enableChannelRestrictions: true,
  customMessages: {
    linkBlocked: '只有管理員可以發送連結',
    inviteBlocked: '只有管理員可以發送邀請連結'
  }
};
```

## ❓ 常見問題

### Q: 如何獲取角色 ID 和頻道 ID？
A: 在 Discord 中開啟開發者模式，右鍵點擊角色或頻道選擇「複製 ID」。

### Q: 機器人沒有回應怎麼辦？
A: 檢查：
1. Token 是否正確
2. 機器人是否在線
3. 權限是否足夠
4. 配置是否有誤

### Q: 如何停用功能？
A: 設定 `enabled: false` 或註解掉 `registerLinkBlocker(client)` 這一行。

## 📞 支援

如果遇到問題，請檢查：
1. 模組檔案是否下載完整
2. 依賴是否安裝成功
3. 配置是否正確
4. 權限是否足夠 