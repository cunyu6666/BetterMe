import insforge from './insforge';
import type { Habit, Goal, HealthRecord, LearningItem, Milestone } from '../types';

const TABLE = {
  habits: 'habits',
  goals: 'goals',
  goalTasks: 'goal_tasks',
  milestones: 'milestones',
  healthRecords: 'health_records',
  learningItems: 'learning_items',
  planData: 'plan_data',
} as const;

// ── Habits ──

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await insforge.database.from(TABLE.habits).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToHabit);
}

export async function upsertHabit(habit: Habit): Promise<void> {
  const { error } = await insforge.database.from(TABLE.habits).upsert(habitToRow(habit));
  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await insforge.database.from(TABLE.habits).delete().eq('id', id);
  if (error) throw error;
}

// ── Goals (with nested tasks) ──

export async function fetchGoals(): Promise<Goal[]> {
  const { data: goals, error } = await insforge.database.from(TABLE.goals).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  if (!goals?.length) return [];

  const [tasksRes, milestonesRes] = await Promise.all([
    insforge.database.from(TABLE.goalTasks).select('*'),
    insforge.database.from(TABLE.milestones).select('*'),
  ]);

  const taskMap = new Map<string, any[]>();
  (tasksRes.data ?? []).forEach(t => {
    const list = taskMap.get(t.goal_id) ?? [];
    list.push(t);
    taskMap.set(t.goal_id, list);
  });

  const milestoneMap = new Map<string, Milestone[]>();
  (milestonesRes.data ?? []).forEach(m => {
    const list = milestoneMap.get(m.goal_id) ?? [];
    list.push({ id: m.id, title: m.title, dueDate: m.due_date ?? '', done: m.done });
    milestoneMap.set(m.goal_id, list);
  });

  return goals.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description ?? '',
    deadline: g.deadline ?? '',
    priority: g.priority,
    status: g.status,
    tasks: (taskMap.get(g.id) ?? []).map(t => ({ id: t.id, title: t.title, done: t.done })),
    milestones: milestoneMap.get(g.id) ?? [],
    createdAt: g.created_at?.slice(0, 10) ?? '',
  }));
}

export async function upsertGoal(goal: Goal): Promise<void> {
  const { tasks, milestones, ...rest } = goal;
  const { error } = await insforge.database.from(TABLE.goals).upsert({
    id: rest.id,
    title: rest.title,
    description: rest.description,
    deadline: rest.deadline || null,
    priority: rest.priority,
    status: rest.status,
  });
  if (error) throw error;

  // Sync tasks: delete all then re-insert
  await insforge.database.from(TABLE.goalTasks).delete().eq('goal_id', goal.id);
  if (tasks.length > 0) {
    const { error: taskErr } = await insforge.database.from(TABLE.goalTasks).upsert(
      tasks.map(t => ({ id: t.id, goal_id: goal.id, title: t.title, done: t.done }))
    );
    if (taskErr) throw taskErr;
  }

  // Sync milestones: delete all then re-insert
  await insforge.database.from(TABLE.milestones).delete().eq('goal_id', goal.id);
  if (milestones.length > 0) {
    const { error: msErr } = await insforge.database.from(TABLE.milestones).upsert(
      milestones.map(m => ({ id: m.id, goal_id: goal.id, title: m.title, due_date: m.dueDate || null, done: m.done }))
    );
    if (msErr) throw msErr;
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await insforge.database.from(TABLE.goals).delete().eq('id', id);
  if (error) throw error;
}

// ── Health Records ──

export async function fetchHealthRecords(): Promise<HealthRecord[]> {
  const { data, error } = await insforge.database.from(TABLE.healthRecords).select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ id: r.id, type: r.type, date: r.date, data: r.data }));
}

export async function upsertHealthRecord(record: HealthRecord): Promise<void> {
  const { error } = await insforge.database.from(TABLE.healthRecords).upsert({
    id: record.id, type: record.type, date: record.date, data: record.data,
  });
  if (error) throw error;
}

export async function deleteHealthRecord(id: string): Promise<void> {
  const { error } = await insforge.database.from(TABLE.healthRecords).delete().eq('id', id);
  if (error) throw error;
}

// ── Learning Items ──

export async function fetchLearningItems(): Promise<LearningItem[]> {
  const { data, error } = await insforge.database.from(TABLE.learningItems).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToLearningItem);
}

export async function upsertLearningItem(item: LearningItem): Promise<void> {
  const { error } = await insforge.database.from(TABLE.learningItems).upsert(learningItemToRow(item));
  if (error) throw error;
}

export async function deleteLearningItem(id: string): Promise<void> {
  const { error } = await insforge.database.from(TABLE.learningItems).delete().eq('id', id);
  if (error) throw error;
}

// ── Plan Data ──

export async function fetchPlanData(planType: string): Promise<Record<string, any> | null> {
  const { data, error } = await insforge.database.from(TABLE.planData).select('data').eq('plan_type', planType).limit(1).single();
  if (error) return null;
  return data?.data ?? null;
}

export async function savePlanData(planType: string, data: Record<string, any>): Promise<void> {
  const { error } = await insforge.database.from(TABLE.planData).upsert({
    id: planType,
    plan_type: planType,
    data,
  });
  if (error) throw error;
}

// ── Row mappers ──

function rowToHabit(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    frequency: row.frequency,
    frequencyCount: row.frequency_count ?? undefined,
    frequencyUnit: row.frequency_unit ?? undefined,
    completedDates: row.completed_dates ?? [],
    createdAt: row.created_at?.slice(0, 10) ?? '',
    archived: row.archived ?? false,
  };
}

function habitToRow(h: Habit) {
  return {
    id: h.id,
    name: h.name,
    category: h.category,
    frequency: h.frequency,
    frequency_count: h.frequencyCount ?? null,
    frequency_unit: h.frequencyUnit ?? null,
    completed_dates: h.completedDates,
    archived: h.archived ?? false,
  };
}

function rowToLearningItem(row: any): LearningItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content ?? '',
    progress: row.progress ?? 0,
    tags: row.tags ?? [],
    hours: row.hours ?? undefined,
    createdAt: row.created_at?.slice(0, 10) ?? '',
  };
}

function learningItemToRow(item: LearningItem) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    progress: item.progress,
    tags: item.tags,
    hours: item.hours ?? null,
  };
}
