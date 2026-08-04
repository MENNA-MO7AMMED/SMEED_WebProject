import React from 'react';
import { TrendingUp, Target, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { Appointment, AppointmentType, AppointmentStats } from '../../types';
import { isOverdue, getAppointmentTypeEmoji } from '../../utils/appointments';

interface AppointmentStatsProps {
  appointments: Appointment[];
  stats: AppointmentStats;
}

const AppointmentStatsComponent: React.FC<AppointmentStatsProps> = ({ appointments, stats }) => {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  const getTypeCompletionRate = (type: AppointmentType) => {
    const typeAppointments = appointments.filter(app => app.type === type);
    const typeCompleted = typeAppointments.filter(app => app.completed).length;
    return typeAppointments.length > 0 ? (typeCompleted / typeAppointments.length) * 100 : 0;
  };

  const recentActivity = appointments
    .filter(app => app.completed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
          </div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h3>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${completionRate}%` }}
            >
              <span className="text-white text-sm font-medium">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.completed} of {stats.total} tasks completed</span>
            <span>
              {completionRate >= 80 ? '🎉 Excellent!' : 
               completionRate >= 60 ? '👍 Good progress' : 
               completionRate >= 40 ? '⚡ Keep going' : '💪 Let\'s do this!'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tasks by Type */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance by Type</h3>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, count]) => {
              const completionRate = getTypeCompletionRate(type as AppointmentType);
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getAppointmentTypeEmoji(type as AppointmentType)}</span>
                      <span className="capitalize font-medium">{type}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {count} tasks • {Math.round(completionRate)}% complete
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Completions</h3>
            <div className="space-y-3">
              {recentActivity.map((appointment) => (
                <div key={appointment.appointment_id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-xl">{getAppointmentTypeEmoji(appointment.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{appointment.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed • {new Date(appointment.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Tips</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            {stats.overdue > 0 && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">
                    You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}
                  </div>
                  <div>Consider rescheduling or completing them soon to stay on track.</div>
                </div>
              </div>
            )}
            
            {completionRate >= 80 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">Great job!</div>
                  <div>You're maintaining an excellent completion rate. Keep up the momentum!</div>
                </div>
              </div>
            )}
            
            {stats.pending > 5 && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Stay organized</div>
                  <div>With {stats.pending} pending tasks, consider prioritizing the most important ones first.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentStatsComponent; 