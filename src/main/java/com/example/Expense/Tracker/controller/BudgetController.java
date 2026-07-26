package com.example.Expense.Tracker.controller;

import com.example.Expense.Tracker.model.Budget;
import com.example.Expense.Tracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ExpTrack/budgets")
@CrossOrigin
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Create or update a budget
    @PostMapping("/{username}")
    public Budget createOrUpdateBudget(@PathVariable String username,
                                       @RequestBody Budget budget) {
        return budgetService.createOrUpdateBudget(username, budget);
    }

    // Get all budgets for a user
    @GetMapping("/{username}")
    public List<Budget> getBudgets(@PathVariable String username) {
        return budgetService.getBudgets(username);
    }

    // Get budgets filtered by month and year
    @GetMapping("/{username}/{month}/{year}")
    public List<Budget> getBudgetsByMonthYear(@PathVariable String username,
                                               @PathVariable int month,
                                               @PathVariable int year) {
        return budgetService.getBudgetsByMonthYear(username, month, year);
    }

    // Delete a budget
    @DeleteMapping("/{username}/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String username,
                                              @PathVariable Long id) {
        budgetService.deleteBudget(username, id);
        return ResponseEntity.noContent().build();
    }
}
