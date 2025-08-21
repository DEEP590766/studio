"use client";

import { useState, useEffect, useCallback } from "react";
import type { Expense } from "@/lib/types";

const STORAGE_KEY = "finspeak_expenses";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        setExpenses(JSON.parse(items));
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    try {
      setExpenses(newExpenses);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage", error);
    }
  };

  const addExpense = useCallback((newExpenseData: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    saveExpenses(updatedExpenses);
  }, [expenses]);

  return { expenses, addExpense, loading };
}
