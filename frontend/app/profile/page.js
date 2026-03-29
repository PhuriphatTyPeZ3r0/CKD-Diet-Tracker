'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, Scale, Activity, Save, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [session, setSession] = useState(null);

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
                router.push('/'); // Redirect if not logged in
                return;
            }
            setSession(session);
            await fetchUserData(session.user.id);
        };

        getInitialData();
    }, []);

    const fetchUserData = async (userId) => {
        try {
            setLoading(true);
            
            // Fetch User Profile
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('account_id', userId)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;
            if (profileData) setProfile(profileData);

            // Fetch Health Data
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

            // Update user_profiles
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

            // Update health_data
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

            alert('บันทึกข้อมูลสำเร็จ!');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
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
                <p className="font-medium">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> {t('back')}
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{t('profileSettings') || 'ตั้งค่าโปรไฟล์'}</h1>
                <button 
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Profile Section */}
            <form onSubmit={handleSave} className="space-y-6">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="text-blue-500" size={20} /> ข้อมูลทั่วไป
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Username</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={profile.username || ''}
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">อีเมล</label>
                            <input 
                                type="text"
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                                value={session?.user?.email || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">ชื่อจริง</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={profile.first_name || ''}
                                onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">นามสกุล</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={profile.last_name || ''}
                                onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                {/* Health Section */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} /> ข้อมูลสุขภาพ (สำคัญ)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Scale size={14} /> น้ำหนักปัจจุบัน (กก.)
                            </label>
                            <input 
                                type="number"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={health.weight_kg || ''}
                                onChange={(e) => setHealth({...health, weight_kg: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">ระยะโรคไต (CKD Stage)</label>
                            <select 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={health.ckd_stage || 3}
                                onChange={(e) => setHealth({...health, ckd_stage: e.target.value})}
                            >
                                <option value="1">ระยะที่ 1 (ไตปกติแต่เริ่มเสื่อม)</option>
                                <option value="2">ระยะที่ 2 (ไตเสื่อมเล็กน้อย)</option>
                                <option value="3">ระยะที่ 3 (ไตเสื่อมปานกลาง)</option>
                                <option value="4">ระยะที่ 4 (ไตเสื่อมรุนแรง)</option>
                                <option value="5">ระยะที่ 5 (ไตวายเรื้อรัง)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">เพศ</label>
                            <div className="flex gap-4">
                                {['ชาย', 'หญิง'].map((g) => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            className="w-4 h-4 text-blue-600"
                                            checked={health.gender === g}
                                            onChange={() => setHealth({...health, gender: g})}
                                        />
                                        <span className="text-sm text-gray-700">{g}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">วันเกิด</label>
                            <input 
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={health.date_of_birth || ''}
                                onChange={(e) => setHealth({...health, date_of_birth: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
                </button>
            </form>
        </div>
    );
}
