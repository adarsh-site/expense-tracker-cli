# Expense Tracker

This is a simple command-line interface (CLI) application to manage expense from the terminal.

Challenge - https://roadmap.sh/projects/expense-tracker

## Features

 - Users can add an expense with a description and amount.
 - Users can update an expense.
 - Users can delete an expense.
 - Users can view all expenses.
 - Users can view a summary of all expenses.
 - Users can view a summary of expenses for a specific month (of current year).

## Installation

Clone the repository

```bash
git clone https://github.com/adarsh-site/expense-tracker-cli.git
```

Navigate to the project Directory

```bash
cd expense-tracker-cli
```
Install dependencies

```bash
npm i
```

Link

```bash
npm link

# or

sudo npm link
```

## Usage

```bash
$ expense-tracker add --description "Lunch" --amount 20
# Expense added successfully (ID: 1)

$ expense-tracker add --description "Dinner" --amount 10
# Expense added successfully (ID: 2)

$ expense-tracker list
# ID  Date       Description  Amount
# 1   2024-08-06  Lunch        $20
# 2   2024-08-06  Dinner       $10

$ expense-tracker summary
# Total expenses: $30

$ expense-tracker delete --id 2
# Expense deleted successfully

$ expense-tracker summary
# Total expenses: $20

$ expense-tracker summary --month 8
# Total expenses for August: $20

$ expense-tracker --help
# help
```
