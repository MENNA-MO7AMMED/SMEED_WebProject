import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Check, Calendar, DollarSign, Sparkles, ArrowRight, CheckSquare, Square, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { initParticleEffect } from '../utils/animations';

interface ExtendedUser extends User {
  id: string;
  student_id: string;
}

interface SavingsGoal {
  goal_id: number;
  target_amount: number;
  goal_name: string;
  deadline: string;
  daily_target: string;
  completed: boolean;
  progress: number;
  daily_progress: {
    date: string;
    completed: boolean;
  }[];
  isExpanded?: boolean;
}

interface AddGoalFormData {
  goal_name: string;
  target_amount: string;
  deadline: string;
}

const SavingsGoals: React.FC = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [formData, setFormData] = useState<AddGoalFormData>({
    goal_name: '',
    target_amount: '',
    deadline: ''
  });
  const [formError, setFormError] = useState<string>('');
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);

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

  const renderFloatingShapes = () => {
    return (
      <>
        <div className="floating-shape top-20 left-[10%] w-20 h-20 bg-purple-500/10 dark:bg-purple-500/20 rounded-full"></div>
        <div className="floating-shape top-40 right-[15%] w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="floating-shape bottom-60 left-[20%] w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
      </>
    );
  };

  const fetchData = async () => {
    try {
      if (!currentUser) return;

      const user = currentUser as ExtendedUser;
      const [goalsRes, balanceRes] = await Promise.all([
        fetch(`http://localhost:3000/savings-goals?student_id=${user.student_id}`),
        fetch(`http://localhost:3000/total-balance/${user.student_id}`)
      ]);

      if (!goalsRes.ok || !balanceRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [goalsData, balanceData] = await Promise.all([
        goalsRes.json(),
        balanceRes.json()
      ]);

      setTotalBalance(balanceData.totalInEGP || 0);
      
      // Process each goal to add daily progress
      const processedGoals = goalsData.map((goal: any) => {
        const deadline = new Date(goal.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const daily_progress = generateDailyProgress(today, deadline);
        
        return {
          ...goal,
          daily_target: goal.daily_target?.toString() || '0.00',
          daily_progress,
          progress: parseFloat(goal.progress?.toString() || '0'),
          completed: Boolean(goal.completed),
          target_amount: parseFloat(goal.target_amount?.toString() || '0')
        } as SavingsGoal;
      });

      setGoals(processedGoals);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
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

  const generateDailyProgress = (startDate: Date, endDate: Date) => {
    const days = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Don't include the deadline day
    endDate.setDate(endDate.getDate() - 1);

    while (currentDate <= endDate) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        completed: false
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!currentUser) throw new Error('Not authenticated');
      const user = currentUser as ExtendedUser;

      const targetAmount = parseFloat(formData.target_amount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        throw new Error('Target amount must be positive');
      }

      if (totalBalance === 0) {
        throw new Error('Cannot set a goal with zero balance');
      }

      if (targetAmount > totalBalance) {
        throw new Error('Target amount cannot be greater than your total balance');
      }

      const deadline = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline <= today) {
        throw new Error('Deadline must be in the future');
      }

      const response = await fetch('http://localhost:3000/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.student_id,
          goal_name: formData.goal_name.trim(),
          target_amount: targetAmount,
          deadline: formData.deadline
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      setShowAddGoalModal(false);
      setFormData({ goal_name: '', target_amount: '', deadline: '' });
      fetchData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/savings-goals/${goalId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete goal');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleDayCompletion = async (goalId: number, dayIndex: number) => {
    try {
      const goal = goals.find(g => g.goal_id === goalId);
      if (!goal) return;

      const dailyTargetAmount = parseFloat(goal.daily_target);
      
      // Only check balance when marking a day as complete
      if (!goal.daily_progress[dayIndex].completed) {
        // Convert both values to numbers with 2 decimal places for accurate comparison
        const currentBalance = parseFloat(totalBalance.toFixed(2));
        const targetAmount = parseFloat(dailyTargetAmount.toFixed(2));
        
        console.log('Current Balance:', currentBalance);
        console.log('Daily Target:', targetAmount);
        
        if (currentBalance < targetAmount) {
          throw new Error(`Insufficient balance. You need EGP ${targetAmount} but have EGP ${currentBalance}`);
        }
      }

      const response = await fetch(`http://localhost:3000/savings-goals/${goalId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_index: dayIndex,
          completed: !goal.daily_progress[dayIndex].completed,
          amount: dailyTargetAmount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }

      const result = await response.json();
      
      // Update local state
      const updatedGoals = goals.map(g => {
        if (g.goal_id === goalId) {
          const newProgress = [...g.daily_progress];
          newProgress[dayIndex].completed = !newProgress[dayIndex].completed;
          
          // Calculate new progress based on checked boxes
          const totalBoxes = newProgress.length;
          const checkedBoxes = newProgress.filter(day => day.completed).length;
          const newProgressPercentage = totalBoxes > 0 ? Math.round((checkedBoxes / totalBoxes) * 100) : 0;
          
          return {
            ...g,
            daily_progress: newProgress,
            progress: newProgressPercentage,
            completed: checkedBoxes === totalBoxes
          };
        }
        return g;
      });

      setGoals(updatedGoals);
      
      // Update the total balance only if we received a valid new balance
      if (typeof result.new_balance === 'number' && !isNaN(result.new_balance)) {
        setTotalBalance(result.new_balance);
      }
      
    } catch (error) {
      console.error('Error updating day completion:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Add a function to check if all days are completed for a goal
  const isGoalCompleted = (goal: SavingsGoal) => {
    return goal.daily_progress.every(day => day.completed);
  };

  const toggleGoalExpansion = (goalId: number) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A1B] dark:bg-[#0A0A1B]">
      {renderBackgroundDots()}
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {/* Background shapes for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="islamic-pattern absolute inset-0 opacity-5"></div>
          {renderFloatingShapes()}
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Savings Goals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your savings progress and achieve your financial goals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <Card
                key={goal.goal_id}
                withHover
                withGlow
                className={`animate-fade-in transition-all duration-300 ease-in-out cursor-pointer ${
                  isGoalCompleted(goal) ? 'scale-95 opacity-80' : ''
                }`}
                onClick={() => toggleGoalExpansion(goal.goal_id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        isGoalCompleted(goal)
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-purple-100 dark:bg-purple-900'
                      }`}>
                        {isGoalCompleted(goal) ? (
                          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <h3 className={`ml-3 text-xl font-semibold text-gray-900 dark:text-white ${
                        isGoalCompleted(goal) ? 'line-through decoration-2' : ''
                      }`}>
                        {goal.goal_name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal.goal_id);
                        }}
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={`space-y-3 ${expandedGoalId === goal.goal_id ? '' : 'hidden'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Target Amount</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        EGP {goal.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Daily Target</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        EGP {goal.daily_target}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        EGP {totalBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className={`font-semibold ${
                        isGoalCompleted(goal) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {Math.round(goal.progress)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Daily Progress
                      </h4>
                      <div className="grid grid-cols-7 gap-2">
                        {goal.daily_progress.map((day, index) => (
                          <button
                            key={day.date}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isGoalCompleted(goal)) {
                                toggleDayCompletion(goal.goal_id, index);
                              }
                            }}
                            className={`p-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                              day.completed
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-gray-100 dark:bg-gray-800'
                            } ${isGoalCompleted(goal) ? 'cursor-default' : 'cursor-pointer'}`}
                            title={new Date(day.date).toLocaleDateString()}
                            disabled={isGoalCompleted(goal)}
                          >
                            {day.completed ? (
                              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar and summary when collapsed */}
                  {expandedGoalId !== goal.goal_id && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isGoalCompleted(goal) ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round(goal.progress))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(goal.progress)}% Complete
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Fixed position button */}
          <div className="fixed bottom-8 left-8">
            <Button
              variant="rainbow"
              size="lg"
              icon={<Plus size={20} />}
              onClick={() => setShowAddGoalModal(true)}
              withShimmer
              disabled={totalBalance === 0}
              title={totalBalance === 0 ? "Can't set goal with zero balance" : "Set New Goal"}
            >
              Set New Goal
            </Button>
          </div>
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md animate-slide-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Set New Savings Goal
              </h3>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.goal_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.target_amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setFormData(prev => ({ ...prev, target_amount: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  max={totalBalance}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min={new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddGoalModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  Create Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SavingsGoals; 