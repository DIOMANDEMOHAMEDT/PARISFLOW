
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-border-color p-4 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-accent" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl font-bold text-white">PariFlow Pro</h1>
      </div>
    </header>
  );
};

export default Header;
