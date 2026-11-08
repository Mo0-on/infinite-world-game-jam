import { createAudioManager } from './audio.js';
import { getHintLevel } from './hints.js';
import { mountStoreScene } from './store-scene.js';
import { mountWarehouseScene } from './warehouse-scene.js';
import {
  SANITY_RELIC_ID,
  completeWithHandoff,
  failWithHandoff,
  hasSanityRelic,
  isAdoptableSave,
} from './handoff.js';

const sceneContainer = document.querySelector('#scene-container');
const interactionCount = document.querySelector('#interaction-count');
const systemStatus = document.querySelector('#system-status');
const sceneButtons = document.querySelectorAll('[data-scene-target]');
const blueprintEntry = document.querySelector('#blueprint-entry');
const blueprintPanel = document.querySelector('#blueprint-panel');
const menuToggle = document.querySelector('#menu-toggle');
const menuContainer = document.querySelector('#menu-container');
const audioEnable = document.querySelector('#audio-enable');
const abandonToggle = document.querySelector('#abandon-toggle');
const abandonConfirm = document.querySelector('#abandon-confirm');
const abandonConfirmButton = document.querySelector('#abandon-confirm-button');
const abandonCancelButton = document.querySelector('#abandon-cancel');

const startedAt = performance.now();
const audio = createAudioManager();
const embedded = Boolean(window.parent && window.parent !== window);

let validInteractions = 0;
let save = null; // 官方协议存档：引用随 iw-save-ready / iw-admin 事件更新
let activeScene = null;
let activeSceneName = null;
let saveAdopted = false; // 首份有效存档到达前不挂载玩法（内嵌模式）
let ended = false; // 主控结束锁：成功/放弃交接只允许真正触发一次

const sceneApi = {
  getHintLevel: () => getHintLevel(performance.now() - startedAt),
  registerInteraction() {
    validInteractions += 1;
    interactionCount.textContent = String(validInteractions);
  },
  playSound(id) {
    audio.play(id);
  },
};

function setSceneButtons(target) {
  for (const button of sceneButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.sceneTarget === target));
  }
}

function closeOverlays() {
  blueprintPanel.hidden = true;
  blueprintEntry.setAttribute('aria-expanded', 'false');
  menuContainer.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  abandonConfirm.hidden = true;
  abandonToggle.setAttribute('aria-expanded', 'false');
}

function destroyActiveScene() {
  if (activeScene) activeScene.destroy();
  activeScene = null;
  activeSceneName = null;
  sceneContainer.replaceChildren();
}

/** 场景挂载后收到新存档时只同步上下文：不重挂载、不清谜题进度。 */
function syncActiveSceneContext() {
  if (!activeScene) return;
  if (activeSceneName === 'store') {
    activeScene.updateContext({ exitHook: save.exit_hook });
  } else if (activeSceneName === 'warehouse') {
    activeScene.updateContext({ hasSanityRelic: hasSanityRelic(save, SANITY_RELIC_ID) });
  }
}

function showSaveWaitingState() {
  destroyActiveScene();
  const waiting = document.createElement('section');
  waiting.className = 'scene scene--waiting';
  waiting.dataset.scene = 'waiting';
  waiting.innerHTML = `
    <div class="scene-copy">
      <p class="scene-kicker">23:46 · 天台便利店</p>
      <h2>等待上一世界存档…</h2>
      <p class="scene-description">正式运行时由大厅先送来上一世界的存档；收到之后，夜班才会开始。</p>
    </div>`;
  sceneContainer.append(waiting);
  sceneContainer.dataset.activeScene = 'waiting';
  setSceneButtons('');
  systemStatus.textContent = '内嵌模式：等待上一世界存档交接…';
}

function mountStore() {
  destroyActiveScene();
  activeScene = mountStoreScene(sceneContainer, {
    ...sceneApi,
    exitHook: save.exit_hook,
    enterWarehouse: enterWarehouse,
  });
  activeSceneName = 'store';
  sceneContainer.dataset.activeScene = 'store';
  setSceneButtons('store');
  systemStatus.textContent = '营业区已挂载：承接旁白取自真实存档 exit_hook。';
}

function enterWarehouse() {
  if (!saveAdopted || ended) return;
  destroyActiveScene();
  activeScene = mountWarehouseScene(sceneContainer, {
    ...sceneApi,
    hasSanityRelic: hasSanityRelic(save, SANITY_RELIC_ID),
    completeLevel: completeNightShift,
  });
  activeSceneName = 'warehouse';
  sceneContainer.dataset.activeScene = 'warehouse';
  setSceneButtons('warehouse');
  systemStatus.textContent = '仓库已挂载：理智遗物判定取自当前存档，出口走官方交接。';
}

function completeNightShift() {
  if (ended) return;
  ended = true;
  closeOverlays();
  const result = completeWithHandoff(save, window.WL, window.CONFIG || {});
  systemStatus.textContent = result
    ? '夜班完成：已按官方协议提交存档与空道具声明。'
    : '出口交接未完成：CONFIG 缺少必填交接项，请检查配置。';
}

function abandonNightShift() {
  if (ended) return;
  ended = true;
  closeOverlays();
  failWithHandoff(save, window.WL, window.CONFIG || {});
  systemStatus.textContent = '夜班提前结束：已按放弃交接真实存档。';
}

/** 采用新存档：首份到达才挂载玩法；此后仅更新引用并同步活动场景。 */
function adoptSave(incoming, source) {
  // 首档守卫：尚未接档时拒绝无效负载，不置位、不挂载，保留"等待上一世界存档"等待态
  if (!saveAdopted && !isAdoptableSave(incoming)) return;
  if (isAdoptableSave(incoming)) {
    save = incoming;
  }
  if (!saveAdopted) {
    saveAdopted = true;
    mountStore();
    systemStatus.textContent = source === 'embedded'
      ? '已收到上一世界存档，营业区开始夜班。'
      : '已同步读取本地存档，营业区开始夜班。';
    return;
  }
  syncActiveSceneContext();
}

if (embedded) {
  showSaveWaitingState();
  window.addEventListener('iw-save-ready', (event) => {
    adoptSave(event.detail, 'embedded');
  });
  window.addEventListener('iw-admin', (event) => {
    const detail = event.detail;
    if (detail && detail.save && typeof detail.save === 'object') {
      adoptSave(detail.save, 'embedded');
    }
  });
} else {
  adoptSave(window.WL.readSave(), 'standalone');
}

for (const button of sceneButtons) {
  button.addEventListener('click', () => {
    audio.play('ui.click');
    if (!saveAdopted) {
      showSaveWaitingState();
      return;
    }
    if (ended) return;
    if (button.dataset.sceneTarget === 'warehouse') {
      enterWarehouse();
    } else {
      mountStore();
    }
  });
}

blueprintEntry.addEventListener('click', () => {
  const shouldOpen = blueprintPanel.hidden;
  menuContainer.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  blueprintPanel.hidden = !shouldOpen;
  blueprintEntry.setAttribute('aria-expanded', String(shouldOpen));
  audio.play('ui.click');
});

menuToggle.addEventListener('click', () => {
  const shouldOpen = menuContainer.hidden;
  blueprintPanel.hidden = true;
  blueprintEntry.setAttribute('aria-expanded', 'false');
  abandonConfirm.hidden = true;
  abandonToggle.setAttribute('aria-expanded', 'false');
  menuContainer.hidden = !shouldOpen;
  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  audio.play('ui.click');
});

document.querySelectorAll('[data-close-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.dataset.closePanel);
    const trigger = panel.id === 'blueprint-panel' ? blueprintEntry : menuToggle;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
    audio.play('ui.click');
  });
});

abandonToggle.addEventListener('click', () => {
  const shouldShow = abandonConfirm.hidden;
  abandonConfirm.hidden = !shouldShow;
  abandonToggle.setAttribute('aria-expanded', String(shouldShow));
  audio.play('ui.click');
});

abandonConfirmButton.addEventListener('click', () => {
  if (!saveAdopted) {
    abandonConfirm.hidden = true;
    abandonToggle.setAttribute('aria-expanded', 'false');
    systemStatus.textContent = '还没有收到上一世界的存档，暂时无法交接。';
    return;
  }
  abandonNightShift();
});

abandonCancelButton.addEventListener('click', () => {
  abandonConfirm.hidden = true;
  abandonToggle.setAttribute('aria-expanded', 'false');
  audio.play('ui.click');
});

audioEnable.addEventListener('click', async () => {
  try {
    await audio.unlock();
    audio.startAmbience();
    audio.play('ui.click');
    audioEnable.textContent = '夜班声音已启用';
    audioEnable.disabled = true;
    systemStatus.textContent = '音频已解锁；环境声与操作音由本地合成。';
  } catch {
    systemStatus.textContent = '浏览器尚未允许音频，请再次点击启用。';
  }
});

window.addEventListener('pagehide', () => {
  destroyActiveScene();
  audio.destroy();
}, { once: true });
