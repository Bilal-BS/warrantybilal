import { Transaction, Budget } from '../types';

const STORAGE_KEY = 'finance-tracker-data';
const BUDGET_STORAGE_KEY = 'finance-tracker-budgets';
const LOAN_STORAGE_KEY = 'finance-tracker-loans';

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const transactions = loadTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const transactions = loadTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  saveTransactions(filteredTransactions);
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const transactions = loadTransactions();
  const updatedTransactions = transactions.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  saveTransactions(updatedTransactions);
};

// Budget storage functions
export const loadBudgets = (): Budget[] => {
  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    const budgets = data ? JSON.parse(data) : [];
    // Ensure categoryBudgets is always an array
    return budgets.map((budget: Budget) => ({
      ...budget,
      categoryBudgets: budget.categoryBudgets || []
    }));
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets: Budget[]): void => {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const addBudget = (budget: Omit<Budget, 'id' | 'createdAt'>): Budget => {
  const budgets = loadBudgets();
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  // Remove existing budget for the same month
  const filteredBudgets = budgets.filter(b => b.month !== budget.month);
  filteredBudgets.push(newBudget);
  saveBudgets(filteredBudgets);
  return newBudget;
};

export const deleteBudget = (id: string): void => {
  const budgets = loadBudgets();
  const filteredBudgets = budgets.filter(b => b.id !== id);
  saveBudgets(filteredBudgets);
};

export const updateBudget = (id: string, updates: Partial<Budget>): void => {
  const budgets = loadBudgets();
  const updatedBudgets = budgets.map(b => 
    b.id === id ? { ...b, ...updates } : b
  );
  saveBudgets(updatedBudgets);
};

// Loan storage functions
export const loadLoans = (): Loan[] => {
  try {
    const data = localStorage.getItem(LOAN_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading loans:', error);
    return [];
  }
};

export const saveLoans = (loans: Loan[]): void => {
  try {
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(loans));
  } catch (error) {
    console.error('Error saving loans:', error);
  }
};

export const addLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'payments'>): Loan => {
  const loans = loadLoans();
  const newLoan: Loan = {
    ...loan,
    id: Date.now().toString(),
    payments: [],
    createdAt: new Date().toISOString(),
  };
  
  loans.push(newLoan);
  saveLoans(loans);
  return newLoan;
};

export const updateLoan = (id: string, updates: Partial<Loan>): void => {
  const loans = loadLoans();
  const updatedLoans = loans.map(l => 
    l.id === id ? { ...l, ...updates } : l
  );
  saveLoans(updatedLoans);
};

export const deleteLoan = (id: string): void => {
  const loans = loadLoans();
  const filteredLoans = loans.filter(l => l.id !== id);
  saveLoans(filteredLoans);
};

export const addLoanPayment = (loanId: string, payment: Omit<LoanPayment, 'id'>): void => {
  const loans = loadLoans();
  const updatedLoans = loans.map(loan => {
    if (loan.id === loanId) {
      const newPayment: LoanPayment = {
        ...payment,
        id: Date.now().toString()
      };
      return {
        ...loan,
        payments: [...loan.payments, newPayment]
      };
    }
    return loan;
  });
  saveLoans(updatedLoans);
};