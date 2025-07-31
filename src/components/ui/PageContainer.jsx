import React from 'react';

const PageContainer = ({ children, title, subtitle, className = "" }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;