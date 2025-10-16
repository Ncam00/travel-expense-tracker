import React, { useState, useEffect } from 'react';
import { 
  getTripFinancialSummary, 
  markSettlementCompleted 
} from '../services/expenseSplittingService';
import { useAuth } from '../context/AuthContext';

const DebtSettlementDashboard = ({ tripId, onUpdate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settlingPayment, setSettlingPayment] = useState(null);

  useEffect(() => {
    if (tripId) {
      loadFinancialSummary();
    }
  }, [tripId]);

  const loadFinancialSummary = async () => {
    try {
      setLoading(true);
      const data = await getTripFinancialSummary(tripId);
      setSummary(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSettled = async (settlement) => {
    if (!window.confirm(`Mark payment of $${settlement.amount} as completed?`)) {
      return;
    }

    try {
      setSettlingPayment(settlement);
      await markSettlementCompleted(
        tripId, 
        settlement.fromUserId, 
        settlement.toUserId, 
        settlement.amount
      );
      await loadFinancialSummary();
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(error.message);
    } finally {
      setSettlingPayment(null);
    }
  };

  const getMySettlements = () => {
    if (!summary || !user) return { paying: [], receiving: [] };
    
    const paying = summary.settlements.filter(s => 
      s.fromUserId === user.uid && s.status === 'pending'
    );
    const receiving = summary.settlements.filter(s => 
      s.toUserId === user.uid && s.status === 'pending'
    );
    
    return { paying, receiving };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="card-solid p-6 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading financial summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-solid p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { paying, receiving } = getMySettlements();
  const userBalance = summary.balances.find(b => b.userId === user.uid);

  return (
    <div className="space-y-6">
      {/* Trip Overview */}
      <div className="card-solid p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          💰 Financial Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Total Spent</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(summary.totalSpent)}
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Budget Remaining</div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(summary.remainingBudget)}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-600">Pending Settlements</div>
            <div className="text-2xl font-bold text-yellow-900">
              {summary.pendingSettlements}
            </div>
          </div>
          
          <div className={`border rounded-lg p-4 ${
            summary.isFullySettled 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`text-sm font-medium ${
              summary.isFullySettled ? 'text-green-600' : 'text-red-600'
            }`}>
              Status
            </div>
            <div className={`text-2xl font-bold ${
              summary.isFullySettled ? 'text-green-900' : 'text-red-900'
            }`}>
              {summary.isFullySettled ? '✅ Settled' : '⏳ Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* My Balance */}
      {userBalance && (
        <div className="card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 My Balance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">I Paid</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(userBalance.totalPaid)}
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">I Owe</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(userBalance.totalOwed)}
              </div>
            </div>
            
            <div className={`border rounded-lg p-4 ${
              userBalance.netBalance > 0 
                ? 'bg-green-50 border-green-200' 
                : userBalance.netBalance < 0
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-sm font-medium ${
                userBalance.netBalance > 0 
                  ? 'text-green-600' 
                  : userBalance.netBalance < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                Net Balance
              </div>
              <div className={`text-xl font-bold ${
                userBalance.netBalance > 0 
                  ? 'text-green-900' 
                  : userBalance.netBalance < 0
                  ? 'text-red-900'
                  : 'text-gray-900'
              }`}>
                {formatCurrency(Math.abs(userBalance.netBalance))}
                {userBalance.netBalance > 0 && ' (you\'re owed)'}
                {userBalance.netBalance < 0 && ' (you owe)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Payments */}
      {(paying.length > 0 || receiving.length > 0) && (
        <div className="card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💸 My Settlements
          </h3>
          
          {/* I Need to Pay */}
          {paying.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-red-700 mb-3">
                💳 I Need to Pay ({paying.length})
              </h4>
              <div className="space-y-2">
                {paying.map((settlement, index) => (
                  <div 
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-red-900">
                        Pay {settlement.toEmail}
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {formatCurrency(settlement.amount)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkSettled(settlement)}
                      disabled={settlingPayment?.fromUserId === settlement.fromUserId}
                      className="btn-primary bg-red-600 hover:bg-red-700"
                    >
                      {settlingPayment?.fromUserId === settlement.fromUserId 
                        ? '⏳ Marking...' 
                        : '✅ Mark as Paid'
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* I Will Receive */}
          {receiving.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-green-700 mb-3">
                💰 I Will Receive ({receiving.length})
              </h4>
              <div className="space-y-2">
                {receiving.map((settlement, index) => (
                  <div 
                    key={index}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-green-900">
                        From {settlement.fromEmail}
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(settlement.amount)}
                      </div>
                    </div>
                    <div className="text-green-600 text-sm">
                      ⏳ Waiting for payment
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Settlements */}
      {summary.settlements.length > 0 && (
        <div className="card-solid p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔄 All Settlements
          </h3>
          
          <div className="space-y-3">
            {summary.settlements.map((settlement, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 flex justify-between items-center ${
                  settlement.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {settlement.status === 'completed' ? '✅' : '⏳'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {settlement.fromEmail} → {settlement.toEmail}
                    </div>
                    <div className="text-xl font-bold text-gray-700">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                </div>
                
                <div className={`text-sm ${
                  settlement.status === 'completed' 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {settlement.status === 'completed' 
                    ? `Completed ${settlement.settledAt?.toDate().toLocaleDateString()}`
                    : 'Pending'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fully Settled Message */}
      {summary.isFullySettled && (
        <div className="card-solid p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            All Settled!
          </h3>
          <p className="text-gray-600">
            Everyone has been paid back. Great job managing your trip expenses!
          </p>
        </div>
      )}
    </div>
  );
};

export default DebtSettlementDashboard;