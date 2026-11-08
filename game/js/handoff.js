/**
 * 交接模块：存档采用、提示主控与空道具声明（SAVE_STATE v3 · A 轨）。
 *
 * 只使用 WL.readSave()/WL.completeLevel()/WL.failLevel()，不混用 B 轨 ready()/complete()。
 * 本关零新增跨关道具：成功交接恒为 acquiredItemIds: []。
 * 玩法不扣血、不改理智、不覆盖存档数值，提交真实游玩结束时的存档。
 *
 * @module handoff
 */

/**
 * 理智遗物 ID。取得上一世界真实交接声明后替换一次；
 * 保持 PENDING 值时 hasSanityRelic 恒为 false（捷径关闭，不影响通关）。
 * @type {string}
 */
export const SANITY_RELIC_ID = 'PENDING_UPSTREAM_SANITY_RELIC_ID';

/**
 * 固定结束语（设计文档 5.5 原文，中文引号保持原样）。
 * @type {string}
 */
export const EXIT_HOOK =
  '主角踏入未知的光，身后那声“欢迎下次光临”还未散去，柜台上的陌生硬币正映出目的地的印记……';

/** 固定放弃原因（菜单“放弃本次夜班”走失败交接时使用）。 @type {string} */
const FAIL_REASON = '主角结束了这次未完成的夜班';

/**
 * 结束锁：页面生命周期内只允许真正提交一次。
 * completeWithHandoff / failWithHandoff 谁先到达谁提交，其余调用一律忽略。
 * @type {boolean}
 */
let ended = false;

/** 解析协议对象：优先注入值，缺省绑定 window.WL。 */
function resolveProtocol(wl) {
  if (wl) return wl;
  if (typeof window !== 'undefined' && window.WL) return window.WL;
  throw new Error('未提供 WL 协议对象，且 window.WL 不可用。');
}

/** 解析关卡配置：优先注入值，缺省绑定 window.CONFIG。 */
function resolveConfig(config) {
  if (config) return config;
  if (typeof window !== 'undefined' && window.CONFIG) return window.CONFIG;
  return {};
}

/**
 * 首档有效性守卫：仅对象负载可被采用为存档。
 * 与 iw-admin 分支的对象检查对称，防止无效 iw-save-ready detail
 * 导致 save 仍为 null 却挂载玩法（承接旁白解引用 null 崩溃）。
 * @param {*} incoming 事件 detail 或 WL.readSave() 返回值
 * @returns {boolean}
 */
export function isAdoptableSave(incoming) {
  return Boolean(incoming) && typeof incoming === 'object';
}

/**
 * 判断存档中是否携带理智遗物。
 * @param {{items?: Array<{id?: string}>}} save 官方协议存档
 * @param {string} relicId 遗物 ID；为 PENDING 常量时恒返回 false
 * @returns {boolean}
 */
export function hasSanityRelic(save, relicId) {
  if (!relicId || relicId === SANITY_RELIC_ID) return false;
  if (!save || !Array.isArray(save.items)) return false;
  return save.items.some((item) => Boolean(item) && item.id === relicId);
}

/**
 * 通关交接：提交真实游玩存档与空道具声明。
 * @param {object} save 真实游玩结束时的存档（原引用透传，不复制不篡改）
 * @param {object} [wl] WL 协议对象；缺省绑定 window.WL（测试可注入 fake）
 * @param {object} [config] 关卡配置；缺省 window.CONFIG，并强制携带同一结束语
 * @returns {object|null} 协议返回值；结束锁已合上时为 null
 */
export function completeWithHandoff(save, wl, config) {
  if (ended) return null;
  ended = true;
  const safeConfig = { ...resolveConfig(config), exitHook: EXIT_HOOK };
  return resolveProtocol(wl).completeLevel(safeConfig, save, {
    acquiredItemIds: [],
    exitHook: EXIT_HOOK,
  });
}

/**
 * 放弃交接：按固定原因提交失败交接。
 * @param {object} save 真实游玩结束时的存档（原引用透传）
 * @param {object} [wl] WL 协议对象；缺省绑定 window.WL
 * @param {object} [config] 关卡配置；缺省 window.CONFIG || {}
 * @returns {object|null} 协议返回值；结束锁已合上时为 null
 */
export function failWithHandoff(save, wl, config) {
  if (ended) return null;
  ended = true;
  return resolveProtocol(wl).failLevel(FAIL_REASON, save, resolveConfig(config));
}
