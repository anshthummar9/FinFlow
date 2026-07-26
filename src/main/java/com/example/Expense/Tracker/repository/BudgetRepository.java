package com.example.Expense.Tracker.repository;

import com.example.Expense.Tracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserUsername(String username);

    List<Budget> findByUserUsernameAndMonthAndYear(String username, int month, int year);

    Optional<Budget> findByUserUsernameAndCategoryAndMonthAndYear(
            String username, String category, int month, int year);
}
