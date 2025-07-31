import React from 'react';
import { User, Mail, Phone, MapPin, Edit3, Settings } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';

const ProfilePage = () => {
  return (
    <PageContainer 
      title="Your Profile" 
      subtitle="Manage your account and preferences"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-16 h-16 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">John Student</h2>
            <p className="text-gray-600 mb-4">University of Cape Town</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                john.student@uct.ac.za
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                +27 12 345 6789
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                Cape Town, South Africa
              </div>
            </div>
            
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Information */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
              <button className="text-purple-600 hover:text-purple-700">
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value="John"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value="Student"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value="STU2024001"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value="Computer Science"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Preferences</h3>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates about your progress</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  defaultChecked
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">SMS Reminders</h4>
                  <p className="text-sm text-gray-600">Get reminders for upcoming goals</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  defaultChecked
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Data Analytics</h4>
                  <p className="text-sm text-gray-600">Help improve our services</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <h4 className="font-medium text-gray-900 mb-1">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account security</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <h4 className="font-medium text-gray-900 mb-1">Download Data</h4>
                <p className="text-sm text-gray-600">Export your activity data</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                <h4 className="font-medium text-gray-900 mb-1">Privacy Settings</h4>
                <p className="text-sm text-gray-600">Manage your privacy preferences</p>
              </button>
              
              <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 text-left">
                <h4 className="font-medium text-red-600 mb-1">Delete Account</h4>
                <p className="text-sm text-red-500">Permanently delete your account</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;