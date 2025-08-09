import React, { useState } from 'react';
import { HandCoins, Plus, AlertTriangle, CheckCircle, Clock, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Users, User } from 'lucide-react';
import { Loan, LoanSummary, LoanPayment } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface LoanManagerProps {
  loans: Loan[];
  loanSummary: LoanSummary;
  onAddLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'payments'>) => void;
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  onAddPayment: (loanId: string, payment: Omit<LoanPayment, 'id'>) => void;
}

const LoanManager: React.FC<LoanManagerProps> = ({
  loans,
  loanSummary,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onAddPayment
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'given' | 'borrowed' | 'all'>('all');
  const [formData, setFormData] = useState({
    loanType: 'given' as 'given' | 'borrowed',
    borrowerName: '',
    amount: '',
    interestRate: '',
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.borrowerName || !formData.amount || !formData.dueDate) return;

    onAddLoan({
      loanType: formData.loanType,
      borrowerName: formData.borrowerName,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate) || 0,
      loanDate: formData.loanDate,
      dueDate: formData.dueDate,
      description: formData.description,
      status: 'active'
    });

    setFormData({
      loanType: 'given',
      borrowerName: '',
      amount: '',
      interestRate: '',
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: ''
    });
    setShowForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent, loanId: string) => {
    e.preventDefault();
    if (!paymentData.amount) return;

    onAddPayment(loanId, {
      amount: parseFloat(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      description: paymentData.description
    });

    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowPaymentForm(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'overdue': return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'all') return true;
    return loan.loanType === activeTab;
  });

  const totalOverdueLoans = loanSummary.overdueGivenLoans + loanSummary.overdueBorrowedLoans;

  return (
    <div className="space-y-6">
      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Given Loans Summary */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loans Given</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                <span className="hidden md:inline">{formatCurrency(loanSummary.totalLoansGiven)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(loanSummary.totalLoansGiven)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Outstanding: {formatCurrency(loanSummary.totalOutstandingGiven)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Borrowed Loans Summary */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loans Borrowed</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600">
                <span className="hidden md:inline">{formatCurrency(loanSummary.totalLoansBorrowed)}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(loanSummary.totalLoansBorrowed)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Outstanding: {formatCurrency(loanSummary.totalOutstandingBorrowed)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Net Position */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Position</p>
              <p className={`text-xl md:text-2xl font-bold ${loanSummary.netLoanPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="hidden md:inline">{formatCurrency(Math.abs(loanSummary.netLoanPosition))}</span>
                <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(Math.abs(loanSummary.netLoanPosition))}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {loanSummary.netLoanPosition >= 0 ? 'Net Lender' : 'Net Borrower'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${loanSummary.netLoanPosition >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${loanSummary.netLoanPosition >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">
                {loanSummary.activeGivenLoans + loanSummary.activeBorrowedLoans}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Given: {loanSummary.activeGivenLoans} | Borrowed: {loanSummary.activeBorrowedLoans}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <HandCoins className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Interest Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Interest Earned</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Received</span>
              <span className="font-semibold text-green-600">{formatCurrency(loanSummary.totalReceivedBack)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Earned</span>
              <span className="font-semibold text-green-600">{formatCurrency(loanSummary.totalInterestEarned)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Interest Paid</h3>
            <div className="p-2 bg-red-100 rounded-full">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid Back</span>
              <span className="font-semibold text-red-600">{formatCurrency(loanSummary.totalPaidBack)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Paid</span>
              <span className="font-semibold text-red-600">{formatCurrency(loanSummary.totalInterestPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {totalOverdueLoans > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Overdue Loans Alert!</h3>
              <p className="text-red-700">
                You have {totalOverdueLoans} overdue loan{totalOverdueLoans > 1 ? 's' : ''} 
                ({loanSummary.overdueGivenLoans} given, {loanSummary.overdueBorrowedLoans} borrowed)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loan Form */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <HandCoins className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Loan Management</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Loan</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-6">
            {/* Loan Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, loanType: 'given' })}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                    formData.loanType === 'given'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Money Given</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, loanType: 'borrowed' })}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                    formData.loanType === 'borrowed'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-medium">Money Borrowed</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.loanType === 'given' ? 'Borrower Name' : 'Lender Name'}
                </label>
                <input
                  type="text"
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  placeholder={`Enter ${formData.loanType === 'given' ? 'borrower' : 'lender'} name`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                placeholder="Enter loan description or notes"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 md:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
              >
                Add Loan
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

      {/* Loan Tabs */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Loan History</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Loans ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab('given')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 ${
                activeTab === 'given'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Given ({loans.filter(l => l.loanType === 'given').length})</span>
              <span className="sm:hidden">Given</span>
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 ${
                activeTab === 'borrowed'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span className="hidden sm:inline">Borrowed ({loans.filter(l => l.loanType === 'borrowed').length})</span>
              <span className="sm:hidden">Borrowed</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HandCoins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No {activeTab === 'all' ? '' : activeTab} loans recorded yet</p>
            </div>
          ) : (
            filteredLoans
              .sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime())
              .map((loan) => {
                const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
                const remaining = loan.amount - totalPaid;
                const StatusIcon = getStatusIcon(loan.status);
                
                return (
                  <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 space-y-3 md:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(loan.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className={`p-1 rounded text-xs font-medium ${
                          loan.loanType === 'given' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {loan.loanType === 'given' ? 'GIVEN' : 'BORROWED'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{loan.borrowerName}</h4>
                          <p className="text-sm text-gray-600">{loan.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end md:self-auto">
                        <button
                          onClick={() => setShowPaymentForm(showPaymentForm === loan.id ? null : loan.id)}
                          className={`px-3 py-1 rounded-lg hover:bg-opacity-80 transition-colors text-xs md:text-sm ${
                            loan.loanType === 'given'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <span className="hidden sm:inline">{loan.loanType === 'given' ? 'Record Payment' : 'Add Payment'}</span>
                          <span className="sm:hidden">Payment</span>
                        </button>
                        <button
                          onClick={() => onDeleteLoan(loan.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Loan Amount</p>
                        <p className="font-semibold text-sm md:text-base">
                          <span className="hidden md:inline">{formatCurrency(loan.amount)}</span>
                          <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(loan.amount)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {loan.loanType === 'given' ? 'Received' : 'Paid'}
                        </p>
                        <p className="font-semibold text-green-600 text-sm md:text-base">
                          <span className="hidden md:inline">{formatCurrency(totalPaid)}</span>
                          <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalPaid)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="font-semibold text-orange-600 text-sm md:text-base">
                          <span className="hidden md:inline">{formatCurrency(remaining)}</span>
                          <span className="md:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(remaining)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="font-semibold text-sm md:text-base">{formatDate(loan.dueDate)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          loan.loanType === 'given' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((totalPaid / loan.amount) * 100, 100)}%` }}
                      ></div>
                    </div>

                    {/* Payment Form */}
                    {showPaymentForm === loan.id && (
                      <form onSubmit={(e) => handlePaymentSubmit(e, loan.id)} className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-3">
                          {loan.loanType === 'given' ? 'Record Payment Received' : 'Add Payment Made'}
                        </h5>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentData.amount}
                              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
                            <input
                              type="date"
                              value={paymentData.paymentDate}
                              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <input
                              type="text"
                              value={paymentData.description}
                              onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                              className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                              placeholder="Payment note"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            type="submit"
                            className={`px-4 py-2 md:py-3 text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm md:text-base ${
                              loan.loanType === 'given' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                          >
                            {loan.loanType === 'given' ? 'Record Payment' : 'Add Payment'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(null)}
                            className="px-4 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Payment History */}
                    {loan.payments.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-800 mb-2">Payment History</h5>
                        <div className="space-y-2">
                          {loan.payments
                            .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                            .map((payment) => (
                              <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded space-y-1 sm:space-y-0">
                                <div>
                                  <p className="text-sm font-medium">
                                    <span className="hidden sm:inline">{formatCurrency(payment.amount)}</span>
                                    <span className="sm:hidden">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(payment.amount)}</span>
                                  </p>
                                  <p className="text-xs text-gray-500">{payment.description}</p>
                                </div>
                                <p className="text-xs text-gray-500 self-end sm:self-auto">{formatDate(payment.paymentDate)}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanManager;