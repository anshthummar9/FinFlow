package com.example.Expense.Tracker.service;

import com.example.Expense.Tracker.model.Transaction;

import java.util.List;

public interface TransactionService {
    Transaction addTransaction(Transaction transaction, String username);
    List<Transaction> getAllTransactions(String username);
    List<Transaction> getDeletedTransactions(String username);
    void deleteTransaction(Long id, String username);
    void permanentlyDeleteTransaction(Long id, String username);
    Transaction restoreTransaction(Long id, String username);
}
