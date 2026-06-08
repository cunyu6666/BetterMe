/**
 * [WHO]: 全局 API 层，所有 Feature 的数据操作必须经过此文件
 * [FROM]: 依赖 @insforge/sdk 的 insforge client；依赖 ../../types 的类型定义
 * [TO]: 被各 Feature 的 hooks 消费（组件禁止直连）
 * [HERE]: src/lib/api/index.ts - V5.0 契约：所有函数返回 APIResponse<T> = { data, error }
 *
 * 红线 R1：组件内不得出现 insforge.database.* 调用
 * 红线 R2：所有返回值必须遵循 { data, error } 契约
 */
import insforge from '../insforge'
import type { Habit, Goal, HealthRecord, LearningItem, Milestone } from '../../types'

// ── API Response 契约 ──

export type APIResponse<T> = { data: T; error: null } | { data: null; error: Error }

function ok<T>(data: T): APIResponse<T> {
  return { data, error: null }
}

function fail(error: unknown): APIResponse<never> {
  return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
}

// ── Table names ──

const TABLE = {
  habits: 'habits',
  goals: 'goals',
  goalTasks: 'goal_tasks',
  milestones: 'milestones',
  healthRecords: 'health_records',
  learningItems: 'learning_items',
  planData: 'plan_data',
} as const

// ── Row mappers ──

function rowToHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    frequency: row.frequency as Habit['frequency'],
    frequencyCount: (row.frequency_count as number) ?? undefined,
    frequencyUnit: (row.frequency_unit as 'week' | 'day') ?? undefined,
    completedDates: (row.completed_dates as string[]) ?? [],
    createdAt: (row.created_at as string)?.slice(0, 10) ?? '',
    archived: (row.archived as boolean) ?? false,
  }
}

function habitToRow(h: Habit): Record<string, unknown> {
  return {
    id: h.id,
    name: h.name,
    category: h.category,
    frequency: h.frequency,
    frequency_count: h.frequencyCount ?? null,
    frequency_unit: h.frequencyUnit ?? null,
    completed_dates: h.completedDates,
    archived: h.archived ?? false,
  }
}

function rowToLearningItem(row: Record<string, unknown>): LearningItem {
  return {
    id: row.id as string,
    type: row.type as LearningItem['type'],
    title: row.title as string,
    content: (row.content as string) ?? '',
    progress: (row.progress as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
    hours: (row.hours as number) ?? undefined,
    createdAt: (row.created_at as string)?.slice(0, 10) ?? '',
  }
}

function learningItemToRow(item: LearningItem): Record<string, unknown> {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    progress: item.progress,
    tags: item.tags,
    hours: item.hours ?? null,
  }
}

// ── Habits ──

export async function fetchHabits(): Promise<APIResponse<Habit[]>> {
  try {
    const { data, error } = await insforge.database.from(TABLE.habits).select('*').order('created_at', { ascending: false })
    if (error) return fail(error)
    return ok((data ?? []).map(rowToHabit))
  } catch (e) { return fail(e) }
}

export async function upsertHabit(habit: Habit): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.habits).upsert(habitToRow(habit))
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

export async function deleteHabit(id: string): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.habits).delete().eq('id', id)
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

// ── Goals ──

export async function fetchGoals(): Promise<APIResponse<Goal[]>> {
  try {
    const { data: goals, error } = await insforge.database.from(TABLE.goals).select('*').order('created_at', { ascending: false })
    if (error) return fail(error)
    if (!goals?.length) return ok([])

    const [tasksRes, milestonesRes] = await Promise.all([
      insforge.database.from(TABLE.goalTasks).select('*'),
      insforge.database.from(TABLE.milestones).select('*'),
    ])

    const taskMap = new Map<string, Record<string, unknown>[]>()
    ;(tasksRes.data ?? []).forEach(t => {
      const list = taskMap.get(t.goal_id) ?? []
      list.push(t)
      taskMap.set(t.goal_id, list)
    })

    const milestoneMap = new Map<string, Milestone[]>()
    ;(milestonesRes.data ?? []).forEach(m => {
      const list = milestoneMap.get(m.goal_id) ?? []
      list.push({ id: m.id, title: m.title, dueDate: m.due_date ?? '', done: m.done })
      milestoneMap.set(m.goal_id, list)
    })

    return ok(goals.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description ?? '',
      deadline: g.deadline ?? '',
      priority: g.priority,
      status: g.status,
      tasks: (taskMap.get(g.id) ?? []).map(t => ({ id: t.id as string, title: t.title as string, done: t.done as boolean })),
      milestones: milestoneMap.get(g.id) ?? [],
      createdAt: g.created_at?.slice(0, 10) ?? '',
    })))
  } catch (e) { return fail(e) }
}

export async function upsertGoal(goal: Goal): Promise<APIResponse<void>> {
  try {
    const { tasks, milestones, ...rest } = goal
    const { error } = await insforge.database.from(TABLE.goals).upsert({
      id: rest.id, title: rest.title, description: rest.description,
      deadline: rest.deadline || null, priority: rest.priority, status: rest.status,
    })
    if (error) return fail(error)

    await insforge.database.from(TABLE.goalTasks).delete().eq('goal_id', goal.id)
    if (tasks.length > 0) {
      const { error: taskErr } = await insforge.database.from(TABLE.goalTasks).upsert(
        tasks.map(t => ({ id: t.id, goal_id: goal.id, title: t.title, done: t.done }))
      )
      if (taskErr) return fail(taskErr)
    }

    await insforge.database.from(TABLE.milestones).delete().eq('goal_id', goal.id)
    if (milestones.length > 0) {
      const { error: msErr } = await insforge.database.from(TABLE.milestones).upsert(
        milestones.map(m => ({ id: m.id, goal_id: goal.id, title: m.title, due_date: m.dueDate || null, done: m.done }))
      )
      if (msErr) return fail(msErr)
    }

    return ok(undefined)
  } catch (e) { return fail(e) }
}

export async function deleteGoal(id: string): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.goals).delete().eq('id', id)
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

// ── Health Records ──

export async function fetchHealthRecords(): Promise<APIResponse<HealthRecord[]>> {
  try {
    const { data, error } = await insforge.database.from(TABLE.healthRecords).select('*').order('date', { ascending: false })
    if (error) return fail(error)
    return ok((data ?? []).map(r => ({ id: r.id, type: r.type, date: r.date, data: r.data })))
  } catch (e) { return fail(e) }
}

export async function upsertHealthRecord(record: HealthRecord): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.healthRecords).upsert({
      id: record.id, type: record.type, date: record.date, data: record.data,
    })
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

export async function deleteHealthRecord(id: string): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.healthRecords).delete().eq('id', id)
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

// ── Learning Items ──

export async function fetchLearningItems(): Promise<APIResponse<LearningItem[]>> {
  try {
    const { data, error } = await insforge.database.from(TABLE.learningItems).select('*').order('created_at', { ascending: false })
    if (error) return fail(error)
    return ok((data ?? []).map(rowToLearningItem))
  } catch (e) { return fail(e) }
}

export async function upsertLearningItem(item: LearningItem): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.learningItems).upsert(learningItemToRow(item))
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

export async function deleteLearningItem(id: string): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.learningItems).delete().eq('id', id)
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}

// ── Plan Data ──

export async function fetchPlanData(planType: string): Promise<APIResponse<Record<string, unknown> | null>> {
  try {
    const { data, error } = await insforge.database.from(TABLE.planData).select('data').eq('plan_type', planType).limit(1).single()
    if (error) return ok(null)
    return ok(data?.data ?? null)
  } catch (e) { return fail(e) }
}

export async function savePlanData(planType: string, data: Record<string, unknown>): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.database.from(TABLE.planData).upsert({
      id: planType, plan_type: planType, data,
    })
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}
