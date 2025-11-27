import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', disabled = false, ...props }) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#333333] text-white hover:bg-[#1f1f1f] focus:ring-[#333333]',
    secondary: 'bg-[#f5f5f5] text-[#333333] border border-[#d9d9d9] hover:bg-[#e8e8e8] focus:ring-[#333333]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] focus:ring-[#10b981]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#d9d9d9] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

export const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-[#333333] mb-2">{label}</label>}
    <input
      className={`w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
        error ? 'border-[#ef4444] focus:ring-[#ef4444]' : 'border-[#d9d9d9] focus:ring-[#333333]'
      }`}
      {...props}
    />
    {error && <p className="text-[#ef4444] text-sm mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-[#333333] mb-2">{label}</label>}
    <select
      className={`w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
        error ? 'border-[#ef4444] focus:ring-[#ef4444]' : 'border-[#d9d9d9] focus:ring-[#333333]'
      }`}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-[#ef4444] text-sm mt-1">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-[#333333] mb-2">{label}</label>}
    <textarea
      className={`w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
        error ? 'border-[#ef4444] focus:ring-[#ef4444]' : 'border-[#d9d9d9] focus:ring-[#333333]'
      }`}
      rows="4"
      {...props}
    ></textarea>
    {error && <p className="text-[#ef4444] text-sm mt-1">{error}</p>}
  </div>
);

export const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#333333]">{title}</h2>
          <button onClick={onClose} className="text-[#999999] hover:text-[#333333] text-2xl leading-none">
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

export const Loading = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d9d9d9] border-b-[#333333]"></div>
  </div>
);

export const EmptyState = ({ title, description, icon = '📭' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-[#333333] mb-2">{title}</h3>
    <p className="text-[#666666]">{description}</p>
  </div>
);

export const ErrorState = ({ title = 'Error', message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-4xl mb-4">❌</div>
    <h3 className="text-lg font-semibold text-[#333333] mb-2">{title}</h3>
    <p className="text-[#666666] mb-4">{message}</p>
    {onRetry && <Button onClick={onRetry}>Try Again</Button>}
  </div>
);

export const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-[#e8e8e8] text-[#333333]',
    success: 'bg-[#d1fae5] text-[#065f46]',
    error: 'bg-[#fee2e2] text-[#991b1b]',
    warning: 'bg-[#fef3c7] text-[#92400e]',
  };

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>{children}</span>;
};

export const Alert = ({ type = 'info', message }) => {
  const types = {
    info: 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]',
    success: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]',
    error: 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]',
    warning: 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]',
  };

  return (
    <div className={`border rounded-lg p-4 ${types[type]}`}>
      {message}
    </div>
  );
};
