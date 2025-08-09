import React, { useState } from 'react';
import { Plus, DollarSign, Scan, X } from 'lucide-react';
import { Transaction } from '../types';
import ReceiptScanner from './ReceiptScanner';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other Income'
];

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

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    receiptImage: undefined as string | undefined,
    receiptFileName: undefined as string | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) return;

    onAddTransaction({
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      receiptImage: formData.receiptImage,
      receiptFileName: formData.receiptFileName
    });

    // Reset form
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      receiptImage: undefined,
      receiptFileName: undefined
    });
  };

  const handleScannerData = (extractedData: {
    amount: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    receiptImage?: string;
    receiptFileName?: string;
  }) => {
    setFormData({
      ...formData,
      amount: extractedData.amount,
      description: extractedData.description,
      category: extractedData.category,
      type: extractedData.type,
      receiptImage: extractedData.receiptImage,
      receiptFileName: extractedData.receiptFileName
    });
    setShowScanner(false);
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-full">
          <Plus className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Add Transaction</h2>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div>
            <h3 className="font-medium text-blue-900">Quick Add</h3>
            <p className="text-sm text-blue-700">Scan a receipt to auto-fill transaction details</p>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Income</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Expense</span>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-10 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            placeholder="Enter description..."
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            required
          />
        </div>

        {/* Receipt Preview */}
        {formData.receiptImage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attached Receipt</label>
            <div className="relative inline-block">
              <img
                src={formData.receiptImage}
                alt="Receipt preview"
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, receiptImage: undefined, receiptFileName: undefined })}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formData.receiptFileName}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 md:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 text-base"
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </form>
    </div>

    {showScanner && (
      <ReceiptScanner
        onExtractedData={handleScannerData}
        onClose={() => setShowScanner(false)}
      />
    )}
    </>
  );
};

export default TransactionForm;