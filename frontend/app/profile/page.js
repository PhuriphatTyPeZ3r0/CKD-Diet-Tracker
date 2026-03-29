'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, Scale, Activity, Save, ArrowLeft, Loader2, LogOut, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [session, setSession] = useState(null);

    // Notification State
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Profile & Health Data State
    const [profile, setProfile] = useState({
        username: '',
        first_name: '',
        last_name: '',
        avatar_url: ''
    });

    const [health, setHealth] = useState({
        weight_kg: 0,
        ckd_stage: 3,
        gender: '',
        date_of_birth: ''
    });

    useEffect(() => {
        const getInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }
            setSession(session);
            await fetchUserData(session.user.id);
        };

        getInitialData();
    }, []);

    // Auto-hide notification
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const showNotify = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const fetchUserData = async (userId) => {
        try {
            setLoading(true);
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('account_id', userId)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;
            if (profileData) setProfile(profileData);

            const { data: healthData, error: healthError } = await supabase
                .from('health_data')
                .select('*')
                .eq('account_id', userId)
                .single();

            if (healthError && healthError.code !== 'PGRST116') throw healthError;
            if (healthData) setHealth(healthData);

        } catch (error) {
            console.error('Error fetching user data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!session) return;

        try {
            setSaving(true);
            const userId = session.user.id;

            const { error: pError } = await supabase
                .from('user_profiles')
                .upsert({
                    account_id: userId,
                    username: profile.username,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    updated_at: new Date()
                });

            if (pError) throw pError;

            const { error: hError } = await supabase
                .from('health_data')
                .upsert({
                    account_id: userId,
                    weight_kg: parseFloat(health.weight_kg) || 0,
                    ckd_stage: parseInt(health.ckd_stage) || 3,
                    gender: health.gender,
                    date_of_birth: health.date_of_birth,
                    updated_at: new Date()
                });

            if (hError) throw hError;

            showNotify(t('saveSuccess'), 'success');
        } catch (error) {
            showNotify(t('errorOccurred') + ': ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-medium tracking-wide">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20 md:pb-10 relative">
            
            {/* UIPopup Notification */}
            {notification.show && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-10 duration-300 ${
                    notification.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                    {notification.type === 'success' ? <CheckCircle className="text-emerald-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
                    <span className="font-bold text-sm sm:text-base">{notification.message}</span>
                    <button onClick={() => setNotification({ ...notification, show: false })} className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors">
                        <X size={18} className="opacity-50" />
                    </button>
                </div>
            )}

            {/* Header Area */}
            <div className="flex items-center justify-between gap-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> <span className="hidden sm:inline">{t('back')}</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">{t('profileSettings')}</h1>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all font-bold text-xs uppercase tracking-tighter"
                    title={t('logout')}
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">{t('logout')}</span>
                </button>
            </div>

            {/* Profile Section */}
            <form onSubmit={handleSave} className="space-y-6">
                <section className="bg-white p-5 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        {t('generalInfo')}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-blue-500 transition-colors">{t('username')}</label>
                            <input 
                                type="text"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                value={profile.username || ''}
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                placeholder={t('username')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-300 uppercase ml-1">{t('email')}</label>
                            <input 
                                type="text"
                                disabled
                                className="w-full px-5 py-3.5 bg-gray-100/50 border border-gray-50 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                                value={session?.user?.email || ''}
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-blue-500 transition-colors">{t('firstName')}</label>
                            <input 
                                type="text"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                value={profile.first_name || ''}
                                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-blue-500 transition-colors">{t('lastName')}</label>
                            <input 
                                type="text"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                value={profile.last_name || ''}
                                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                {/* Health Section */}
                <section className="bg-white p-5 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        {t('healthInfo')}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-emerald-500 transition-colors flex items-center gap-1">
                                <Scale size={12} /> {t('currentWeight')}
                            </label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-gray-700 text-lg"
                                value={health.weight_kg || ''}
                                onChange={(e) => setHealth({...health, weight_kg: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-emerald-500 transition-colors">{t('ckdStage')}</label>
                            <select 
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                value={health.ckd_stage || 3}
                                onChange={(e) => setHealth({...health, ckd_stage: e.target.value})}
                            >
                                <option value="1">{t('stage1')}</option>
                                <option value="2">{t('stage2')}</option>
                                <option value="3">{t('stage3')}</option>
                                <option value="4">{t('stage4')}</option>
                                <option value="5">{t('stage5')}</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">{t('gender')}</label>
                            <div className="flex gap-4">
                                {[[t('male'), 'ชาย'], [t('female'), 'หญิง']].map(([label, value]) => (
                                    <label key={value} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm ${
                                        health.gender === value 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                                    }`}>
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            className="hidden"
                                            checked={health.gender === value}
                                            onChange={() => setHealth({...health, gender: value})}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1 group-focus-within:text-emerald-500 transition-colors">{t('dob')}</label>
                            <input 
                                type="date"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                                value={health.date_of_birth || ''}
                                onChange={(e) => setHealth({...health, date_of_birth: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={24} strokeWidth={3} />}
                    {saving ? t('saving') : t('saveAll')}
                </button>
            </form>
        </div>
    );
}
