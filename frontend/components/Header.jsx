'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useDate } from '../context/DateContext';

const Header = () => {
    const { selectedDate, setSelectedDate } = useDate();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Calendar size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">CKD Diet Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 font-medium hidden sm:inline">Date:</span>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
            </div>
        </header>
    );
};

export default Header;