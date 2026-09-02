export type GoalType = "long-term" | "habit";

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  suggestedDate?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  createdAt: string;
  targetDate?: string;
  color: string;
  icon: string;
  
  // For long-term
  tasks?: Task[];
  
  // For habit
  completedDates?: string[]; // array of "YYYY-MM-DD"
}
