import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, PieChart, Wallet, TrendingUp, Download, Plus, Target, CreditCard, X, ArrowRight, Check, Square, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { initParticleEffect } from '../utils/animations';

interface Account {
  account_id: number;
  account_name: string;
  balance: number;
  currency: string;
  account_type: string;
}

interface Expense {
  expense_id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
}

interface AddExpenseFormData {
  account_id: string;
  amount: string;
  category: 'food' | 'transport' | 'housing' | 'entertainment' | 'education' | 'other';
  description: string;
  expense_date: string;
}

interface AddAccountFormData {
  account_name: string;
  balance: string;
  currency: string;
  account_type: 'cash' | 'bank' | 'savings' | 'investment';
}

interface ExtendedUser extends User {
  id: string;
  student_id: string;
}

interface BalanceData {
  balances: { [key: string]: number };
  totalInEGP: number;
  exchangeRates: { [key: string]: number };
}

interface ExpenseAnalytics {
  [category: string]: {
    total: number;
    transactions: number;
    by_currency: { [currency: string]: number };
  };
}

interface AddMoneyFormData {
  amount: string;
}

interface ExpenseDetail {
  expense_id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  account_name: string;
  currency: string;
}

interface TransactionFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
}

const Financial: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState<AddExpenseFormData>({
    account_id: '',
    amount: '',
    category: 'food',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState<string>('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<AddAccountFormData>({
    account_name: '',
    balance: '',
    currency: 'EGP',
    account_type: 'cash'
  });
  const [accountFormError, setAccountFormError] = useState<string>('');
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [addMoneyFormData, setAddMoneyFormData] = useState<AddMoneyFormData>({ amount: '' });
  const [addMoneyError, setAddMoneyError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expenseDetails, setExpenseDetails] = useState<ExpenseDetail[]>([]);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    fromAccountId: '',
    toAccountId: '',
    amount: ''
  });
  const [transactionError, setTransactionError] = useState<string>('');
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Animation variants for background dots
  const generateRandomDots = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // 1-4px
      color: ['#FF69B4', '#4B0082', '#9370DB', '#FF8C00', '#00CED1', '#32CD32'][Math.floor(Math.random() * 6)],
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));
  };

  const [dots] = useState(() => generateRandomDots(50));

  const dotVariants = {
    animate: (dot: any) => ({
      x: [
        `${dot.x}%`,
        `${dot.x + (Math.random() * 20 - 10)}%`,
        `${dot.x}%`
      ],
      y: [
        `${dot.y}%`,
        `${dot.y + (Math.random() * 20 - 10)}%`,
        `${dot.y}%`
      ],
      transition: {
        duration: dot.duration,
        repeat: Infinity,
        ease: "linear",
        delay: dot.delay
      }
    })
  };

  // Render background dots
  const renderBackgroundDots = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          custom={dot}
          variants={dotVariants}
          animate="animate"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            backgroundColor: dot.color,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        // Get user data from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
        
        console.log('Current User:', currentUser);
        console.log('Stored User:', userFromStorage);

        const effectiveUser = currentUser || userFromStorage;

        if (!effectiveUser) {
          console.log('No user found');
          setAccountFormError('Please log in to continue');
          return;
        }

        if (!effectiveUser.student_id) {
          console.log('No student_id found in user data:', effectiveUser);
          setAccountFormError('Student ID not found. Please log in again.');
          return;
        }

        console.log('Using student_id:', effectiveUser.student_id);
        await fetchFinancialData(effectiveUser);
      } catch (error) {
        console.error('Error in loadFinancialData:', error);
        setFormError('Failed to load financial data');
      }
    };

    loadFinancialData();
  }, [currentUser]);

  useEffect(() => {
    // Initialize particle effect
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    
    initParticleEffect('particles-canvas');
    
    return () => {
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, []);

  const fetchFinancialData = async (user: any) => {
    try {
      setIsLoading(true);
      console.log('Fetching financial data for student_id:', user.student_id);
      
      // Fetch accounts
      const accountsRes = await fetch(`http://localhost:3000/accounts?student_id=${user.student_id}`);
      console.log('Accounts response status:', accountsRes.status);
      if (!accountsRes.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const accountsData = await accountsRes.json();
      console.log('Fetched accounts:', accountsData);
      setAccounts(accountsData);

      // Fetch expenses
      const expensesRes = await fetch(`http://localhost:3000/expenses?student_id=${user.student_id}`);
      console.log('Expenses response status:', expensesRes.status);
      if (!expensesRes.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const expensesData = await expensesRes.json();
      console.log('Fetched expenses:', expensesData);
      setExpenses(expensesData);

      // Fetch balance data
      const balanceRes = await fetch(`http://localhost:3000/total-balance/${user.student_id}`);
      console.log('Balance response status:', balanceRes.status);
      if (!balanceRes.ok) {
        throw new Error('Failed to fetch balance');
      }
      const balanceData = await balanceRes.json();
      console.log('Fetched balance:', balanceData);
      setBalanceData(balanceData);

      // Fetch analytics
      const analyticsRes = await fetch(`http://localhost:3000/expense-analytics/${user.student_id}`);
      console.log('Analytics response status:', analyticsRes.status);
      if (!analyticsRes.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await analyticsRes.json();
      console.log('Fetched analytics:', analyticsData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error in fetchFinancialData:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCSVReport = () => {
    // Generate CSV content
    const headers = ['Date', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.expense_date,
        expense.category,
        expense.amount,
        `"${expense.description}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financial_report.csv';
    link.click();
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getExpensesByCategory = () => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    return categories;
  };

  const getMonthlyExpensesCount = () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate >= firstDayOfMonth;
    }).length;
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const amount = parseFloat(expenseFormData.amount);
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Check if selected account has sufficient balance
      const account = accounts.find(a => a.account_id === parseInt(expenseFormData.account_id));
      if (!account) {
        throw new Error('Selected account not found');
      }

      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expenseFormData,
          amount: amount,
          account_id: parseInt(expenseFormData.account_id)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add expense');
      }

      // Get user data for refresh
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      // Refresh data
      await fetchFinancialData(effectiveUser);

      // Reset form and close modal
      setExpenseFormData({
        account_id: '',
        amount: '',
        category: 'food',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      setShowExpenseModal(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError('');

    try {
      // Get user data from localStorage as fallback
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      if (!effectiveUser) {
        throw new Error('User not authenticated');
      }

      if (!effectiveUser.student_id) {
        console.error('No student_id found in user data:', effectiveUser);
        throw new Error('Student ID not found. Please log in again.');
      }

      // Validate account name
      if (!accountFormData.account_name.trim()) {
        throw new Error('Account name is required');
      }

      if (accountFormData.account_name.trim().length > 50) {
        throw new Error('Account name must be 50 characters or less');
      }

      // Validate balance
      const balance = parseFloat(accountFormData.balance);
      if (isNaN(balance) || balance < 0) {
        throw new Error('Balance must be a positive number');
      }

      const accountData = {
        student_id: parseInt(effectiveUser.student_id),
        account_name: accountFormData.account_name.trim(),
        balance: balance,
        currency: accountFormData.currency,
        account_type: accountFormData.account_type
      };

      console.log('Sending account data:', accountData);

      const response = await fetch('http://localhost:3000/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(accountData),
      });

      console.log('Response status:', response.status);

      let responseData;
      const textResponse = await response.text();
      console.log('Raw response:', textResponse);
      
      try {
        responseData = JSON.parse(textResponse);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Server returned invalid JSON response');
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add account');
      }

      // Refresh accounts data
      await fetchFinancialData(effectiveUser);

      // Reset form and close modal
      setAccountFormData({
        account_name: '',
        balance: '',
        currency: 'EGP',
        account_type: 'cash'
      });
      setShowAccountModal(false);

      console.log('Account created successfully:', responseData);
    } catch (error) {
      console.error('Error adding account:', error);
      setAccountFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMoneyError('');

    try {
      if (!selectedAccountId) {
        throw new Error('No account selected');
      }

      const amount = parseFloat(addMoneyFormData.amount);
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const response = await fetch(`http://localhost:3000/accounts/${selectedAccountId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add money');
      }

      // Get user data for refresh
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      // Refresh data
      await fetchFinancialData(effectiveUser);

      // Reset form and close modal
      setAddMoneyFormData({ amount: '' });
      setShowAddMoneyModal(false);
    } catch (error) {
      setAddMoneyError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Add a custom alert function
  const showNotification = (type: 'success' | 'error', message: string) => {
    const alertClass = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${alertClass} transition-opacity duration-500`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
        return;
      }

      const response = await fetch(`http://localhost:3000/accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Get user data for refresh
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      // Refresh data
      await fetchFinancialData(effectiveUser);

      // Show success message
      showNotification('success', 'Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  const handleCategoryClick = async (category: string) => {
    try {
      const user = currentUser as ExtendedUser;
      const response = await fetch(`http://localhost:3000/expense-details/${category}/${user.student_id}`);
      const details = await response.json();
      setExpenseDetails(details);
      setSelectedCategory(category);
      setShowExpenseDetails(true);
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to delete this expense? The amount will be refunded to the account.')) {
        return;
      }

      const response = await fetch(`http://localhost:3000/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete expense');
      }

      // Get user data for refresh
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      // Refresh data
      await fetchFinancialData(effectiveUser);

      // Show success message with refund details
      showNotification('success', `Expense deleted successfully. ${data.refundedAmount} has been refunded to the account.`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete expense');
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransactionError('');

    try {
      const amount = parseFloat(transactionFormData.amount);
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const fromAccount = accounts.find(a => a.account_id === parseInt(transactionFormData.fromAccountId));
      if (!fromAccount) {
        throw new Error('Source account not found');
      }

      const toAccount = accounts.find(a => a.account_id === parseInt(transactionFormData.toAccountId));
      if (!toAccount) {
        throw new Error('Destination account not found');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Insufficient balance in source account');
      }

      const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_account_id: parseInt(transactionFormData.fromAccountId),
          to_account_id: parseInt(transactionFormData.toAccountId),
          amount: amount
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to make transfer');
      }

      // Get user data for refresh
      const storedUser = localStorage.getItem('user');
      const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
      const effectiveUser = currentUser || userFromStorage;

      // Refresh data
      await fetchFinancialData(effectiveUser);

      // Reset form and close modal
      setTransactionFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: ''
      });
      setShowTransactionModal(false);
    } catch (error) {
      setTransactionError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Add welcome page render function
  const renderWelcomePage = () => (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Manage Your Finances with Ease
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Track your expenses, manage multiple accounts, and achieve your financial goals all in one place.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Multiple Accounts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage all your accounts in different currencies with ease
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <PieChart className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Expense Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep track of your spending with detailed categorization
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Target className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Savings Goals
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set and track your savings goals with progress monitoring
                </p>
              </div>
            </div>

            <div className="space-x-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Login to Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  Multi-Currency
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Support for EGP, USD, EUR, and GBP
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Real-time
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Instant updates and tracking
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  Secure
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Your financial data is encrypted
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Analytics
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed insights and reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  const renderFloatingShapes = () => {
    return (
      <>
        <div className="floating-shape top-20 left-[10%] w-20 h-20 bg-purple-500/10 dark:bg-purple-500/20 rounded-full"></div>
        <div className="floating-shape top-40 right-[15%] w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="floating-shape bottom-60 left-[20%] w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
      </>
    );
  };

  // Modify the main return statement
  if (!isAuthenticated) {
    return renderWelcomePage();
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-[#0A0A1B] dark:bg-[#0A0A1B]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {renderBackgroundDots()}
      <Header />
      
      <motion.main 
        className="flex-grow pt-24 pb-12 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background shapes for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="islamic-pattern absolute inset-0 opacity-5"></div>
          {renderFloatingShapes()}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Dashboard Header */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Financial Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track, manage, and analyze your finances in one place
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            {[
              {
                icon: <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                title: "Total Balance",
                value: `EGP ${balanceData?.totalInEGP.toLocaleString() ?? 0}`,
                color: "blue"
              },
              {
                icon: <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />,
                title: "Active Accounts",
                value: accounts.length.toString(),
                color: "green"
              },
              {
                icon: <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                title: "Monthly Expenses",
                value: getMonthlyExpensesCount().toString(),
                color: "purple"
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card withHover withGlow>
                  <div className="flex items-center">
                    <motion.div 
                      className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </h3>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions Row */}
          <motion.div 
            className="flex flex-wrap gap-4 mb-8"
            variants={containerVariants}
          >
            {[
              {
                label: "Add Expense",
                icon: <Plus size={20} />,
                onClick: () => setShowExpenseModal(true),
                variant: "primary" as const
              },
              {
                label: "New Account",
                icon: <Plus size={20} />,
                onClick: () => setShowAccountModal(true),
                variant: "secondary" as const
              },
              {
                label: "Transfer Money",
                icon: <ArrowRight size={20} />,
                onClick: () => setShowTransactionModal(true),
                variant: "primary" as const
              },
              {
                label: "Savings Goals",
                icon: <Target size={20} />,
                onClick: () => navigate('/savings-goals'),
                variant: "rainbow" as const
              },
              {
                label: "Export Report",
                icon: <Download size={20} />,
                onClick: generateCSVReport,
                variant: "secondary" as const
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={action.variant}
                  size="lg"
                  icon={action.icon}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {/* Accounts List */}
            <motion.div variants={itemVariants}>
              <Card withHover>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Your Accounts
                </h3>
                <motion.div className="space-y-4">
                  {accounts.map((account, index) => (
                    <motion.div
                      key={account.account_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                          <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {account.account_name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {account.account_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {account.currency} {account.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedAccountId(account.account_id);
                              setShowAddMoneyModal(true);
                            }}
                          >
                            Add Money
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.account_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>

            {/* Analytics Section */}
            <motion.div variants={itemVariants}>
              <Card withHover>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Expense Analytics
                </h3>
                <motion.div className="space-y-4">
                  {analytics && Object.entries(analytics).map(([category, data], index) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: -10 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {category}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {data.transactions} transactions
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(data.by_currency).map(([currency, amount]) => (
                          <p key={currency} className="text-sm text-gray-600 dark:text-gray-300">
                            {currency}: {amount.toLocaleString()}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {showExpenseModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Expense
                </h3>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                  {formError}
                </div>
              )}

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account
                  </label>
                  <select
                    value={expenseFormData.account_id}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, account_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name} ({account.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData(prev => ({ 
                      ...prev, 
                      category: e.target.value as AddExpenseFormData['category']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="housing">Housing</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseFormData.expense_date}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowExpenseModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Add Expense
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAccountModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Account
                </h3>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {accountFormError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                  {accountFormError}
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={accountFormData.account_name}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, account_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    maxLength={50}
                    placeholder="e.g., Main Savings, Emergency Fund"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={accountFormData.balance}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          setAccountFormData(prev => ({ ...prev, balance: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      placeholder="0.00"
                    />
                    <DollarSign className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={accountFormData.currency}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type
                  </label>
                  <select
                    value={accountFormData.account_type}
                    onChange={(e) => setAccountFormData(prev => ({ 
                      ...prev, 
                      account_type: e.target.value as AddAccountFormData['account_type']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Account</option>
                    <option value="savings">Savings Account</option>
                    <option value="investment">Investment Account</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAccountModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Add Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showAddMoneyModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Money
                </h3>
                <button
                  onClick={() => setShowAddMoneyModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              {addMoneyError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                  {addMoneyError}
                </div>
              )}

              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={addMoneyFormData.amount}
                    onChange={(e) => setAddMoneyFormData({ amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddMoneyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Add Money
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showTransactionModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transfer Money
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              {transactionError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                  {transactionError}
                </div>
              )}

              <form onSubmit={handleTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Account
                  </label>
                  <select
                    value={transactionFormData.fromAccountId}
                    onChange={(e) => setTransactionFormData(prev => ({ ...prev, fromAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name} ({account.currency} {account.balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Account
                  </label>
                  <select
                    value={transactionFormData.toAccountId}
                    onChange={(e) => setTransactionFormData(prev => ({ ...prev, toAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts
                      .filter(account => account.account_id !== parseInt(transactionFormData.fromAccountId))
                      .map(account => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.account_name} ({account.currency})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionFormData.amount}
                    onChange={(e) => setTransactionFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowTransactionModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Transfer
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showExpenseDetails && selectedCategory && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {selectedCategory} Expenses
                </h3>
                <button
                  onClick={() => setShowExpenseDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {expenseDetails.map(detail => (
                  <div key={detail.expense_id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {detail.currency} {detail.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {detail.account_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(detail.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {detail.description || 'No description'}
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteExpense(detail.expense_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
};

export default Financial; 