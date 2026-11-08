import test from 'node:test';
import assert from 'node:assert/strict';

const HANDOFF_MODULE = '../game/js/handoff.js';

/** 设计文档 5.5 固定结束语（中文引号按原文）。 */
const FIXED_EXIT_HOOK =
  '主角踏入未知的光，身后那声“欢迎下次光临”还未散去，柜台上的陌生硬币正映出目的地的印记……';
/** 菜单“放弃本次夜班”的固定失败原因。 */
const FIXED_FAIL_REASON = '主角结束了这次未完成的夜班';

/**
 * 每次加载全新模块实例：handoff 模块内部维护结束锁，
 * 用 URL 查询参数绕开 ESM 缓存，避免用例之间互相串扰。
 * @param {string} caseKey
 */
async function loadHandoff(caseKey) {
  return import(`${HANDOFF_MODULE}?case=${caseKey}`);
}

/** 可捕获调用的 fake WL：只提供 A 轨交接会用到的三个方法。 */
function createFakeWl() {
  const calls = { completeLevel: [], failLevel: [] };
  return {
    calls,
    readSave() {
      throw new Error('交接阶段不应再次读档');
    },
    completeLevel(config, save, opts) {
      calls.completeLevel.push({ config, save, opts });
      return save;
    },
    failLevel(reason, save, config) {
      calls.failLevel.push({ reason, save, config });
      return save;
    },
  };
}

/** 构造一份带默认面板的 SAVE_STATE v3 存档。 */
function createSave(items = []) {
  return {
    schema: 'v3',
    level: 2,
    world: '天台便利店',
    player: { hp: 3, max_hp: 3, sanity: 2, level: 1, status: 'normal', curses: [] },
    items,
    clues: ['柜台上的陌生硬币'],
    exit_hook: '',
  };
}

test('test_sanity_relic', async () => {
  // ---- 固定常量 ----
  const handoff = await loadHandoff('sanity-relic');
  assert.equal(handoff.SANITY_RELIC_ID, 'PENDING_UPSTREAM_SANITY_RELIC_ID');
  assert.equal(handoff.EXIT_HOOK, FIXED_EXIT_HOOK);

  // ---- hasSanityRelic 判定矩阵 ----
  // 空背包恒 false
  assert.equal(handoff.hasSanityRelic(createSave([]), 'upstream_sanity_talisman'), false);
  // 不同 ID false
  assert.equal(
    handoff.hasSanityRelic(createSave([{ id: 'torch', type: 'light' }]), 'upstream_sanity_talisman'),
    false,
  );
  // 匹配真实 ID true
  assert.equal(
    handoff.hasSanityRelic(
      createSave([{ id: 'upstream_sanity_talisman', type: 'strange' }]),
      'upstream_sanity_talisman',
    ),
    true,
  );
  // relicId 为 PENDING 常量时恒 false：未取得真实 ID 前不得误触发捷径
  assert.equal(
    handoff.hasSanityRelic(
      createSave([{ id: 'PENDING_UPSTREAM_SANITY_RELIC_ID', type: 'strange' }]),
      handoff.SANITY_RELIC_ID,
    ),
    false,
  );
  assert.equal(handoff.hasSanityRelic(createSave([{ id: 'torch' }]), handoff.SANITY_RELIC_ID), false);
  assert.equal(handoff.hasSanityRelic(createSave([]), handoff.SANITY_RELIC_ID), false);

  // ---- 成功交接：fake WL 捕获完整调用参数 ----
  const completeHandoff = await loadHandoff('complete-capture');
  const completeWl = createFakeWl();
  const completeConfig = {
    level: 2,
    world: '天台便利店',
    nextWorld: '未名之海',
    exitHook: '大厅配置的占位文案',
  };
  completeHandoff.completeWithHandoff(createSave(), completeWl, completeConfig);
  assert.equal(completeWl.calls.completeLevel.length, 1, '成功交接应恰好调用一次 completeLevel');
  const completeCall = completeWl.calls.completeLevel[0];
  // opts 只含 acquiredItemIds: [] 与 exitHook = EXIT_HOOK（本关零新增跨关道具）
  assert.deepEqual(completeCall.opts, { acquiredItemIds: [], exitHook: FIXED_EXIT_HOOK });
  // 传入配置也携带同一结束语（正式 iframe 中官方协议优先采用 CONFIG.exitHook）
  assert.equal(completeCall.config.exitHook, FIXED_EXIT_HOOK);
  assert.equal(completeCall.config.world, '天台便利店');
  assert.equal(completeCall.config.level, 2);

  // ---- 放弃交接：失败原因固定 ----
  const failHandoff = await loadHandoff('fail-capture');
  const failWl = createFakeWl();
  const failSave = createSave();
  const failConfig = { level: 2, world: '天台便利店' };
  failHandoff.failWithHandoff(failSave, failWl, failConfig);
  assert.equal(failWl.calls.failLevel.length, 1, '放弃交接应恰好调用一次 failLevel');
  const failCall = failWl.calls.failLevel[0];
  assert.equal(failCall.reason, FIXED_FAIL_REASON);
  assert.equal(failCall.save, failSave);
  assert.equal(failCall.config, failConfig);

  // ---- 结束锁：重复成功/失败只提交一次 ----
  const lockHandoff = await loadHandoff('lock-complete-first');
  const lockWl = createFakeWl();
  lockHandoff.completeWithHandoff(createSave(), lockWl, {});
  lockHandoff.completeWithHandoff(createSave(), lockWl, {});
  lockHandoff.failWithHandoff(createSave(), lockWl, {});
  assert.equal(lockWl.calls.completeLevel.length, 1, '重复成功只应提交一次');
  assert.equal(lockWl.calls.failLevel.length, 0, '成功之后的放弃应被结束锁忽略');

  const failFirstHandoff = await loadHandoff('lock-fail-first');
  const failFirstWl = createFakeWl();
  failFirstHandoff.failWithHandoff(createSave(), failFirstWl, {});
  failFirstHandoff.failWithHandoff(createSave(), failFirstWl, {});
  failFirstHandoff.completeWithHandoff(createSave(), failFirstWl, {});
  assert.equal(failFirstWl.calls.failLevel.length, 1, '重复放弃只应提交一次');
  assert.equal(failFirstWl.calls.completeLevel.length, 0, '放弃之后的成功应被结束锁忽略');
});

test('交接透传 save 引用且不篡改内容', async () => {
  const handoff = await loadHandoff('save-ref');
  const wl = createFakeWl();
  const save = createSave([{ id: 'torch', type: 'light' }]);
  const snapshot = structuredClone(save);

  handoff.completeWithHandoff(save, wl, {});
  assert.equal(wl.calls.completeLevel[0].save, save, '成功交接必须透传同一 save 引用');
  assert.deepEqual(save, snapshot, '成功交接不得复制篡改 save 内容');

  const failHandoff = await loadHandoff('save-ref-fail');
  const failWl = createFakeWl();
  failHandoff.failWithHandoff(save, failWl, {});
  assert.equal(failWl.calls.failLevel[0].save, save, '放弃交接必须透传同一 save 引用');
  assert.deepEqual(save, snapshot, '放弃交接不得复制篡改 save 内容');
});
