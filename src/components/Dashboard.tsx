import React from 'react';
import { Transaction, FinancialSummary, MonthlySummary } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface DashboardProps {
  summary: FinancialSummary;
  monthlySummaries: MonthlySummary[];
  recentTransactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ summary, monthlySummaries = [], recentTransactions = [] }) => {
  const currentMonth = monthlySummaries[monthlySummaries.length - 1];
  const previousMonth = monthlySummaries[monthlySummaries.length - 2];
  
  const monthlyTrend = currentMonth && previousMonth 
    ? ((currentMonth.balance - previousMonth.balance) / Math.abs(previousMonth.balance || 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Salary</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                <span className="hidden md:inline">{formatCurrency(summary.totalSalary)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(summary.totalSalary)}</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                <span className="hidden md:inline">{formatCurrency(summary.totalIncome)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(summary.totalIncome)}</span>
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">
                <span className="hidden md:inline">{formatCurrency(summary.totalExpenses)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(summary.totalExpenses)}</span>
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                <span className="hidden md:inline">{formatCurrency(summary.totalSavings)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(summary.totalSavings)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 hidden md:block">
                {summary.savingsRate.toFixed(1)}% savings rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <PiggyBank className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-xl md:text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="hidden md:inline">{formatCurrency(summary.balance)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(summary.balance)}</span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Trend</p>
              <p className={`text-xl md:text-2xl font-bold ${monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyTrend.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Chart */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Monthly Summary</h3>
        <div className="space-y-4">
          {monthlySummaries.slice(-6).map((month, index) => (
            <div key={month.month} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-base font-medium text-gray-700">
                  {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex space-x-3 md:space-x-6 text-sm">
                <span className="text-green-600 font-medium">
                  <span className="hidden md:inline">+{formatCurrency(month.income)}</span>
                  <span className="md:hidden">+{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(month.income)}</span>
                </span>
                <span className="text-red-600 font-medium">
                  <span className="hidden md:inline">-{formatCurrency(month.expenses)}</span>
                  <span className="md:hidden">-{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(month.expenses)}</span>
                </span>
                <span className={`font-bold ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="hidden md:inline">{formatCurrency(month.balance)}</span>
                  <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(month.balance)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors space-y-2 md:space-y-0">
              <div>
                <p className="text-base font-medium text-gray-800">{transaction.description}</p>
                <p className="text-sm text-gray-600">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-base font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} self-end md:self-auto`}>
                <span className="hidden md:inline">{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</span>
                <span className="md:hidden">{transaction.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(transaction.amount)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;