#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import Table from "cli-table3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expenseFilePath = path.join(__dirname, "expenses.json");

const program = new Command();

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
  if (
    !description ||
    typeof amount !== "number" ||
    isNaN(amount) ||
    amount < 0
  ) {
    console.log(
      chalk.red(
        "Please provide a valid description and a valid number as amount."
      )
    );
    return;
  }

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
function updateExpense(id, description = null, amount = null) {
  const expenses = readExpenses();
  const expense = expenses.find((expense) => expense.id === parseInt(id));

  if (!expense) {
    console.log(chalk.red(`Expense with ID ${id} not found.`));
    return;
  }

  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    console.log(chalk.red("Please provide a valid number as amount."));
    return;
  }

  if (description) expense.description = description;
  if (amount) expense.amount = amount;
  expense.updatedAt = new Date();
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
  console.log(chalk.green("Expense deleted successfully!"));
}

// Function to list expenses
function listExpenses() {
  const expenses = readExpenses();

  if (expenses.length === 0) {
    console.log(chalk.yellow(`No expense found.`));
    return;
  }

  const table = new Table({
    head: ["ID", "Date", "Description", "Amount"],
    colWidths: [5, 12, 20, 10],
    wordWrap: true,
  });

  expenses.forEach((exp) => {
    table.push([
      exp.id,
      new Date(exp.createdAt).toISOString().split("T")[0],
      exp.description,
      `$${exp.amount}`,
    ]);
  });

  console.log(table.toString());
}

// Function to show summary (filtered by months)
function showSummary(month = null) {
  const expenses = readExpenses();
  let filteredExpenses = expenses;

  if (month !== null) {
    filteredExpenses = expenses.filter((exp) => {
      const date = new Date(exp.createdAt);
      return date.getMonth() + 1 === month;
    });
  }

  const total = filteredExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  if (month !== null) {
    const monthName = new Date(2000, month - 1).toLocaleString("default", {
      month: "long",
    });
    console.log(chalk.cyan(`Total expenses for ${monthName}: $${total}`));
  } else {
    console.log(chalk.cyan(`Total expenses: $${total}`));
  }
}

// Add Expense
program
  .command("add")
  .description("Add a new expense")
  .requiredOption("-d, --description <description>", "Expense description")
  .requiredOption("-a, --amount <amount>", "Expense amount")
  .action((options) =>
    addExpense(options.description, parseFloat(options.amount))
  );

// Update Expense
program
  .command("update")
  .description("Update an expense by ID")
  .requiredOption("-i, --id <id>", "Expense ID to update")
  .requiredOption("-d, --description <description>", "Expense description")
  .requiredOption("-a, --amount <amount>", "Expense amount")
  .action((options) =>
    updateExpense(
      parseInt(options.id),
      options.description,
      parseFloat(options.amount)
    )
  );

// Delete Expense
program
  .command("delete")
  .description("Delete an expense by ID")
  .requiredOption("-i, --id <id>", "Expense ID to delete")
  .action((options) => deleteExpense(parseInt(options.id)));

// List Expenses
program
  .command("list")
  .description("List all expenses")
  .action(() => listExpenses());

// Summary
program
  .command("summary")
  .description("Show total expenses")
  .option("-m, --month <month>", "Filter by month number (1-12)")
  .action((options) => {
    if (
      options.month &&
      (options.month < 1 ||
        options.month > 12 ||
        typeof(parseInt(options.month)) !== "number" ||
        isNaN(parseInt(options.month)))
    ) {
      console.log(chalk.red("Invalid month. Use a number from 1 to 12."));
      return;
    }
    showSummary(options.month ? parseInt(options.month) : null);
  });

program
  .name("expense-tracker")
  .description("A simple CLI tool to track expenses")
  .version("1.0.0")
  .addHelpText("before");

program.addHelpText(
  "after",
  `
Examples:

  $ expense-tracker add -d "Coffee" -a 4.5
  $ expense-tracker list
  $ expense-tracker delete -i 2
  $ expense-tracker summary
  $ expense-tracker summary -m 8

Use "--help" with any command to see detailed usage.
`
);

program.on("command:*", () => {
  console.error(chalk.red(`\nInvalid command: ${program.args.join(" ")}`));
  console.log("See help below:\n");
  program.help();
});

program.parse(process.argv);
