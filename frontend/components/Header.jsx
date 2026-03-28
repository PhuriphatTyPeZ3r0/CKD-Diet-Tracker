'use client';

import React from 'react';
import { Calendar, Globe } from 'lucide-react';
import { useDate } from '../context/DateContext';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
    const { selectedDate, setSelectedDate } = useDate();
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Calendar size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('appTitle')}</h1>
                    <p className="text-[10px] text-gray-400 font-medium hidden sm:block -mt-1">{t('appSubtitle')}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-black text-gray-600 shadow-sm active:scale-95 bg-white"
                >
                    <Globe size={14} className="text-blue-500" />
                    <span className="tracking-wider">{language === 'th' ? 'TH / EN' : 'EN / TH'}</span>
                </button>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 font-medium hidden md:inline">{t('dateTime')}:</span>
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;