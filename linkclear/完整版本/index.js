/**
 * Discord 連結阻擋系統 - 完整版本主程式檔案
 * 
 * @author Discord 用戶: kiziray(https://discord.gg/zeitfrei)
 * @version 1.0.0
 * @description 完整版本的主程式入口點，適合新手用戶使用
 * @license 僅供個人學習和研究使用
 */

const { Client, GatewayIntentBits } = require('discord.js');
const { registerLinkBlocker, CONFIG } = require('./linkclear.js');

// ==================== 🔧 架設者設定區域 ====================
// 請修改以下設定項目

const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';  // ← 請替換為您的機器人 Token

// ==================== 設定區域結束 ====================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ 機器人已登入為 ${client.user.tag}`);
  console.log(`🏠 服務於 ${client.guilds.cache.size} 個伺服器`);
  console.log('');
  
  registerLinkBlocker(client);
});

client.on('error', error => {
  console.error('❌ Discord 客戶端錯誤:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ 未處理的 Promise 拒絕:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉機器人...');
  client.destroy();
  process.exit(0);
});

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.error('❌ 錯誤：請設定正確的機器人 Token');
  console.log('💡 設定方式：');
  console.log('   1. 修改 index.js 中的 BOT_TOKEN 變數');
  console.log('   2. 或設定環境變數 DISCORD_TOKEN');
  console.log('   3. 或創建 .env 檔案並設定 DISCORD_TOKEN');
  process.exit(1);
}

client.login(BOT_TOKEN).catch(error => {
  console.error('❌ 登入失敗:', error.message);
  console.log('💡 請檢查：');
  console.log('   1. Token 是否正確');
  console.log('   2. 機器人是否已創建');
  console.log('   3. 網路連線是否正常');
  process.exit(1);
}); 