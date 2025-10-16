import React, { useState, useEffect } from 'react';
import { SPLIT_TYPES, validateExpenseSplit } from '../services/expenseSplittingService';

const ExpenseSplittingModal = ({ 
  isOpen, 
  onClose, 
  expense, 
  tripMembers, 
  onSplitExpense,
  currentUserId 
}) => {
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState([]);
  const [percentageSplits, setPercentageSplits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tripMembers.length > 0) {
      // Initialize with current user selected
      const currentMember = tripMembers.find(m => m.userId === currentUserId);
      if (currentMember) {
        setSelectedMembers([currentMember]);
        initializeSplits([currentMember]);
      }
    }
  }, [isOpen, tripMembers, currentUserId]);

  const initializeSplits = (members) => {
    if (!expense) return;
    
    const equalAmount = expense.amount / members.length;
    const equalPercentage = 100 / members.length;
    
    setCustomSplits(members.map(member => ({
      userId: member.userId,
      email: member.email,
      amount: Number(equalAmount.toFixed(2))
    })));
    
    setPercentageSplits(members.map(member => ({
      userId: member.userId,
      email: member.email,
      percentage: Number(equalPercentage.toFixed(1))
    })));
  };

  const handleMemberToggle = (member) => {
    const isSelected = selectedMembers.some(m => m.userId === member.userId);
    let newMembers;
    
    if (isSelected) {
      newMembers = selectedMembers.filter(m => m.userId !== member.userId);
    } else {
      newMembers = [...selectedMembers, member];
    }
    
    setSelectedMembers(newMembers);
    initializeSplits(newMembers);
  };

  const handleCustomAmountChange = (userId, amount) => {
    setCustomSplits(prev => prev.map(split =>
      split.userId === userId ? { ...split, amount: Number(amount) } : split
    ));
  };

  const handlePercentageChange = (userId, percentage) => {
    setPercentageSplits(prev => prev.map(split =>
      split.userId === userId ? { ...split, percentage: Number(percentage) } : split
    ));
  };

  const getCustomTotal = () => {
    return customSplits.reduce((sum, split) => sum + split.amount, 0);
  };

  const getPercentageTotal = () => {
    return percentageSplits.reduce((sum, split) => sum + split.percentage, 0);
  };

  const handleSplit = async () => {
    if (!expense) return;
    
    try {
      setLoading(true);
      setError('');
      
      let splitData;
      
      switch (splitType) {
        case SPLIT_TYPES.EQUAL:
          splitData = { memberIds: selectedMembers.map(m => m.userId) };
          break;
        case SPLIT_TYPES.CUSTOM:
          splitData = { customSplits };
          break;
        case SPLIT_TYPES.PERCENTAGE:
          splitData = { percentageSplits };
          break;
      }
      
      // Validate split
      validateExpenseSplit(expense.amount, splitType, splitData);
      
      // Call parent handler
      await onSplitExpense(expense, splitType, splitData);
      
      onClose();
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                💰 Split Expense
              </h2>
              <p className="text-white/80">
                {expense.description} - ${expense.amount}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Split Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3">
              How do you want to split this expense?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSplitType(SPLIT_TYPES.EQUAL)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  splitType === SPLIT_TYPES.EQUAL
                    ? 'bg-white/20 text-white border-2 border-white/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                ⚖️ Equal Split
              </button>
              <button
                onClick={() => setSplitType(SPLIT_TYPES.CUSTOM)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  splitType === SPLIT_TYPES.CUSTOM
                    ? 'bg-white/20 text-white border-2 border-white/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                💵 Custom Amount
              </button>
              <button
                onClick={() => setSplitType(SPLIT_TYPES.PERCENTAGE)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  splitType === SPLIT_TYPES.PERCENTAGE
                    ? 'bg-white/20 text-white border-2 border-white/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                📊 Percentage
              </button>
            </div>
          </div>

          {/* Member Selection for Equal Split */}
          {splitType === SPLIT_TYPES.EQUAL && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Select members to split with ({selectedMembers.length} selected)
              </label>
              <div className="space-y-2">
                {tripMembers.map(member => (
                  <div
                    key={member.userId}
                    onClick={() => handleMemberToggle(member)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedMembers.some(m => m.userId === member.userId)
                        ? 'bg-green-500/20 border border-green-400/30'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {member.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white">{member.email}</span>
                    </div>
                    {selectedMembers.some(m => m.userId === member.userId) && (
                      <div className="text-green-400">
                        ✓ ${(expense.amount / selectedMembers.length).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Amount Split */}
          {splitType === SPLIT_TYPES.CUSTOM && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Enter custom amounts for each person
              </label>
              <div className="space-y-3">
                {customSplits.map(split => (
                  <div key={split.userId} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {split.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white text-sm">{split.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/80">$</span>
                      <input
                        type="number"
                        value={split.amount}
                        onChange={(e) => handleCustomAmountChange(split.userId, e.target.value)}
                        className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-right text-sm ${
                Math.abs(getCustomTotal() - expense.amount) < 0.01 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                Total: ${getCustomTotal().toFixed(2)} / ${expense.amount.toFixed(2)}
              </div>
            </div>
          )}

          {/* Percentage Split */}
          {splitType === SPLIT_TYPES.PERCENTAGE && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                Enter percentage for each person
              </label>
              <div className="space-y-3">
                {percentageSplits.map(split => (
                  <div key={split.userId} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {split.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white text-sm">{split.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={split.percentage}
                        onChange={(e) => handlePercentageChange(split.userId, e.target.value)}
                        className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-right"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span className="text-white/80">%</span>
                      <span className="text-white/60 text-sm w-16 text-right">
                        ${((expense.amount * split.percentage) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-right text-sm ${
                Math.abs(getPercentageTotal() - 100) < 0.01 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                Total: {getPercentageTotal().toFixed(1)}% / 100%
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-100 p-3 rounded-lg mb-4">
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSplit}
              disabled={loading || selectedMembers.length === 0}
              className="btn-primary"
            >
              {loading ? '⏳ Splitting...' : '💰 Split Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSplittingModal;