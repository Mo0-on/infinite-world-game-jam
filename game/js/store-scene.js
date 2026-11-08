/**
 * Mount the store placeholder without implementing store gameplay.
 * @param {HTMLElement} container
 * @param {import('./contracts.js').StoreSceneApi} api
 * @returns {import('./contracts.js').StoreSceneHandle}
 */
export function mountStoreScene(container, api) {
  const root = document.createElement('section');
  root.className = 'scene scene--store';
  root.dataset.scene = 'store';
  root.innerHTML = `
    <div class="scene-copy">
      <p class="scene-kicker">23:47 · 一层营业区</p>
      <h2>灯还亮着</h2>
      <p class="scene-description">货架、值班台与通往仓库的内门已就位。这里只验证场景挂载，不开放营业流程。</p>
      <p class="scene-context" data-store-context></p>
      <button class="scene-action" type="button" data-store-check>检查值班台</button>
      <p class="scene-feedback" data-store-feedback role="status">占位交互会回传主控，不会改变物品或存档。</p>
    </div>
    <div class="scene-art store-art" aria-hidden="true">
      <div class="store-window"><span>天台方向 · 雨</span></div>
      <div class="shelf"><i></i><i></i><i></i><i></i></div>
      <div class="counter"><span>夜班值班台</span></div>
    </div>`;

  const contextLabel = root.querySelector('[data-store-context]');
  const checkButton = root.querySelector('[data-store-check]');
  const feedback = root.querySelector('[data-store-feedback]');

  function renderContext(context) {
    contextLabel.textContent = `出口记录：${context.exitHook || '未写入'}`;
  }

  function checkCounter() {
    api.registerInteraction();
    api.playSound('ui.click');
    feedback.textContent = `已回传一次有效交互；当前提示等级为 ${api.getHintLevel()}。`;
  }

  renderContext({ exitHook: api.exitHook });
  checkButton.addEventListener('click', checkCounter);
  container.append(root);

  return {
    destroy() {
      checkButton.removeEventListener('click', checkCounter);
      root.remove();
    },
    updateContext(context) {
      renderContext(context);
    },
  };
}
