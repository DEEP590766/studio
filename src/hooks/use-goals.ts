"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal } from "@/lib/types";

const STORAGE_KEY = "finspeak_goals";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        setGoals(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load goals from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveGoals = (newGoals: Goal[]) => {
    try {
      setGoals(newGoals);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
    } catch (error) {
      console.error("Failed to save goals to localStorage", error);
    }
  };

  const addGoal = useCallback((newGoalData: Omit<Goal, "id" | "currentAmount">) => {
    const newGoal: Goal = {
      ...newGoalData,
      id: new Date().toISOString() + Math.random(),
      currentAmount: 0, 
    };
    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
  }, [goals]);
  
  const updateGoal = useCallback((goalId: string, updatedData: Partial<Goal>) => {
    const updatedGoals = goals.map(g => g.id === goalId ? {...g, ...updatedData} : g);
    saveGoals(updatedGoals);
  }, [goals]);

  return { goals, addGoal, updateGoal, loading };
}
