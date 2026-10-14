import type { Case } from '../types';
import { rainyNightTheft } from './cases/rainyNightTheft';

/**
 * 案件注册表。新增案件时：
 * 1. 在 src/data/cases/ 下新建 xxx.ts，导出实现 Case 接口的对象；
 * 2. import 后加入此数组即可。其余模块（store、logic、UI）无需改动。
 */
export const cases: Case[] = [rainyNightTheft];

/** 按 ID 查找案件。找不到返回 undefined。 */
export function getCaseById(caseId: string): Case | undefined {
  return cases.find((c) => c.id === caseId);
}

/** 案件 ID 列表。 */
export const caseIds = cases.map((c) => c.id);
