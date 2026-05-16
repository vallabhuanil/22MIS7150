import { VehicleTask } from './types.js';

/**
 * 0/1 Knapsack algorithm implementation.
 * 
 * @param capacity - MechanicHours
 * @param tasks - List of vehicle tasks (Weight = Duration, Value = Impact)
 * @returns Selected TaskIDs and total impact score.
 */
export function solveKnapsack(capacity: number, tasks: VehicleTask[]): { selectedTasks: string[], totalImpact: number } {
  const n = tasks.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = tasks[i - 1]!;
    for (let w = 0; w <= capacity; w++) {
      if (Duration <= w) {
        dp[i]![w] = Math.max(dp[i - 1]![w]!, dp[i - 1]![w - Duration]! + Impact);
      } else {
        dp[i]![w] = dp[i - 1]![w]!;
      }
    }
  }

  // Backtrack to find selected tasks
  const selectedTasks: string[] = [];
  let w = capacity;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i]![w] !== dp[i - 1]![w]) {
      const task = tasks[i - 1]!;
      selectedTasks.push(task.TaskID);
      w -= task.Duration;
    }
  }

  return {
    selectedTasks,
    totalImpact: dp[n]![capacity]!
  };
}
