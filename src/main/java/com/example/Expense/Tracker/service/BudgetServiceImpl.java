package com.example.Expense.Tracker.service;

import com.example.Expense.Tracker.model.Budget;
import com.example.Expense.Tracker.model.User;
import com.example.Expense.Tracker.repository.BudgetRepository;
import com.example.Expense.Tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Budget createOrUpdateBudget(String username, Budget budget) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        // Upsert — if a budget exists for this category/month/year, update it
        Optional<Budget> existing = budgetRepository
                .findByUserUsernameAndCategoryAndMonthAndYear(
                        username, budget.getCategory(), budget.getMonth(), budget.getYear());

        if (existing.isPresent()) {
            Budget b = existing.get();
            b.setAmount(budget.getAmount());
            return budgetRepository.save(b);
        }

        budget.setUser(user);
        return budgetRepository.save(budget);
    }

    @Override
    public List<Budget> getBudgets(String username) {
        return budgetRepository.findByUserUsername(username);
    }

    @Override
    public List<Budget> getBudgetsByMonthYear(String username, int month, int year) {
        return budgetRepository.findByUserUsernameAndMonthAndYear(username, month, year);
    }

    @Override
    public void deleteBudget(String username, Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found: " + id));
        if (!budget.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized deletion attempt");
        }
        budgetRepository.delete(budget);
    }
}
