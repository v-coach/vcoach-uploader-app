import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const PricingPlanModal = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: plan?.id || '',
    name: plan?.name || '',
    price: plan?.price || 0,
    currency: plan?.currency || 'USD',
    interval: plan?.interval || 'month',
    features: plan?.features?.join('\n') || '',
    color: plan?.color || 'gray',
    popular: plan?.popular || false,
    description: plan?.description || '',
    buttonText: plan?.buttonText || 'Subscribe'
  });

  const colorOptions = [
    { value: 'gray', label: 'Gray', preview: 'bg-gray-500' },
    { value: 'red', label: 'Red', preview: 'bg-red-500' },
    { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
    { value: 'yellow', label: 'Yellow', preview: 'bg-yellow-500' },
    { value: 'green', label: 'Green', preview: 'bg-green-500' },
    { value: 'blue', label: 'Blue', preview: 'bg-blue-500' },
    { value: 'indigo', label: 'Indigo', preview: 'bg-indigo-500' },
    { value: 'purple', label: 'Purple', preview: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', preview: 'bg-pink-500' },
    { value: 'sky', label: 'Sky', preview: 'bg-sky-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const featuresArray = formData.features.split('\n').map(f => f.trim()).filter(f => f);
    
    const planData = {
      ...plan,
      id: formData.id || (plan?.id || `plan-${Date.now()}`),
      name: formData.name,
      price: parseFloat(formData.price),
      currency: formData.currency,
      interval: formData.interval,
      features: featuresArray,
      color: formData.color,
      popular: formData.popular,
      description: formData.description,
      buttonText: formData.buttonText
    };
    
    onSave(planData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-white mb-6">
            {plan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan-name" className="text-sm font-medium text-white/80 block mb-2">Plan Name</label>
                <input
                  id="plan-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., Individual Plan"
                  required
                />
              </div>

              <div>
                <label htmlFor="plan-id" className="text-sm font-medium text-white/80 block mb-2">Plan ID</label>
                <input
                  id="plan-id"
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., individual"
                  required={!plan}
                  disabled={!!plan}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="plan-price" className="text-sm font-medium text-white/80 block mb-2">Price</label>
                <input
                  id="plan-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="plan-currency" className="text-sm font-medium text-white/80 block mb-2">Currency</label>
                <select
                  id="plan-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div>
                <label htmlFor="plan-interval" className="text-sm font-medium text-white/80 block mb-2">Interval</label>  
                <select
                  id="plan-interval"
                  value={formData.interval}
                  onChange={(e) => setFormData(prev => ({ ...prev, interval: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="plan-description" className="text-sm font-medium text-white/80 block mb-2">Description</label>
              <input
                id="plan-description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Brief description of the plan"
              />
            </div>

            <div>
              <label htmlFor="plan-features" className="text-sm font-medium text-white/80 block mb-2">Features (one per line)</label>
              <textarea
                id="plan-features"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Priority VoD Review&#10;1-on-1 Coaching Sessions&#10;Detailed Analytics"
                className="w-full h-24 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/80 block mb-2">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`h-8 rounded-md ${color.preview} flex items-center justify-center text-white text-xs font-medium border-2 transition-all ${
                        formData.color === color.value ? 'border-white' : 'border-transparent'
                      }`}
                      title={color.label}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="plan-button-text" className="text-sm font-medium text-white/80 block mb-2">Button Text</label>
                <input
                  id="plan-button-text"
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full h-10 rounded-md border border-white/20 bg-transparent px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Subscribe"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="plan-popular"
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                className="w-4 h-4 rounded border border-white/20 bg-transparent"
              />
              <label htmlFor="plan-popular" className="text-sm font-medium text-white/80">
                Mark as "Most Popular"
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button 
              type="button" 
              onClick={onCancel}
              className="h-10 px-5 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="h-10 px-5 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold transition-colors"
            >
              {plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PricingManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ type: null, plan: null });
  const { token } = useAuth();

  const fetchPlans = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get('/.netlify/functions/manage-pricing', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
      setError(`Failed to fetch pricing plans: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  const handleSavePlan = async (planData) => {
    try {
      let response;
      if (planData.id && plans.find(p => p.id === planData.id)) {
        // Update existing plan
        response = await axios.put('/.netlify/functions/manage-pricing', planData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new plan
        response = await axios.post('/.netlify/functions/manage-pricing', planData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      setModalState({ type: null, plan: null });
      
      // Update local state immediately
      if (response.data) {
        if (planData.id && plans.find(p => p.id === planData.id)) {
          // Update existing plan in local state
          setPlans(prevPlans => 
            prevPlans.map(plan => 
              plan.id === planData.id ? response.data : plan
            )
          );
        } else {
          // Add new plan to local state
          setPlans(prevPlans => [...prevPlans, response.data]);
        }
      }
      
      // Refresh data after a short delay
      setTimeout(async () => {
        await fetchPlans();
      }, 1000);
      
    } catch (err) {
      console.error('Failed to save pricing plan:', err);
      const errorMessage = err.response?.data?.error || err.message;
      alert(`Failed to save pricing plan: ${errorMessage}`);
    }
  };

  const handleDeletePlan = async (plan) => {
    if (window.confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-pricing', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { id: plan.id }
        });
        await fetchPlans(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete pricing plan:', err);
        const errorMessage = err.response?.data?.error || err.message;
        alert(`Failed to delete pricing plan: ${errorMessage}`);
      }
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      gray: { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', border: 'hover:border-gray-400/50', shadow: 'hover:shadow-gray-500/20' },
      red: { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'hover:border-red-400/50', shadow: 'hover:shadow-red-500/20' },
      orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'hover:border-orange-400/50', shadow: 'hover:shadow-orange-500/20' },
      yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', border: 'hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-500/20' },
      green: { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'hover:border-green-400/50', shadow: 'hover:shadow-green-500/20' },
      blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'hover:border-blue-400/50', shadow: 'hover:shadow-blue-500/20' },
      indigo: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', border: 'hover:border-indigo-400/50', shadow: 'hover:shadow-indigo-500/20' },
      purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'hover:border-purple-400/50', shadow: 'hover:shadow-purple-500/20' },
      pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'hover:border-pink-400/50', shadow: 'hover:shadow-pink-500/20' },
      sky: { bg: 'bg-sky-500', hover: 'hover:bg-sky-600', border: 'hover:border-sky-400/50', shadow: 'hover:shadow-sky-500/20' }
    };
    return colorMap[color] || colorMap.gray;
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl p-6">
        <div className="text-center text-red-400">Please log in to manage pricing plans.</div>
      </div>
    );
  }

  return (
    <>
      {modalState.type && (
        <PricingPlanModal
          plan={modalState.plan}
          onSave={handleSavePlan}
          onCancel={() => setModalState({ type: null, plan: null })}
        />
      )}

      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Pricing Management</h2>
          <button
            onClick={() => setModalState({ type: 'add', plan: null })}
            className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold transition-colors"
          >
            + Add Plan
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={fetchPlans}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center text-white/60 py-8">Loading pricing plans...</div>
          ) : plans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const colors = getColorClasses(plan.color);
                
                return (
                  <div key={plan.id} className={`rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center relative hover:bg-black/40 ${colors.border} hover:scale-105 hover:-translate-y-2 ${colors.shadow} transition-all duration-300 group cursor-pointer`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
                        <div className="bg-sky-500 text-white px-4 py-1 rounded-full text-xs font-bold group-hover:bg-sky-400 transition-colors duration-300">MOST POPULAR</div>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <img src="/vcoachlg.jpg" alt="V-Coach Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors duration-300">{plan.name}</h3>
                      <div className="text-4xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors duration-300">
                        ${plan.price.toFixed(2)}
                      </div>
                      <div className="text-white/60 text-sm group-hover:text-white/80 transition-colors duration-300">
                        {plan.currency} / {plan.interval}
                      </div>
                      {plan.description && (
                        <p className="text-white/70 text-sm mt-2 group-hover:text-white/90 transition-colors duration-300">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    
                    <button className={`w-full h-12 px-6 ${colors.bg} text-white ${colors.hover} hover:shadow-lg hover:shadow-${plan.color}-500/50 rounded-xl text-lg font-bold mb-6 transition-all duration-300 hover:scale-105`}>
                      {plan.buttonText}
                    </button>
                    
                    <div className="space-y-4 text-left mb-6">
                      <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 group-hover:text-white/80 transition-colors duration-300">Features</div>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 group-hover:scale-105 transition-transform duration-200">
                          <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setModalState({ type: 'edit', plan })}
                        className="h-8 px-3 bg-gray-500 text-white hover:bg-gray-600 rounded-md text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="h-8 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              No pricing plans created yet. Click "Add Plan" to get started.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PricingManagement;
