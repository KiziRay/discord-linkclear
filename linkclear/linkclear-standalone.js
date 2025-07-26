const { WebhookClient, EmbedBuilder } = require('discord.js');

const CONFIG = {
  enabled: true,
  blockedRoleId: '',
  allowedRoleId: '',
  excludedChannels: [],
  enableChannelRestrictions: false,
  customMessages: {
    linkBlocked: '您的訊息包含連結，已被阻擋',
    inviteBlocked: '您的訊息包含邀請連結，已被阻擋'
  }
};

const LINK_REGEX = /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/?[^\s]*)/gi;
const messageCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of messageCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      messageCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

function containsLink(content) {
  if (!content || typeof content !== 'string') return false;
  
  const cacheKey = content.toLowerCase();
  if (messageCache.has(cacheKey)) {
    const cached = messageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.hasLink;
    }
  }
  
  const hasLink = LINK_REGEX.test(content);
  messageCache.set(cacheKey, { hasLink, timestamp: Date.now() });
  return hasLink;
}

function sanitizeContent(content) {
  if (!content || typeof content !== 'string') return '[內容已移除]';
  
  return content
    .replace(LINK_REGEX, '[連結已移除]')
    .replace(/@everyone/g, '@\u200beveryone')
    .replace(/@here/g, '@\u200bhere')
    .replace(/<@!?([0-9]+)>/g, '<@\u200b$1>')
    .replace(/<@&([0-9]+)>/g, '<@&\u200b$1>')
    .substring(0, 1000);
}

function createWarningEmbed(message, sanitizedContent, customMessage = null) {
  const safeMention = `<@${message.author.id}>`;
  const defaultMessage = '很抱歉，您的訊息包含連結，因此已被阻擋。\n\n請聯繫管理員以解除限制。';
  
  const description = `${safeMention}，${customMessage || defaultMessage}\n\n` +
    `**這是您輸入的訊息（連結已移除）**:\n` +
    `\`\`\`\n${sanitizedContent}\n\`\`\`\n\n` +
    `**注意**: 若您認為這是誤判，請聯繫管理員。`;
  
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('🚫 您的訊息已被系統阻擋')
    .setDescription(description)
    .setFooter({ text: '連結阻擋系統 - 感謝您的理解與配合！' })
    .setTimestamp();
}

function createInviteWarningEmbed(message, sanitizedContent, customMessage = null) {
  const safeMention = `<@${message.author.id}>`;
  const defaultMessage = '您的訊息包含邀請連結或標記，已被阻擋。';
  
  return new EmbedBuilder()
    .setColor(0xff6b35)
    .setTitle('⚠️ 檢測到違規內容')
    .setDescription(
      `**${safeMention}，${customMessage || defaultMessage}\n**` +
       `• Discord 官方邀請連結 \n` +
       `• @everyone/@here/@user/@role 標記 \n\n` +
      `**原始訊息（已過濾）**\n` +
      `\`\`\`\n${sanitizedContent}\n\`\`\` \n` +
      `訊息已自動刪除，如有疑問請聯繫管理員。`
    )
    .addFields(
      { name: '📋 違規類型', value: '邀請連結 / 標記濫用', inline: true },
      { name: '⏰ 處理時間', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      { name: '🆔 用戶ID', value: `\`${message.author.id}\``, inline: true }
    )
    .setFooter({ 
      text: '連結阻擋系統 | 請遵守伺服器規範', 
      iconURL: message.guild?.iconURL({ dynamic: true }) 
    })
    .setTimestamp();
}

async function handleLinkMessage(message, customMessage = null) {
  try {
    await message.delete();
    const sanitizedContent = sanitizeContent(message.content);
    const embed = createWarningEmbed(message, sanitizedContent, customMessage);
    await message.channel.send({ embeds: [embed] });
    console.log(`✅ 已阻擋使用者 ${message.author.tag} (${message.author.id}) 的連結訊息`);
  } catch (error) {
    console.error(`❌ 處理連結訊息時發生錯誤: ${error.message}`);
    
    try {
      await message.channel.send(`❌ 處理訊息時發生錯誤，請聯繫管理員。錯誤: ${error.message}`);
    } catch (sendError) {
      console.error(`❌ 無法發送錯誤訊息: ${sendError.message}`);
    }
  }
}

async function handleInviteViolation(message, customMessage = null) {
  try {
    await message.delete();
    const sanitizedContent = sanitizeContent(message.content);
    const embed = createInviteWarningEmbed(message, sanitizedContent, customMessage);
    await message.channel.send({ embeds: [embed] });
    console.log(`✅ 已阻擋使用者 ${message.author.tag} (${message.author.id}) 的邀請連結或標記訊息`);
  } catch (error) {
    console.error(`❌ 處理邀請違規訊息時發生錯誤: ${error.message}`);
    
    try {
      await message.channel.send(`❌ 處理訊息時發生錯誤，請聯繫管理員。錯誤: ${error.message}`);
    } catch (sendError) {
      console.error(`❌ 無法發送錯誤訊息: ${sendError.message}`);
    }
  }
}

function checkUserPermissions(message, config) {
  if (!message.member) {
    return { canSendLinks: true, canSendInvites: true };
  }
  
  const isExcludedChannel = config.excludedChannels.includes(message.channel.id);
  const hasBlockedRole = message.member.roles.cache.has(config.blockedRoleId);
  const hasAllowedRole = config.allowedRoleId ? message.member.roles.cache.has(config.allowedRoleId) : false;
  
  if (hasBlockedRole && !hasAllowedRole) {
    return { canSendLinks: false, canSendInvites: false };
  }
  
  if (hasAllowedRole) {
    return {
      canSendLinks: true,
      canSendInvites: !config.enableChannelRestrictions || isExcludedChannel
    };
  }
  
  if (!config.blockedRoleId) {
    return {
      canSendLinks: hasAllowedRole,
      canSendInvites: hasAllowedRole && (!config.enableChannelRestrictions || isExcludedChannel)
    };
  }
  
  return { canSendLinks: true, canSendInvites: true };
}

function validateConfiguration(config) {
  const errors = [];
  const warnings = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('❌ enabled 必須是布林值 (true/false)');
  }

  if (config.blockedRoleId && typeof config.blockedRoleId !== 'string') {
    errors.push('❌ blockedRoleId 必須是字串或空字串');
  }
  if (config.blockedRoleId && !/^\d{17,19}$/.test(config.blockedRoleId)) {
    errors.push('❌ blockedRoleId 必須是有效的 Discord 角色 ID (17-19 位數字)');
  }
  
  if (config.allowedRoleId && typeof config.allowedRoleId !== 'string') {
    errors.push('❌ allowedRoleId 必須是字串或空字串');
  }
  if (config.allowedRoleId && !/^\d{17,19}$/.test(config.allowedRoleId)) {
    errors.push('❌ allowedRoleId 必須是有效的 Discord 角色 ID (17-19 位數字)');
  }

  if (!Array.isArray(config.excludedChannels)) {
    errors.push('❌ excludedChannels 必須是陣列');
  } else {
    for (let i = 0; i < config.excludedChannels.length; i++) {
      const channelId = config.excludedChannels[i];
      if (typeof channelId !== 'string' || !/^\d{17,19}$/.test(channelId)) {
        errors.push(`❌ excludedChannels[${i}] 必須是有效的 Discord 頻道 ID (17-19 位數字)`);
      }
    }
  }

  if (typeof config.enableChannelRestrictions !== 'boolean') {
    errors.push('❌ enableChannelRestrictions 必須是布林值 (true/false)');
  }

  if (config.customMessages) {
    if (typeof config.customMessages !== 'object') {
      errors.push('❌ customMessages 必須是物件');
    } else {
      if (config.customMessages.linkBlocked && typeof config.customMessages.linkBlocked !== 'string') {
        errors.push('❌ customMessages.linkBlocked 必須是字串');
      }
      if (config.customMessages.inviteBlocked && typeof config.customMessages.inviteBlocked !== 'string') {
        errors.push('❌ customMessages.inviteBlocked 必須是字串');
      }
      if (config.customMessages.linkBlocked && config.customMessages.linkBlocked.length > 1000) {
        warnings.push('⚠️ customMessages.linkBlocked 訊息過長，建議簡短明瞭');
      }
      if (config.customMessages.inviteBlocked && config.customMessages.inviteBlocked.length > 1000) {
        warnings.push('⚠️ customMessages.inviteBlocked 訊息過長，建議簡短明瞭');
      }
    }
  }

  if (config.blockedRoleId && config.allowedRoleId && config.blockedRoleId === config.allowedRoleId) {
    warnings.push('⚠️ blockedRoleId 和 allowedRoleId 相同，可能導致邏輯衝突');
  }

  if (!config.blockedRoleId && !config.allowedRoleId) {
    warnings.push('⚠️ 兩個角色 ID 都為空，系統將允許所有成員發送連結');
  }

  if (config.blockedRoleId && !config.allowedRoleId) {
    warnings.push('⚠️ 有設定阻擋角色但沒有允許角色，被阻擋的成員無法獲得權限');
  }

  if (config.enableChannelRestrictions && config.excludedChannels.length === 0) {
    warnings.push('⚠️ 啟用頻道限制但沒有排除頻道，邀請連結將被完全阻擋');
  }

  if (config.excludedChannels.length > 0) {
    const uniqueChannels = new Set(config.excludedChannels);
    if (uniqueChannels.size !== config.excludedChannels.length) {
      warnings.push('⚠️ excludedChannels 中有重複的頻道 ID');
    }
  }

  return { errors, warnings };
}

function registerLinkBlocker(client, customConfig = null) {
  console.log('🔍 開始檢查連結阻擋系統配置...\n');

  if (!client) {
    console.log('❌ 錯誤：未提供 Discord 客戶端');
    return;
  }

  if (!client.isReady) {
    console.log('⚠️ 警告：Discord 客戶端尚未準備就緒，建議在 ready 事件後調用');
  }

  const config = customConfig || CONFIG;
  const validation = validateConfiguration(config);
  
  if (validation.errors.length > 0) {
    console.log('❌ 配置錯誤，請修正以下問題：');
    validation.errors.forEach(error => console.log(error));
    console.log('\n💡 配置提示：');
    console.log('   • 請確保所有 ID 都是有效的 Discord ID');
    console.log('   • 可以參考 CONFIG 物件中的註解說明');
    console.log('   • 自定義訊息不能超過 1000 字元');
    console.log('\n❌ 連結阻擋功能無法啟動');
    return;
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️ 配置警告：');
    validation.warnings.forEach(warning => console.log(warning));
    console.log('');
  }

  console.log('✅ 配置檢查通過！');
  console.log(`📋 當前配置：`);
  console.log(`   • 功能狀態: ${config.enabled ? '啟用' : '停用'}`);
  console.log(`   • 阻擋角色: ${config.blockedRoleId || '所有成員'}`);
  console.log(`   • 允許角色: ${config.allowedRoleId || '無限制'}`);
  console.log(`   • 排除頻道數量: ${config.excludedChannels.length}`);
  console.log(`   • 頻道限制功能: ${config.enableChannelRestrictions ? '啟用' : '停用'}`);
  console.log(`   • 自定義訊息: ${config.customMessages ? '已設定' : '使用預設'}`);
  
  if (config.customMessages) {
    if (config.customMessages.linkBlocked) {
      console.log(`   • 連結阻擋訊息: "${config.customMessages.linkBlocked.substring(0, 30)}${config.customMessages.linkBlocked.length > 30 ? '...' : ''}"`);
    }
    if (config.customMessages.inviteBlocked) {
      console.log(`   • 邀請阻擋訊息: "${config.customMessages.inviteBlocked.substring(0, 30)}${config.customMessages.inviteBlocked.length > 30 ? '...' : ''}"`);
    }
  }
  
  console.log('');

  if (!config.enabled) {
    console.log('⏸️ 連結阻擋功能已停用');
    return;
  }

  console.log('🔐 檢查機器人權限...');
  const requiredPermissions = ['ManageMessages', 'SendMessages', 'EmbedLinks'];
  
  console.log('   • 請確保機器人在伺服器中擁有以下權限：');
  requiredPermissions.forEach(permission => {
    console.log(`     - ${permission}`);
  });
  console.log('');

  function containsDiscordInvite(content) {
    return /(discordapp\.com\/invite\/|discord\.gg\/)[A-Za-z0-9]+/i.test(content);
  }

  function containsPing(content) {
    return (
      /@everyone/.test(content) ||
      /@here/.test(content) ||
      /<@!?\d+>/.test(content) ||
      /<@&\d+>/.test(content)
    );
  }

  client.on('messageCreate', message => {
    try {
      if (message.author.bot || !message.member) return;
      
      const permissions = checkUserPermissions(message, config);
      
      if (!permissions.canSendLinks && containsLink(message.content)) {
        handleLinkMessage(message, config.customMessages?.linkBlocked);
        return;
      }

      if (!permissions.canSendInvites) {
        if (containsDiscordInvite(message.content) || containsPing(message.content)) {
          handleInviteViolation(message, config.customMessages?.inviteBlocked);
          return;
        }
      }
    } catch (error) {
      console.error(`❌ 處理訊息時發生未預期錯誤: ${error.message}`);
    }
  });

  console.log('🚀 連結阻擋功能已成功啟動！');
  console.log('📝 系統將自動監控訊息並根據配置進行處理');
  console.log('💡 提示：如需修改配置，請重新啟動機器人');
  console.log('📊 監控項目：');
  console.log('   • 一般連結檢測');
  console.log('   • Discord 邀請連結檢測');
  console.log('   • @everyone/@here 標記檢測');
  console.log('   • 用戶標記檢測');
  console.log('   • 角色標記檢測');
}

module.exports = {
  registerLinkBlocker,
  CONFIG
}; 