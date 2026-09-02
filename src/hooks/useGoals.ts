import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Goal, Task } from "@/types";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching goals:", error);
      } else {
        const formattedGoals = data.map(d => ({
          id: d.id,
          userId: d.user_id,
          title: d.title,
          description: d.description,
          type: d.type,
          color: d.color,
          icon: d.icon,
          createdAt: d.created_at,
          targetDate: d.target_date,
          tasks: d.tasks || [],
          completedDates: d.completed_dates || []
        })) as Goal[];
        setGoals(formattedGoals);
      }
      setLoading(false);
    };

    fetchGoals();

    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addGoal = async (goalData: Omit<Goal, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    
    const dataToInsert = {
      user_id: user.id,
      title: goalData.title,
      description: goalData.description,
      type: goalData.type,
      color: goalData.color,
      icon: goalData.icon,
      target_date: goalData.targetDate,
      tasks: goalData.tasks || [],
      completed_dates: goalData.completedDates || []
    };

    await supabase.from("goals").insert([dataToInsert]);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    
    const mappedUpdates: any = {};
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.type !== undefined) mappedUpdates.type = updates.type;
    if (updates.color !== undefined) mappedUpdates.color = updates.color;
    if (updates.icon !== undefined) mappedUpdates.icon = updates.icon;
    if (updates.targetDate !== undefined) mappedUpdates.target_date = updates.targetDate;
    if (updates.tasks !== undefined) mappedUpdates.tasks = updates.tasks;
    if (updates.completedDates !== undefined) mappedUpdates.completed_dates = updates.completedDates;

    await supabase.from("goals").update(mappedUpdates).eq("id", id);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await supabase.from("goals").delete().eq("id", id);
  };

  const toggleTask = async (goalId: string, taskId: string, isDone: boolean) => {
    if (!user) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.tasks) return;

    const newTasks = goal.tasks.map((t) =>
      t.id === taskId ? { ...t, isDone } : t
    );
    await updateGoal(goalId, { tasks: newTasks });
  };

  const toggleHabitDate = async (goalId: string, dateStr: string) => {
    if (!user) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const completedDates = goal.completedDates || [];
    let newDates = [...completedDates];
    
    if (newDates.includes(dateStr)) {
      newDates = newDates.filter(d => d !== dateStr);
    } else {
      newDates.push(dateStr);
    }
    
    await updateGoal(goalId, { completedDates: newDates });
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal, toggleTask, toggleHabitDate };
};
