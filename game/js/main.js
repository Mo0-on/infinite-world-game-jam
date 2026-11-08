import { createAudioManager } from './audio.js';
import { getHintLevel } from './hints.js';
import { mountStoreScene } from './store-scene.js';
import { mountWarehouseScene } from './warehouse-scene.js';

const sceneContainer = document.querySelector('#scene-container');
const interactionCount = document.querySelector('#interaction-count');
const systemStatus = document.querySelector('#system-status');
const sceneButtons = document.querySelectorAll('[data-scene-target]');
const blueprintEntry = document.querySelector('#blueprint-entry');
const blueprintPanel = document.querySelector('#blueprint-panel');
const menuToggle = document.querySelector('#menu-toggle');
const menuContainer = document.querySelector('#menu-container');
const audioEnable = document.querySelector('#audio-enable');

const startedAt = performance.now();
const audio = createAudioManager();
let activeScene = null;
let validInteractions = 0;

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

function completeLevelPlaceholder() {
  systemStatus.textContent = '出口交接尚未接入；当前仅为壳层演示。';
}

function switchScene(target) {
  if (activeScene) activeScene.destroy();
  sceneContainer.replaceChildren();

  if (target === 'warehouse') {
    activeScene = mountWarehouseScene(sceneContainer, {
      ...sceneApi,
      hasSanityRelic: false,
      completeLevel: completeLevelPlaceholder,
    });
    systemStatus.textContent = '仓库占位模块已挂载；调频与出口逻辑尚未接入。';
  } else {
    activeScene = mountStoreScene(sceneContainer, {
      ...sceneApi,
      exitHook: '',
      enterWarehouse: () => switchScene('warehouse'),
    });
    systemStatus.textContent = '营业区占位模块已挂载；营业与密码流程尚未接入。';
  }

  sceneContainer.dataset.activeScene = target;
  for (const button of sceneButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.sceneTarget === target));
  }
}

for (const button of sceneButtons) {
  button.addEventListener('click', () => {
    audio.play('ui.click');
    switchScene(button.dataset.sceneTarget);
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
  if (activeScene) activeScene.destroy();
  audio.destroy();
}, { once: true });

switchScene('store');
