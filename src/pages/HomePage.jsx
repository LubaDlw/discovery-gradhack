import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, BarChart3, Gift, ArrowRight } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';

const HomePage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Chat with Dumi',
      description: 'Get personalized guidance and support from your AI assistant',
      link: '/chat',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your health and academic achievements',
      link: '/dashboard',
      color: 'bg-green-500'
    },
    {
      icon: Gift,
      title: 'Earn Rewards',
      description: 'Get discounts and vouchers for completing goals',
      link: '/rewards',
      color: 'bg-purple-500'
    }
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-12 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Discovery Student
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your journey to a healthier, smarter, and more rewarding student life starts here
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Chat with Dumi</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {feature.description}
            </p>
            <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-8">Join Thousands of Students</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
            <div className="text-gray-300">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">500,000+</div>
            <div className="text-gray-300">Goals Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">R2M+</div>
            <div className="text-gray-300">Rewards Earned</div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;