import { Transaction, CategorySummary, MonthlySummary, FinancialSummary, Budget, BudgetStatus, CategoryBudgetStatus } from '../types';
import { Loan, LoanSummary } from '../types';

export const calculateFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSalary = transactions
    .filter(t => t.type === 'income' && t.category === 'Salary')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const totalSavings = balance > 0 ? balance : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Calculate monthly average
  const months = new Set(transactions.map(t => t.date.substring(0, 7)));
  const monthlyAverage = months.size > 0 ? balance / months.size : 0;

  // Calculate category summaries
  const categoryMap = new Map<string, { total: number; transactions: number }>();
  
  transactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) || { total: 0, transactions: 0 };
    categoryMap.set(transaction.category, {
      total: existing.total + transaction.amount,
      transactions: existing.transactions + 1
    });
  });

  const categorySummaries: CategorySummary[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total: data.total,
      transactions: data.transactions
    })
  );

  return {
    totalIncome,
    totalExpenses,
    balance,
    monthlyAverage,
    categorySummaries,
    totalSalary,
    totalSavings,
    savingsRate
  };
};

export const getMonthlySummaries = (transactions: Transaction[]): MonthlySummary[] => {
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach(transaction => {
    const month = transaction.date.substring(0, 7);
    const existing = monthlyMap.get(month) || { income: 0, expenses: 0 };
    
    if (transaction.type === 'income') {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }
    
    monthlyMap.set(month, existing);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getRecentTransactions = (transactions: Transaction[], limit: number = 5): Transaction[] => {
  return transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateBudgetStatuses = (transactions: Transaction[], budgets: Budget[]): BudgetStatus[] => {
  if (!budgets || !Array.isArray(budgets)) {
    return [];
  }
  if (!transactions || !Array.isArray(transactions)) {
    transactions = [];
  }
  return budgets.map(budget => calculateSingleBudgetStatus(transactions, budget));
};

const calculateSingleBudgetStatus = (transactions: Transaction[], budget: Budget): BudgetStatus => {
  const monthTransactions = transactions.filter(t => 
    t.type === 'expense' && t.date.substring(0, 7) === budget.month
  );

  const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = budget.totalBudget - totalSpent;
  const percentageUsed = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > budget.totalBudget;

  // Calculate category budget statuses
  const categoryStatuses: CategoryBudgetStatus[] = (budget.categoryBudgets || []).map(categoryBudget => {
    const categoryTransactions = monthTransactions.filter(t => t.category === categoryBudget.category);
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = categoryBudget.budgetAmount - spent;
    const percentageUsed = categoryBudget.budgetAmount > 0 ? (spent / categoryBudget.budgetAmount) * 100 : 0;
    const isOverBudget = spent > categoryBudget.budgetAmount;

    return {
      category: categoryBudget.category,
      budgetAmount: categoryBudget.budgetAmount,
      spent,
      remaining,
      percentageUsed,
      isOverBudget
    };
  });

  return {
    month: budget.month,
    totalBudget: budget.totalBudget,
    totalSpent,
    remainingBudget,
    percentageUsed,
    isOverBudget,
    categoryStatuses
  };
};

export const filterTransactionsByDateRange = (
  transactions: Transaction[], 
  startDate: string, 
  endDate: string
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactionDate >= start && transactionDate <= end;
  });
};

export const calculateLoanSummary = (loans: Loan[]): LoanSummary => {
  const givenLoans = loans.filter(loan => loan.loanType === 'given');
  const borrowedLoans = loans.filter(loan => loan.loanType === 'borrowed');
  
  // Calculate given loans summary
  const totalLoansGiven = givenLoans.reduce((sum, loan) => sum + loan.amount, 0);
  let totalReceivedBack = 0;
  let totalInterestEarned = 0;
  let activeGivenLoans = 0;
  let overdueGivenLoans = 0;
  
  const today = new Date();
  
  givenLoans.forEach(loan => {
    const paidAmount = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
    totalReceivedBack += paidAmount;
    
    // Calculate interest earned (simplified calculation)
    const principal = loan.amount;
    const rate = loan.interestRate / 100;
    const timeInYears = (today.getTime() - new Date(loan.loanDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
    const expectedInterest = principal * rate * timeInYears;
    totalInterestEarned += Math.max(0, Math.min(expectedInterest, paidAmount - principal));
    
    if (loan.status === 'active') {
      activeGivenLoans++;
      if (new Date(loan.dueDate) < today) {
        overdueGivenLoans++;
      }
    }
  });
  
  // Calculate borrowed loans summary
  const totalLoansBorrowed = borrowedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  let totalPaidBack = 0;
  let totalInterestPaid = 0;
  let activeBorrowedLoans = 0;
  let overdueBorrowedLoans = 0;
  
  borrowedLoans.forEach(loan => {
    const paidAmount = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
    totalPaidBack += paidAmount;
    
    // Calculate interest paid (simplified calculation)
    const principal = loan.amount;
    const rate = loan.interestRate / 100;
    const timeInYears = (today.getTime() - new Date(loan.loanDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
    const expectedInterest = principal * rate * timeInYears;
    totalInterestPaid += Math.max(0, Math.min(expectedInterest, paidAmount - principal));
    
    if (loan.status === 'active') {
      activeBorrowedLoans++;
      if (new Date(loan.dueDate) < today) {
        overdueBorrowedLoans++;
      }
    }
  });
  
  const totalOutstandingGiven = totalLoansGiven - totalReceivedBack;
  const totalOutstandingBorrowed = totalLoansBorrowed - totalPaidBack;
  const netLoanPosition = totalOutstandingGiven - totalOutstandingBorrowed;
  
  return {
    totalLoansGiven,
    totalOutstandingGiven,
    totalReceivedBack,
    totalInterestEarned,
    activeGivenLoans,
    overdueGivenLoans,
    totalLoansBorrowed,
    totalOutstandingBorrowed,
    totalPaidBack,
    totalInterestPaid,
    activeBorrowedLoans,
    overdueBorrowedLoans,
    netLoanPosition
  };
};

export const updateLoanStatus = (loan: Loan): Loan => {
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  let status: 'active' | 'paid' | 'overdue' = 'active';
  
  if (totalPaid >= loan.amount) {
    status = 'paid';
  } else if (dueDate < today) {
    status = 'overdue';
  }
  
  return { ...loan, status };
};