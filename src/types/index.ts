export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  createdAt: string;
  receiptImage?: string; // Base64 encoded image data
  receiptFileName?: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  transactions: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyAverage: number;
  categorySummaries: CategorySummary[];
  totalSalary: number;
  totalSavings: number;
  savingsRate: number;
}

export interface Budget {
  id: string;
  month: string;
  totalBudget: number;
  categoryBudgets: CategoryBudget[];
  createdAt: string;
}

export interface CategoryBudget {
  category: string;
  budgetAmount: number;
}

export interface BudgetStatus {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
  categoryStatuses: CategoryBudgetStatus[];
}

export interface CategoryBudgetStatus {
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}
export interface Loan {
  id: string;
  loanType: 'given' | 'borrowed';
  borrowerName: string;
  amount: number;
  interestRate: number;
  loanDate: string;
  dueDate: string;
  description: string;
  status: 'active' | 'paid' | 'overdue';
  payments: LoanPayment[];
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  amount: number;
  paymentDate: string;
  description?: string;
}

export interface LoanSummary {
  // Given loans (money you lent)
  totalLoansGiven: number;
  totalOutstandingGiven: number;
  totalReceivedBack: number;
  totalInterestEarned: number;
  activeGivenLoans: number;
  overdueGivenLoans: number;
  
  // Borrowed loans (money you owe)
  totalLoansBorrowed: number;
  totalOutstandingBorrowed: number;
  totalPaidBack: number;
  totalInterestPaid: number;
  activeBorrowedLoans: number;
  overdueBorrowedLoans: number;
  
  // Net position
  netLoanPosition: number; // positive means you're owed more than you owe
}