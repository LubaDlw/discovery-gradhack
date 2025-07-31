import React from 'react';
import { Gift, Star, ShoppingBag, Smartphone } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';

const RewardsPage = () => {
  const rewards = [
    {
      icon: ShoppingBag,
      title: 'Food Vouchers',
      description: '20% off at campus restaurants',
      points: '500 points',
      available: true,
      color: 'bg-green-500'
    },
    {
      icon: Smartphone,
      title: 'Data Bundles',
      description: '1GB free data from Vodacom',
      points: '750 points',
      available: true,
      color: 'bg-blue-500'
    },
    {
      icon: Star,
      title: 'Premium Features',
      description: 'Unlock advanced health insights',
      points: '1000 points',
      available: false,
      color: 'bg-purple-500'
    },
    {
      icon: Gift,
      title: 'Study Resources',
      description: 'Free access to online courses',
      points: '300 points',
      available: true,
      color: 'bg-orange-500'
    }
  ];

  return (
    <PageContainer 
      title="Rewards Store" 
      subtitle="Redeem your points for amazing rewards"
    >
      {/* Points Balance */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Points Balance</h2>
            <p className="text-purple-100">Keep earning to unlock more rewards!</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">2,340</div>
            <div className="text-purple-200">points</div>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className={`${reward.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
              <reward.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reward.title}
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              {reward.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-semibold">
                {reward.points}
              </span>
              
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  reward.available
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!reward.available}
              >
                {reward.available ? 'Redeem' : 'Locked'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* How to Earn Points */}
      <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Earn Points</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold mb-2">Complete Goals</h4>
            <p className="text-gray-600 text-sm">Earn 50-200 points per completed goal</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Daily Streaks</h4>
            <p className="text-gray-600 text-sm">Bonus points for consistent activity</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold mb-2">Special Challenges</h4>
            <p className="text-gray-600 text-sm">Extra points for monthly challenges</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RewardsPage;