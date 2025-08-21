#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";

const expenseFilePath = path.join(__dirname, "expense.json");

// Function to read expenses from the JSON file
function readExpenses() {
  if (fs.existsSync(expenseFilePath)) {
    const data = fs.readFileSync(expenseFilePath, "utf8");
    return JSON.parse(data);
  }
  return [];
}

// Function to write expenses to the JSON file
function writeExpenses(expenses) {
  expenses.sort((a, b) => a.id - b.id);
  fs.writeFileSync(expenseFilePath, JSON.stringify(expenses, null, 2), "utf8");
}

// Function to get the next unique ID
function getNextId(expenses) {
  const ids = expenses.map((expense) => expense.id);
  ids.sort((a, b) => a - b);
  let nextId = 1;
  for (const id of ids) {
    if (id !== nextId) break;
    nextId++;
  }
  return nextId;
}

// Function to add a new expense
function addExpense(description, amount) {
  const expenses = readExpenses();
  const newExpense = {
    id: getNextId(expenses),
    description: description,
    amount: amount,
    createdAt: new Date(),
    updatedAt: null,
  };
  expenses.push(newExpense);
  writeExpenses(expenses);
  console.log(chalk.green(`Expense added successfully (ID: ${newExpense.id})`));
}

// Function to update an expense
function updateExpense(id, description, amount) {
  const expenses = readExpenses();
  const expense = expenses.find((expense) => expense.id === parseInt(id));

  if (!expense) {
    console.log(chalk.red(`Expense with ID ${id} not found.`));
    return;
  }

  if (description) expense.description = description;
  if (amount) expense.amount = amount;
  writeExpenses(expenses);
  console.log(chalk.green(`Expense ID ${id} updated successfully!`));
}

// Function to delete an expense
function deleteExpense(id) {
  const expenses = readExpenses();
  const newExpenses = expenses.filter((expense) => expense.id !== parseInt(id));

  if (newExpenses.length === expenses.length) {
    console.log(chalk.red(`Expense with ID ${id} not found.`));
    return;
  }

  writeExpenses(newExpenses);
  console.log(chalk.green(`Expense ID ${id} deleted successfully!`));
}

// Function to list expenses
function listExpenses() {
  const tasks = readExpenses();

  if (tasks.length === 0) {
    console.log(chalk.yellow(`No expense found.`));
    return;
  }

  const formattedExpenses = expenses.map((exp) => ({
    ID: exp.id,
    Date: new Date(exp.createdAt).toISOString().split("T")[0],
    Description: exp.description,
    Amount: exp.amount,
  }));

  console.table(formattedExpenses);
}
