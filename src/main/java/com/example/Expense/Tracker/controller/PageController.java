package com.example.Expense.Tracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * MVC Controller that maps URL routes to JSP view names.
 * Each method returns a logical view name resolved by the
 * InternalResourceViewResolver configured in application.properties:
 *   prefix = /WEB-INF/views/
 *   suffix = .jsp
 */
@Controller
public class PageController {

    @GetMapping("/")
    public String root() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/records")
    public String records() {
        return "records";
    }

    @GetMapping("/analysis")
    public String analysis() {
        return "analysis";
    }

    @GetMapping("/budgets")
    public String budgets() {
        return "budgets";
    }

    @GetMapping("/accounts")
    public String accounts() {
        return "accounts";
    }

    @GetMapping("/categories")
    public String categories() {
        return "categories";
    }
}
