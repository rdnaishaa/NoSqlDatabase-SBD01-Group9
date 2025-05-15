import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">E-Learning Platform</h3>
            <p className="text-gray-300 mt-1">Learn at your own pace</p>
          </div>
          
          <div className="text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} E-Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;