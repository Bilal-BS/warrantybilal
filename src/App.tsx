import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, CreditCard, FileText, Calculator } from 'lucide-react';
import { Transaction, Loan, Budget } from './types';
import { loadTransactions, saveTransactions, loadLoans, saveLoans, loadBudgets, saveBudgets } from './utils/storage';
import { calculateFinancialSummary, getMonthlySummaries, calculateLoanSummary, calculateBudgetStatuses, updateLoanStatus } from './utils/calculations';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetManager from './components/BudgetManager';
import LoanManager from './components/LoanManager';
import Reports from './components/Reports';

type ActiveTab = 'dashboard' | 'transactions' | 'add' | 'budget' | 'loans' | 'reports';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  useEffect(() => {
    const savedTransactions = loadTransactions();
    const savedLoans = loadLoans().map(updateLoanStatus);
    const savedBudgets = loadBudgets();
    setTransactions(savedTransactions);
    setLoans(savedLoans);
    setBudgets(savedBudgets);
  }, []);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  const handleEditTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id 
        ? { ...updatedTransaction, id, createdAt: t.createdAt }
        : t
    );
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  const handleAddLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'payments'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      payments: []
    };
    
    const updatedLoans = [updateLoanStatus(newLoan), ...loans];
    setLoans(updatedLoans);
    saveLoans(updatedLoans);
  };

  const handleUpdateLoan = (id: string, updates: Partial<Loan>) => {
    const updatedLoans = loans.map(loan => 
      loan.id === id 
        ? updateLoanStatus({ ...loan, ...updates })
        : loan
    );
    setLoans(updatedLoans);
    saveLoans(updatedLoans);
  };

  const handleDeleteLoan = (id: string) => {
    const updatedLoans = loans.filter(loan => loan.id !== id);
    setLoans(updatedLoans);
    saveLoans(updatedLoans);
  };

  const handleAddLoanPayment = (loanId: string, payment: Omit<import('./types').LoanPayment, 'id'>) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString()
    };
    
    const updatedLoans = loans.map(loan => 
      loan.id === loanId 
        ? updateLoanStatus({ ...loan, payments: [...loan.payments, newPayment] })
        : loan
    );
    setLoans(updatedLoans);
    saveLoans(updatedLoans);
  };

  const handleAddBudget = (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedBudgets = [newBudget, ...budgets];
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
  };

  const handleUpdateBudget = (id: string, updates: Partial<Budget>) => {
    const updatedBudgets = budgets.map(budget => 
      budget.id === id 
        ? { ...budget, ...updates }
        : budget
    );
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
  };

  const handleDeleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== id);
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets);
  };
  const summary = calculateFinancialSummary(transactions);
  const monthlySummaries = getMonthlySummaries(transactions);
  const loanSummary = calculateLoanSummary(loans);
  const budgetStatuses = calculateBudgetStatuses(budgets || [], transactions || []);
  const recentTransactions = transactions.slice(0, 5);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', shortLabel: 'Home', icon: PieChart },
    { id: 'transactions' as ActiveTab, label: 'Transactions', shortLabel: 'List', icon: FileText },
    { id: 'add' as ActiveTab, label: 'Add Transaction', shortLabel: 'Add', icon: DollarSign },
    { id: 'budget' as ActiveTab, label: 'Budget', shortLabel: 'Budget', icon: TrendingUp },
    { id: 'loans' as ActiveTab, label: 'Loans', shortLabel: 'Loans', icon: CreditCard },
    { id: 'reports' as ActiveTab, label: 'Reports', shortLabel: 'Reports', icon: Calculator },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions}
            summary={summary}
            monthlySummaries={monthlySummaries}
            recentTransactions={recentTransactions}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
          />
        );
      case 'add':
        return <TransactionForm onAddTransaction={handleAddTransaction} />;
      case 'budget':
        return (
          <BudgetManager 
            budgets={budgets}
            budgetStatuses={budgetStatuses}
            transactions={transactions}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'loans':
        return (
          <LoanManager 
            loans={loans}
            loanSummary={loanSummary}
            onAddLoan={handleAddLoan}
            onUpdateLoan={handleUpdateLoan}
            onDeleteLoan={handleDeleteLoan}
            onAddPayment={handleAddLoanPayment}
          />
        );
      case 'reports':
        return <Reports summary={summary} monthlySummaries={monthlySummaries} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Manage your finances with ease</p>
              </div>
            </div>
            
            {/* Quick Stats - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ${summary.totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ${summary.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ${summary.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;