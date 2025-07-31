import React from 'react';
import { BarChart3, Target, TrendingUp, Calendar } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';

const DashboardPage = () => {
  const stats = [
    { icon: Target, label: 'Goals Completed', value: '12/15', color: 'text-green-600' },
    { icon: TrendingUp, label: 'Weekly Progress', value: '85%', color: 'text-blue-600' },
    { icon: Calendar, label: 'Current Streak', value: '7 days', color: 'text-purple-600' },
    { icon: BarChart3, label: 'Total Points', value: '2,340', color: 'text-orange-600' },
  ];

  return (
    <PageContainer 
      title="Your Dashboard" 
      subtitle="Track your progress and achievements"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <p className="text-gray-600 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Weekly Activity</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Goal Progress</h3>
          <div className="space-y-4">
            {['Exercise Goals', 'Study Goals', 'Health Goals'].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">{goal}</span>
                  <span className="text-sm text-gray-500">{80 + index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${80 + index * 5}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;