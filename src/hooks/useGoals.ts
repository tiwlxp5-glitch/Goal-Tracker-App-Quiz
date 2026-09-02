import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Goal, Task } from "@/types";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "goals"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData: Goal[] = [];
      snapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goalData: Omit<Goal, "id" | "userId">) => {
    if (!user || !db) return;
    await addDoc(collection(db, "goals"), {
      ...goalData,
      userId: user.uid,
    });
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user || !db) return;
    const goalRef = doc(db, "goals", id);
    await updateDoc(goalRef, updates);
  };

  const deleteGoal = async (id: string) => {
    if (!user || !db) return;
    const goalRef = doc(db, "goals", id);
    await deleteDoc(goalRef);
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
