# FinFlow - Full-Stack Personal Finance & Expense Tracker

[![Java](https://img.shields.io/badge/Language-Java-orange)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Framework-Spring%20Boot-brightgreen)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML/CSS/JS-yellow)](#)

A **full-stack personal finance and expense tracker application** built with **Spring Boot**, **MySQL**, and **JavaScript** (Vanilla CSS & HTML).  
Users can register, log in, add transactions (income and expenses), and view dynamic reports, summaries, and breakdowns for balances.

---

## Key Features

### 👤 User Authentication
- Register and login securely.
- Client-side and server-side validation for credentials.
- Handles error notifications gracefully via interactive toast alerts (e.g., username/email already exists, wrong password).

### ⚙️ Backend (Spring Boot)
- RESTful APIs for user registration, login, and transaction management under `/ExpTrack`.
- Structured layered architecture: Controller, Service (Interface & Implementation), Repository, and Entity layers.
- Centralized error handling via `GlobalExceptionHandler` to translate validation and persistence exceptions into unified JSON responses.
- Database persistence via **Spring Data JPA** targeting a MySQL database.

### 🎨 Frontend (HTML / CSS / JS)
- Modern and responsive dashboard styling using a premium dark-themed color palette, smooth animations, card layouts, and responsive grids.
- Real-time calculations for **Total Balance**, **Income**, and **Expenses**.
- Visual breakdowns using dynamic **Chart.js** charts.
- Search and filter controls (All, Income, Expenses) to scan through transaction logs effortlessly.
- Input validation (e.g., restricted numeric entries for transaction amounts).

---

## Tech Stack

- **Backend:** Java (JDK 17/21+), Spring Boot, Spring Data JPA, MySQL Connector  
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js CDN, Lucide Icons CDN  
- **Database:** MySQL  
- **Build Tool:** Maven  

---

## Local Setup & Installation

### 1. Clone the Repository
Clone the repository from GitHub and navigate into the project directory:
```bash
git clone https://github.com/anshthummar9/FinFlow.git
cd FinFlow
```

### 2. Database Configuration
Make sure you have MySQL server running locally. 

1. Connect to your MySQL client (e.g., Command Line or MySQL Workbench) and create the database:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
2. Open [application.properties](src/main/resources/application.properties) and update the credentials to match your local setup:
   ```properties
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

### 3. Run the Backend
You can build and run the Spring Boot application using Maven:

- **Build/Compile:**
  ```bash
  mvn clean compile
  ```
- **Run the Application:**
  ```bash
  mvn spring-boot:run
  ```
The backend will start and listen on `http://localhost:8080` by default.

### 4. Open the Frontend
Since the frontend comprises static HTML pages, no Node server is required:
1. Open the [FinFlow-Frontend](FinFlow-Frontend) folder.
2. Double-click [login.html](FinFlow-Frontend/login.html) to open it in your browser (or use a VS Code extension like **Live Server** to run it).