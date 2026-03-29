'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Globe, LogIn, LogOut, User } from 'lucide-react';
import { useDate } from '../context/DateContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

import { useRouter } from 'next/navigation';

const Header = () => {
    const router = useRouter();
    const { selectedDate, setSelectedDate } = useDate();
    const { language, toggleLanguage, t } = useLanguage();
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) alert(error.message);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) alert(error.message);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
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
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                </div>

                {session ? (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => router.push('/profile')}
                            className="focus:outline-none active:scale-95 transition-transform"
                        >
                            {session.user.user_metadata?.avatar_url ? (
                                <img 
                                    src={session.user.user_metadata.avatar_url} 
                                    alt="User" 
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded-full border border-gray-200 object-cover hover:border-blue-500 transition-colors" 
                                />
                            ) : (
                                <div className="bg-gray-100 p-2 rounded-full border border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center w-8 h-8">
                                    <User size={16} className="text-gray-500" />
                                </div>
                            )}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleLogin}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 shadow-sm active:scale-95"
                    >
                        <LogIn size={16} className="text-blue-600" />
                        <span>Login</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;