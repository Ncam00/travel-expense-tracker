/**
 * ToastContainer Component
 * Displays in-app toast notifications
 */

import React, { useState, useEffect } from 'react';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type = 'info', duration = 3000 } = event.detail;
      
      const toast = {
        id: Date.now() + Math.random(),
        message,
        type,
        duration
      };

      setToasts(prev => [...prev, toast]);

      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, duration);
    };

    window.addEventListener('showToast', handleShowToast);
    
    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type) => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    
    const typeStyles = {
      success: "bg-green-500 text-white border-green-600",
      error: "bg-red-500 text-white border-red-600",
      warning: "bg-yellow-500 text-white border-yellow-600",
      info: "bg-blue-500 text-white border-blue-600"
    };

    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getToastIcon = (type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };
    
    return icons[type] || icons.info;
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-80 max-w-md p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm
            flex items-center gap-3 animate-in slide-in-from-right duration-300
            ${getToastStyles(toast.type)}
          `}
        >
          <div className="text-xl flex-shrink-0">
            {getToastIcon(toast.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;