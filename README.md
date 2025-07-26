# Discord 連結阻擋系統

[![Node.js](https://img.shields.io/badge/Node.js-16.0.0+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.0.0+-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一個專為 Discord 伺服器設計的連結阻擋模組，支援角色權限控制和頻道排除功能。

## 👨‍💻 原作者

**Discord 用戶：** `kiziray (https://discord.gg/zeitfrei) ` \n
<img width="389" height="615" alt="image" src="https://github.com/user-attachments/assets/347f4a3f-d5ce-4a0d-b05c-9ba0e7c51046" />

## 📋 目錄結構

```
📦 linkclear/
├── 📄 README.md              # 本文件 - 主要說明和指引
├── 📄 package.json           # 依賴管理
├── 📄 index.js               # 完整版本主程式
├── 📄 linkclear.js           # 完整版本模組
├── 📄 linkclear-standalone.js    # 獨立模組版本
├── 📁 完整版本/              # 適合新手的完整套件
│   ├── index.js              # 主程式檔案
│   ├── linkclear.js          # 連結阻擋模組
│   ├── package.json          # 依賴管理
│   ├── README.md             # 完整版本說明
│   └── .gitignore            # Git 忽略檔案
└── 📁 模組版本/              # 適合進階用戶的模組
    ├── linkclear-standalone.js  # 獨立模組檔案
    ├── package.json          # 依賴管理
    └── README.md             # 模組版本說明
```

## 🎯 快速選擇指南

### 🆕 新手用戶（推薦）
**選擇：** `完整版本/` 資料夾
**適合：** 第一次架設 Discord 機器人的用戶
**優點：**
- ✅ 包含所有必要檔案
- ✅ 詳細的設定說明
- ✅ 一鍵運行
- ✅ 完整的錯誤處理
- ✅ 即開即用

### 🔧 進階用戶
**選擇：** `模組版本/` 資料夾 或 根目錄的 `linkclear-standalone.js`
**適合：** 已有 Discord 機器人的用戶
**優點：**
- ✅ 只包含核心模組
- ✅ 可整合到現有程式
- ✅ 支援自定義配置
- ✅ 輕量化設計

## 🚀 快速開始

### 方式一：完整版本（推薦新手）

#### 步驟 1：下載檔案
下載以下檔案到同一個資料夾：
- `index.js`
- `linkclear.js`
- `package.json`
- `.gitignore`

#### 步驟 2：安裝依賴
```bash
npm install
```

#### 步驟 3：設定 Token
編輯 `index.js`，修改這一行：
```javascript
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';  // ← 替換為您的機器人 Token
```

#### 步驟 4：設定配置
編輯 `linkclear.js`，修改 `CONFIG` 物件：
```javascript
const CONFIG = {
  enabled: true,
  blockedRoleId: '123456789012345678', // 被阻擋的角色 ID
  allowedRoleId: '876543210987654321', // 允許的角色 ID
  excludedChannels: ['111111111111111111'], // 排除的頻道
  enableChannelRestrictions: true,
  customMessages: {
    linkBlocked: '您沒有權限發送連結',
    inviteBlocked: '邀請連結只能在指定頻道發送'
  }
};
```

#### 步驟 5：運行機器人
```bash
npm start
```

### 方式二：模組版本（推薦進階用戶）

#### 步驟 1：下載模組
只下載 `linkclear-standalone.js` 檔案。

#### 步驟 2：在您的程式中引用
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

#### 步驟 3：設定配置
編輯 `linkclear-standalone.js`，修改 `CONFIG` 物件（同上）。

## ⚙️ 核心配置說明

### 基本配置結構
```javascript
const CONFIG = {
  enabled: true,                                    // 是否啟用功能
  blockedRoleId: '',                               // 被阻擋的角色 ID
  allowedRoleId: '',                               // 允許的角色 ID
  excludedChannels: [],                            // 排除的頻道 ID
  enableChannelRestrictions: false,                // 是否啟用頻道限制
  customMessages: {                                // 自定義警告訊息
    linkBlocked: '您的訊息包含連結，已被阻擋',
    inviteBlocked: '您的訊息包含邀請連結，已被阻擋'
  }
};
```

### CONFIG 物件屬性

| 屬性 | 說明 | 範例 |
|------|------|------|
| `enabled` | 是否啟用功能 | `true` |
| `blockedRoleId` | 被阻擋的角色 ID | `'123456789012345678'` |
| `allowedRoleId` | 允許的角色 ID | `'876543210987654321'` |
| `excludedChannels` | 排除的頻道 ID 陣列 | `['111111111111111111']` |
| `enableChannelRestrictions` | 是否啟用頻道限制 | `true` |
| `customMessages` | 自定義警告訊息 | 見下方範例 |

### 常用配置範例

#### 驗證系統伺服器
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

#### 嚴格控制伺服器
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

## 🔧 功能特色

- 🔗 **連結檢測**：自動檢測並阻擋一般連結
- 🎯 **邀請連結檢測**：阻擋 Discord 邀請連結
- 🏷️ **標記檢測**：阻擋 @everyone/@here/@user/@role 標記
- 👥 **角色權限**：支援阻擋角色和允許角色設定
- 📍 **頻道排除**：可設定特定頻道不進行檢查
- 💬 **自定義訊息**：支援自定義警告訊息
- ⚙️ **簡單配置**：只需修改 CONFIG 物件即可使用
- 🛡️ **權限控制**：支援多層級權限管理

## 🖥️ 系統需求

- **Node.js**: 16.0.0 或更高版本
- **Discord.js**: 14.0.0 或更高版本
- **記憶體**: 最少 50MB 可用記憶體
- **網路**: 穩定的網路連線

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

### Q: 支援多個伺服器嗎？
A: 是的，同一個機器人可以服務多個伺服器，但配置會套用到所有伺服器。

## 🔍 故障排除

### 常見錯誤及解決方案

1. **Token 錯誤**
   - 檢查 Token 是否正確複製
   - 確認機器人是否已加入伺服器

2. **權限不足**
   - 確保機器人有「管理訊息」權限
   - 檢查機器人角色位置是否高於目標角色

3. **模組載入失敗**
   - 確認所有依賴已安裝：`npm install`
   - 檢查檔案路徑是否正確

4. **配置無效**
   - 檢查 JSON 語法是否正確
   - 確認角色 ID 和頻道 ID 是否有效

## 📞 疑難雜症

如果遇到問題，請按以下順序檢查：

1. **基本檢查**
   - 所有檔案是否下載完整
   - 依賴是否安裝成功
   - 配置是否正確
   - 權限是否足夠

2. **進階檢查**
   - 查看控制台錯誤訊息
   - 檢查網路連線狀態
   - 確認 Discord API 狀態

3. **尋求協助**
   如需進一步協助，請提供：
   - 錯誤訊息截圖
   - 系統環境資訊
   - 配置內容
   - 日誌檔案

## 📋 使用限制與聲明

### 🔒 使用限制

1. **個人使用**：此專案僅供個人學習和研究使用
2. **商業使用**：禁止用於商業用途或營利目的
3. **修改限制**：可以修改代碼以適應個人需求，但不得移除原作者資訊
4. **分發限制**：可以分享給其他用戶，但必須包含完整的原作者資訊

### 📝 原作者聲明

- **原作者**：Discord 用戶 `kiziray`
- **版權**：保留所有權利
- **授權**：僅授權個人學習和研究使用
- **責任**：使用者需自行承擔使用風險

### ⚠️ 重要提醒

1. **遵守 Discord ToS**：使用時請遵守 Discord 服務條款
2. **合理使用**：請合理使用此工具，避免濫用
3. **技術支援**：原作者不提供技術支援服務
4. **更新維護**：原作者不保證定期更新或維護

### 🚫 禁止行為

- 將此專案用於商業用途
- 移除或修改原作者資訊
- 聲稱擁有此專案的版權
- 用於違法或不當用途

## 📚 相關文件

- **📁 完整版本/README.md** - 完整版本的詳細說明
- **📁 模組版本/README.md** - 模組版本的詳細說明

---

**原作者：** Discord 用戶 `kiziray`  
**最後更新：** 2025年07月  
**版本：** 1.0.1  
**相容性：** Discord.js v14+  
**授權：** 僅供個人學習和研究使用 
