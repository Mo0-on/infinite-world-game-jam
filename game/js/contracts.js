/**
 * @typedef {'ui.click'|'store.scan'|'store.coffee'|'store.receipt'|'store.lock'|'store.unlock'|'warehouse.place'|'warehouse.cable'|'warehouse.dial'|'warehouse.portal'} SoundId
 */

/**
 * @typedef {object} SceneApi
 * @property {() => 0|1|2|3} getHintLevel
 * @property {() => void} registerInteraction
 * @property {(id: SoundId) => void} playSound
 */

/**
 * @typedef {SceneApi & {exitHook: string, enterWarehouse(): void}} StoreSceneApi
 * @typedef {{destroy(): void, updateContext(context: {exitHook: string}): void}} StoreSceneHandle
 * @typedef {(container: HTMLElement, api: StoreSceneApi) => StoreSceneHandle} MountStoreScene
 */

/**
 * @typedef {SceneApi & {hasSanityRelic: boolean, completeLevel(): void}} WarehouseSceneApi
 * @typedef {{destroy(): void, updateContext(context: {hasSanityRelic: boolean}): void}} WarehouseSceneHandle
 * @typedef {(container: HTMLElement, api: WarehouseSceneApi) => WarehouseSceneHandle} MountWarehouseScene
 */

/**
 * @typedef {object} AudioManager
 * @property {() => Promise<void>} unlock
 * @property {(id: SoundId) => void} play
 * @property {() => void} startAmbience
 * @property {() => void} stopAmbience
 * @property {() => void} destroy
 * @typedef {() => AudioManager} CreateAudioManager
 */

export {};
