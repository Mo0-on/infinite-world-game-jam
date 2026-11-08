/**
 * Mount the warehouse placeholder without inventory or handoff access.
 * @param {HTMLElement} container
 * @param {import('./contracts.js').WarehouseSceneApi} api
 * @returns {import('./contracts.js').WarehouseSceneHandle}
 */
export function mountWarehouseScene(container, api) {
  const root = document.createElement('section');
  root.className = 'scene scene--warehouse';
  root.dataset.scene = 'warehouse';
  root.innerHTML = `
    <div class="scene-copy">
      <p class="scene-kicker">23:49 · 仓库内间</p>
      <h2>货架之后</h2>
      <p class="scene-description">纸箱、线缆与内门构成静态占位布景。调频、理智遗物效果和出口交接均未接入。</p>
      <p class="scene-context" data-warehouse-context></p>
      <button class="scene-action" type="button" data-warehouse-check>检查仓库线路</button>
      <p class="scene-feedback" data-warehouse-feedback role="status">这里仅演示布尔上下文与模块生命周期。</p>
    </div>
    <div class="scene-art warehouse-art" aria-hidden="true">
      <div class="stock-door"><span>仓库内门</span></div>
      <div class="crate-stack"><i></i><i></i><i></i></div>
      <div class="cable-line"></div>
    </div>`;

  const contextLabel = root.querySelector('[data-warehouse-context]');
  const checkButton = root.querySelector('[data-warehouse-check]');
  const feedback = root.querySelector('[data-warehouse-feedback]');

  function renderContext(context) {
    contextLabel.textContent = `理智遗物：${context.hasSanityRelic ? '已携带（布尔演示）' : '未携带'}`;
  }

  function checkCable() {
    api.registerInteraction();
    api.playSound('ui.click');
    feedback.textContent = `仓库占位交互已记录；当前提示等级为 ${api.getHintLevel()}。`;
  }

  renderContext({ hasSanityRelic: api.hasSanityRelic });
  checkButton.addEventListener('click', checkCable);
  container.append(root);

  return {
    destroy() {
      checkButton.removeEventListener('click', checkCable);
      root.remove();
    },
    updateContext(context) {
      renderContext(context);
    },
  };
}
