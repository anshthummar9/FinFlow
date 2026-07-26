package com.example.Expense.Tracker.service;

import com.example.Expense.Tracker.model.Budget;

import java.util.List;

public interface BudgetService {

    Budget createOrUpdateBudget(String username, Budget budget);

    List<Budget> getBudgets(String username);

    List<Budget> getBudgetsByMonthYear(String username, int month, int year);

    void deleteBudget(String username, Long id);
}
