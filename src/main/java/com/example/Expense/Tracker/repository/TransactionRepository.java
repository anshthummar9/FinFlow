package com.example.Expense.Tracker.repository;

import com.example.Expense.Tracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserUsernameAndDeletedFalse(String username);
    List<Transaction> findByUserUsernameAndDeletedTrue(String username);
    Transaction findByIdAndUserUsername(Long id, String username);
}
