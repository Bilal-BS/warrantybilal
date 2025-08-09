import React, { useState } from 'react';
import { Search, Filter, Trash2, Calendar, X, Image, Eye } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateFilter, setShowCustomDateFilter] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const getDateFilteredTransactions = (transactions: Transaction[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= monthAgo;
        });
      case 'custom':
        if (!customStartDate || !customEndDate) return transactions;
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      default:
        return transactions;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const dateFilteredTransactions = getDateFilteredTransactions(filteredTransactions);

  const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDateFilter(false);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Transaction History</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{dateFilteredTransactions.length} transactions</span>
          {(searchTerm || filterType !== 'all' || filterCategory || dateFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          />
        </div>

        {/* Type and Category Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base min-w-0 flex-1 sm:flex-none"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base min-w-0 flex-1 sm:flex-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => {
                const value = e.target.value as typeof dateFilter;
                setDateFilter(value);
                setShowCustomDateFilter(value === 'custom');
              }}
              className="px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base min-w-0 flex-1 sm:flex-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomDateFilter && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-[60vh] md:max-h-96 overflow-y-auto">
        {dateFilteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions found</p>
          </div>
        ) : (
          dateFilteredTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors space-y-3 md:space-y-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-800 truncate">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="hidden md:inline">{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</span>
                    <span className="md:hidden">{transaction.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(transaction.amount)}</span>
                  </span>
                  
                  {transaction.receiptImage && (
                    <button
                      onClick={() => setViewingReceipt(transaction.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Receipt"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-inset">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Receipt Image</h3>
                </div>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const transaction = transactions.find(t => t.id === viewingReceipt);
                return transaction?.receiptImage ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        src={transaction.receiptImage}
                        alt="Receipt"
                        className="max-w-full max-h-[50vh] md:max-h-96 object-contain mx-auto rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Transaction Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Description:</span> {transaction.description}</p>
                        <p><span className="text-gray-600">Amount:</span> {formatCurrency(transaction.amount)}</p>
                        <p><span className="text-gray-600">Category:</span> {transaction.category}</p>
                        <p><span className="text-gray-600">Date:</span> {formatDate(transaction.date)}</p>
                        {transaction.receiptFileName && (
                          <p><span className="text-gray-600">File:</span> {transaction.receiptFileName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No receipt image available</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;