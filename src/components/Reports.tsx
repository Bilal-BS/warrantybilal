import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Wallet, PiggyBank } from 'lucide-react';
import { FinancialSummary, MonthlySummary } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ReportsProps {
  summary: FinancialSummary;
  monthlySummaries: MonthlySummary[];
}

const Reports: React.FC<ReportsProps> = ({ summary, monthlySummaries }) => {
  const topExpenseCategories = summary.categorySummaries
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const totalTransactions = summary.categorySummaries.reduce((sum, cat) => sum + cat.transactions, 0);

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Financial Reports</h2>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Salary Analysis</h3>
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Salary</span>
              <span className="font-semibold text-blue-600">{formatCurrency(summary.totalSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(summary.totalSalary / Math.max(monthlySummaries.length, 1))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">% of Total Income</span>
              <span className="font-semibold text-blue-600">
                {summary.totalIncome > 0 ? ((summary.totalSalary / summary.totalIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Income Analysis</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary.totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(summary.totalIncome / Math.max(monthlySummaries.length, 1))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Expense Analysis</h3>
            <TrendingUp className="w-6 h-6 text-red-600 transform rotate-180" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-semibold text-red-600">{formatCurrency(summary.totalExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(summary.totalExpenses / Math.max(monthlySummaries.length, 1))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Savings Analysis</h3>
            <PiggyBank className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Savings</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary.totalSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Savings Rate</span>
              <span className="font-semibold text-green-600">{summary.savingsRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(summary.totalSavings / Math.max(monthlySummaries.length, 1))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Transaction Stats</h3>
            <PieChart className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-blue-600">{totalTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold text-blue-600">{summary.categorySummaries.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories by Amount</h3>
        <div className="space-y-4">
          {topExpenseCategories.map((category, index) => {
            const percentage = (category.total / Math.max(summary.totalExpenses, 1)) * 100;
            return (
              <div key={category.category} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{category.category}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(category.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{category.transactions} transactions</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trend</h3>
        <div className="space-y-4">
          {monthlySummaries.slice(-6).map((month, index) => {
            const maxAmount = Math.max(...monthlySummaries.map(m => Math.max(m.income, m.expenses)));
            const incomePercent = (month.income / maxAmount) * 100;
            const expensePercent = (month.expenses / maxAmount) * 100;
            
            return (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className={`font-bold ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.balance)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 text-xs text-gray-600">Income</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${incomePercent}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-xs text-right text-green-600">{formatCurrency(month.income)}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 text-xs text-gray-600">Expenses</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${expensePercent}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-xs text-right text-red-600">{formatCurrency(month.expenses)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;