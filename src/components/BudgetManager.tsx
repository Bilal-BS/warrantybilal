import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, TrendingUp, Edit, Save, X } from 'lucide-react';
import { Budget, BudgetStatus, Transaction } from '../types';
import { formatCurrency } from '../utils/calculations';

interface BudgetManagerProps {
  budgets: Budget[];
  budgetStatuses: BudgetStatus[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other Expenses'
];

const BudgetManager: React.FC<BudgetManagerProps> = ({ 
  budgets, 
  budgetStatuses, 
  onAddBudget, 
  onDeleteBudget,
  onUpdateBudget
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().substring(0, 7),
    totalBudget: '',
    categoryBudgets: EXPENSE_CATEGORIES.map(category => ({
      category,
      budgetAmount: 0
    }))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.totalBudget) return;

    onAddBudget({
      month: formData.month,
      totalBudget: parseFloat(formData.totalBudget),
      categoryBudgets: formData.categoryBudgets.filter(cb => cb.budgetAmount > 0)
    });

    setFormData({
      month: new Date().toISOString().substring(0, 7),
      totalBudget: '',
      categoryBudgets: EXPENSE_CATEGORIES.map(category => ({
        category,
        budgetAmount: 0
      }))
    });
    setShowForm(false);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget.id);
    setEditFormData(budget);
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    onUpdateBudget(editFormData.id, {
      totalBudget: editFormData.totalBudget,
      categoryBudgets: editFormData.categoryBudgets
    });

    setEditingBudget(null);
    setEditFormData(null);
  };

  const cancelEdit = () => {
    setEditingBudget(null);
    setEditFormData(null);
  };

  const updateCategoryBudget = (category: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      categoryBudgets: prev.categoryBudgets.map(cb =>
        cb.category === category ? { ...cb, budgetAmount: amount } : cb
      )
    }));
  };

  const updateEditCategoryBudget = (category: string, amount: number) => {
    if (!editFormData) return;
    
    setEditFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        categoryBudgets: prev.categoryBudgets.map(cb =>
          cb.category === category ? { ...cb, budgetAmount: amount } : cb
        )
      };
    });
  };

  const currentMonthStatus = budgetStatuses.find(bs => 
    bs.month === new Date().toISOString().substring(0, 7)
  );

  return (
    <div className="space-y-6">
      {/* Budget Alert */}
      {currentMonthStatus && currentMonthStatus.isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Budget Alert!</h3>
              <p className="text-red-700">
                You've exceeded your monthly budget by {formatCurrency(Math.abs(currentMonthStatus.remainingBudget))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Month Budget Status */}
      {currentMonthStatus && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Month Budget</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentMonthStatus.isOverBudget 
                ? 'bg-red-100 text-red-800' 
                : currentMonthStatus.percentageUsed > 80
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {currentMonthStatus.percentageUsed.toFixed(1)}% Used
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Budget</span>
              <span className="font-semibold">{formatCurrency(currentMonthStatus.totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Spent</span>
              <span className="font-semibold text-red-600">{formatCurrency(currentMonthStatus.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining</span>
              <span className={`font-semibold ${currentMonthStatus.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentMonthStatus.remainingBudget)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentMonthStatus.isOverBudget 
                    ? 'bg-red-500' 
                    : currentMonthStatus.percentageUsed > 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(currentMonthStatus.percentageUsed, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Form */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Budget Management</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Set Budget</span>
            <span className="sm:hidden">Budget</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category Budgets (Optional)</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 w-32 md:w-36 flex-shrink-0">{category}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.categoryBudgets.find(cb => cb.category === category)?.budgetAmount || ''}
                      onChange={(e) => updateCategoryBudget(category, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 md:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
              >
                Save Budget
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 md:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Budget History */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget History</h3>
        <div className="space-y-3">
          {budgetStatuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No budgets set yet</p>
            </div>
          ) : (
            budgetStatuses
              .sort((a, b) => b.month.localeCompare(a.month))
              .map((status) => (
                <div key={status.month} className="p-4 border border-gray-200 rounded-lg">
                  {editingBudget === budgets.find(b => b.month === status.month)?.id ? (
                    <form onSubmit={handleUpdateBudget} className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">
                          Edit Budget - {new Date(status.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData?.totalBudget || ''}
                          onChange={(e) => setEditFormData(prev => prev ? { ...prev, totalBudget: parseFloat(e.target.value) || 0 } : null)}
                          className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Category Budgets</label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {EXPENSE_CATEGORIES.map(category => {
                            const categoryBudget = editFormData?.categoryBudgets.find(cb => cb.category === category);
                            return (
                              <div key={category} className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600 w-32 md:w-36 flex-shrink-0">{category}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={categoryBudget?.budgetAmount || ''}
                                  onChange={(e) => updateEditCategoryBudget(category, parseFloat(e.target.value) || 0)}
                                  className="flex-1 px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                                  placeholder="0.00"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      status.isOverBudget ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {status.isOverBudget ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(status.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(status.totalSpent)} of {formatCurrency(status.totalBudget)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right md:text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => {
                              const budget = budgets.find(b => b.month === status.month);
                              if (budget) handleEditBudget(budget);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                    <p className={`font-bold ${status.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {status.percentageUsed.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {status.isOverBudget ? 'Over' : 'Under'} Budget
                    </p>
                  </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;