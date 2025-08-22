'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-auth';
import { toast } from 'react-toastify';

export default function AdminPointSystem({ user }) {
  const [activeTab, setActiveTab] = useState('rules');
  const [pointRules, setPointRules] = useState([]);
  const [pointStats, setPointStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newRule, setNewRule] = useState({
    event_type: '',
    event_condition: '',
    points: 0,
    description: '',
    is_active: true
  });

  const [manualAdjustment, setManualAdjustment] = useState({
    userId: '',
    points: 0,
    reason: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadPointRules();
      loadPointStats();
    }
  }, [user]);

  const loadPointRules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/points/rules`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setPointRules(result.rules);
      }
    } catch (error) {
      console.error('❌ Error loading point rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPointStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/points/statistics`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setPointStats(result.statistics);
      }
    } catch (error) {
      console.error('❌ Error loading point stats:', error);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/points/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newRule)
      });

      const result = await response.json();
      if (result.success) {
        toast.success('✅ Point rule created successfully!');
        setNewRule({
          event_type: '',
          event_condition: '',
          points: 0,
          description: '',
          is_active: true
        });
        loadPointRules();
      } else {
        toast.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating rule:', error);
      toast.error('❌ Error creating rule');
    }
  };

  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/points/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const result = await response.json();
      if (result.success) {
        loadPointRules();
      } else {
        toast.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error toggling rule:', error);
    }
  };

  const handleManualAdjustment = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!confirm(`Are you sure you want to ${manualAdjustment.points > 0 ? 'award' : 'deduct'} ${Math.abs(manualAdjustment.points)} points?`)) {
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/points/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(manualAdjustment)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`✅ Successfully ${manualAdjustment.points > 0 ? 'awarded' : 'deducted'} ${Math.abs(manualAdjustment.points)} points!`);
        setManualAdjustment({
          userId: '',
          points: 0,
          reason: ''
        });
        loadPointStats();
      } else {
        toast.error(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error with manual adjustment:', error);
      toast.error('❌ Error with manual adjustment');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 Admin Point System
          </h1>
          <p className="text-gray-600">
            Manage point rules and user rewards
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'rules', label: '📋 Point Rules', icon: '📋' },
              { id: 'manual', label: '✋ Manual Adjustment', icon: '✋' },
              { id: 'stats', label: '📊 Statistics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Point Rules Tab */}
            {activeTab === 'rules' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">📝 Create New Rule</h2>
                  <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type
                      </label>
                      <select
                        value={newRule.event_type}
                        onChange={(e) => setNewRule({...newRule, event_type: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select event type</option>
                        <option value="comment_created">Comment Created</option>
                        <option value="like_received">Like Received</option>
                        <option value="post_closed">Post Closed (Solved)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Condition (Optional)
                      </label>
                      <input
                        type="text"
                        value={newRule.event_condition}
                        onChange={(e) => setNewRule({...newRule, event_condition: e.target.value})}
                        placeholder="e.g., status=closed, priority=high"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        value={newRule.points}
                        onChange={(e) => setNewRule({...newRule, points: parseInt(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newRule.description}
                        onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                        placeholder="Points awarded for..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Create Rule
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">🎯 Existing Rules</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Event Type</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Condition</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Points</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Description</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pointRules.map((rule) => (
                          <tr key={rule.id} className={rule.is_active ? '' : 'opacity-50'}>
                            <td className="px-4 py-2 text-sm text-gray-900">{rule.event_type}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{rule.event_condition || '-'}</td>
                            <td className="px-4 py-2 text-sm font-medium">{rule.points}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{rule.description}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                rule.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <button
                                onClick={() => handleToggleRule(rule.id, rule.is_active)}
                                className={`px-3 py-1 rounded-md text-xs ${
                                  rule.is_active
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {rule.is_active ? 'Disable' : 'Enable'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Adjustment Tab */}
            {activeTab === 'manual' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">✋ Manual Point Adjustment</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <p className="text-yellow-800">
                    ⚠️ Use this to manually add or subtract points from users. 
                    Positive numbers add points, negative numbers subtract points.
                  </p>
                </div>

                <form onSubmit={handleManualAdjustment} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={manualAdjustment.userId}
                      onChange={(e) => setManualAdjustment({...manualAdjustment, userId: e.target.value})}
                      placeholder="UUID of the user"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points (+ to add, - to subtract)
                    </label>
                    <input
                      type="number"
                      value={manualAdjustment.points}
                      onChange={(e) => setManualAdjustment({...manualAdjustment, points: parseInt(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <textarea
                      value={manualAdjustment.reason}
                      onChange={(e) => setManualAdjustment({...manualAdjustment, reason: e.target.value})}
                      placeholder="Reason for this adjustment..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full px-6 py-2 rounded-md text-white transition-colors ${
                      manualAdjustment.points >= 0
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {manualAdjustment.points >= 0 ? 'Award Points' : 'Deduct Points'}
                  </button>
                </form>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">📊 Point System Statistics</h2>
                
                {pointStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Summary Cards */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Total Points Distributed</h3>
                      <p className="text-2xl font-bold text-blue-900">{pointStats.totalPointsDistributed}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Total Transactions</h3>
                      <p className="text-2xl font-bold text-green-900">{pointStats.totalTransactions}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-2">Active Users</h3>
                      <p className="text-2xl font-bold text-purple-900">{pointStats.topUsers.length}</p>
                    </div>

                    {/* Event Breakdown */}
                    <div className="md:col-span-2 lg:col-span-3 bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Points by Event Type</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(pointStats.eventBreakdown).map(([event, points]) => (
                          <div key={event} className="text-center">
                            <p className="text-sm text-gray-600">{event.replace('_', ' ')}</p>
                            <p className="text-lg font-semibold text-gray-900">{points} pts</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Users */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Users</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Rank</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">User</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pointStats.topUsers.map((user, index) => (
                              <tr key={user.id}>
                                <td className="px-4 py-2 text-sm font-medium">
                                  {index === 0 && '🥇'}
                                  {index === 1 && '🥈'}
                                  {index === 2 && '🥉'}
                                  {index > 2 && `#${index + 1}`}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">{user.full_name}</td>
                                <td className="px-4 py-2 text-sm font-semibold">{user.current_points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
