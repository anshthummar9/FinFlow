# 💸 FinFlow — Personal Finance & Expense Tracker

[![Java](https://img.shields.io/badge/Language-Java-orange)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Framework-Spring%20Boot-brightgreen)](https://spring.io/projects/spring-boot)
[![JSP](https://img.shields.io/badge/View%20Engine-JSP-red)](https://jakarta.ee/specifications/pages/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)

A modern **full-stack personal finance and budget management application** built with **Spring Boot 3**, **JSP (Java Server Pages)**, **Spring Data JPA**, **MySQL**, and **Vanilla JavaScript/CSS**.

FinFlow helps users manage their income, expenses, monthly budgets per category, payment accounts, and transaction records with dynamic interactive charts, instant filtering, and responsive dark-glassmorphism design.

---

## ✨ Features

### 📊 Multi-Page Web Application (JSP Views)
- **Dashboard (`/dashboard`)**: Instant KPI overview for Total Balance, Total Income, and Total Expenses, plus an inline quick-add transaction form and the 5 most recent transactions.
- **Records (`/records`)**: Full transaction history table featuring a 6-way filter bar (search, type, category, account, date range, sort) alongside inline edit and soft-delete capabilities.
- **Analysis (`/analysis`)**: 4 interactive Chart.js visualizations (Income vs Expense Doughnut, Daily Trend Line, Category Breakdown Bar, 6-Month Comparison) and key statistical summary chips.
- **Budgets (`/budgets`)**: Monthly category spending limits with live progress bar visual indicators (Safe / Warning / Over Budget) and custom month/year selectors.
- **Accounts (`/accounts`)**: Real-time balance calculations per payment method (Cash, Bank Account, UPI, Credit Card, etc.) with click-to-filter transaction view, add, edit, and delete options.
- **Categories (`/categories`)**: Detailed spending/earning breakdown per category with relative progress indicators and full category management (add, edit, delete all default & custom categories).
- **Authentication (`/login`, `/register`)**: Form-based authentication with `localStorage` user session management and confirmation prompts prior to logging out.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3
- **Language:** Java 17+
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** MySQL
- **View Engine:** JSP (`tomcat-embed-jasper` & `jakarta.servlet.jsp.jstl`)
- **Build Tool:** Maven

### Frontend
- **Templating:** JSP Server Pages (`/WEB-INF/views/`)
- **Styling:** Custom CSS Design System (`finflow.css`) — Dark Glassmorphism Theme
- **Scripting:** Modular ES6 JavaScript
- **Visualizations:** Chart.js 4 (CDN)
- **Typography:** Plus Jakarta Sans (Google Fonts)

---

## 📁 Project Structure

```
FinFlow/
├── src/main/
│   ├── java/com/example/Expense/Tracker/
│   │   ├── controller/
│   │   │   ├── PageController.java        # Serves JSP pages (/dashboard, /records, etc.)
│   │   │   ├── UserController.java        # Auth endpoints (/ExpTrack/login, /register)
│   │   │   ├── TransactionController.java # Transaction REST CRUD & Trash management
│   │   │   └── BudgetController.java      # Budget REST CRUD & Monthly filtering
│   │   ├── model/
│   │   │   ├── User.java                  # User Entity
│   │   │   ├── Transaction.java           # Transaction Entity (with soft-delete flag)
│   │   │   └── Budget.java                # Monthly Budget Entity (category, month, year, amount)
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── TransactionRepository.java
│   │   │   └── BudgetRepository.java
│   │   └── service/
│   │       ├── UserService / Impl
│   │       ├── TransactionService / Impl
│   │       └── BudgetService / Impl       # Upsert budget logic
│   ├── resources/
│   │   ├── application.properties         # Database connection & JSP view resolver
│   │   └── static/
│   │       ├── css/finflow.css            # Global CSS design system
│   │       └── js/
│   │           ├── session.js             # Shared auth guard, storage management, toasts
│   │           ├── dashboard.js           # Dashboard KPI & recent lists
│   │           ├── records.js             # Records filtering & edit modal
│   │           ├── analysis.js            # Chart.js renderers & summary stats
│   │           ├── budgets.js             # Budget progress calculation & edit limits
│   │           ├── accounts.js            # Account card balance calculator & edits
│   │           └── categories.js          # Category statistics & management
│   └── webapp/WEB-INF/views/
│       ├── includes/nav.jsp               # Shared sidebar navigation template
│       ├── login.jsp / register.jsp       # Auth pages
│       ├── dashboard.jsp / records.jsp    # Core feature pages
│       ├── analysis.jsp / budgets.jsp
│       └── accounts.jsp / categories.jsp
├── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK 17** or higher
- **Maven 3.8+**
- **MySQL 8.0+**

---

### 1. Database Setup
Create a MySQL database named `expense_tracker`:
```sql
CREATE DATABASE expense_tracker;
```

---

### 2. Application Configuration
Update `src/main/resources/application.properties` with your local MySQL credentials:

```properties
spring.application.name=FinFlow

# Datasource configuration
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Jackson Configuration
spring.jackson.time-zone=Asia/Kolkata

# JSP View Resolver
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

---

### 3. Build & Run
Compile the application and launch the Spring Boot server:

```bash
# Compile project
mvn clean compile

# Run Spring Boot app
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

---

### 4. Access the Application
Open your web browser and navigate to:
```
http://localhost:8080/login
```
Register a new user account to log in and start using FinFlow!

---

## 📡 REST API Summary

### Authentication (`/ExpTrack`)
- `POST /ExpTrack/register` — Register new user
- `POST /ExpTrack/login` — Authenticate user credentials

### Transactions (`/ExpTrack/transactions`)
- `GET /ExpTrack/transactions/{username}` — Fetch all active transactions for user
- `POST /ExpTrack/transactions/{username}` — Add new transaction
- `PUT /ExpTrack/transactions/{username}/{id}` — Update transaction details
- `DELETE /ExpTrack/transactions/{username}/{id}` — Soft-delete transaction
- `GET /ExpTrack/transactions/{username}/deleted` — View trash / deleted transactions
- `PUT /ExpTrack/transactions/{username}/{id}/restore` — Restore soft-deleted transaction
- `DELETE /ExpTrack/transactions/{username}/{id}/permanent` — Permanently purge transaction

### Budgets (`/ExpTrack/budgets`)
- `GET /ExpTrack/budgets/{username}` — Fetch all user budgets
- `GET /ExpTrack/budgets/{username}/{month}/{year}` — Fetch budgets filtered by month and year
- `POST /ExpTrack/budgets/{username}` — Upsert budget (create or update limit for category/month/year)
- `DELETE /ExpTrack/budgets/{username}/{id}` — Delete budget entry

---