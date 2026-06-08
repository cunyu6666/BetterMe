/**
 * [WHO]: 提供 localStorage 持久化工具集（uid 短随机 ID 生成 / today 返回 YYYY-MM-DD / load<T> 带 fallback 的读取 / save JSON 写入）
 * [FROM]: 依赖全局 localStorage 与 Date；无外部包依赖
 * [TO]: 被全部数据持久化组件（Habits/Goals/Health/Learning/RhinitisPlan/WristPlan/Dashboard）通过 `import { load, save, uid, today }` 消费
 * [HERE]: src/utils/storage.ts - 唯一与 localStorage 交互的入口；所有 key 必须以 `bm_` 前缀隔离；load 失败/空值统一回退 fallback
 */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const today = () => new Date().toISOString().slice(0, 10);

export const load = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback;
  } catch {
    return fallback;
  }
};

export const save = (key: string, data: unknown) =>
  localStorage.setItem(key, JSON.stringify(data));
