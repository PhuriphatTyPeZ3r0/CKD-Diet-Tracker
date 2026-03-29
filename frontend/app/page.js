'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ChevronRight, PieChart, Info, Plus } from 'lucide-react';
import { useDate } from '../context/DateContext';
import { useLanguage } from '../context/LanguageContext';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import DailyRecommendationModal from '../components/DailyRecommendationModal';
import { supabase } from '../lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const { selectedDate } = useDate();
  const { language, t } = useLanguage();
  const [foods, setFoods] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [macros, setMacros] = useState({ totalProtein: 0, totalSodium: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [recommendedFood, setRecommendedFood] = useState(null);

  // Risk Alerts
  const [riskAlerts, setRiskAlerts] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchFoods();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedDate && session?.user?.id) {
      fetchDailyLogs(selectedDate, session.user.id);
    } else if (selectedDate && !session) {
      setDailyLogs([]);
      setMacros({ totalProtein: 0, totalSodium: 0 });
    }
  }, [selectedDate, session]);

  // Daily Recommendation Logic
  useEffect(() => {
    if (foods.length > 0 && !recommendedFood) {
      const safeFoods = foods.filter(f => f.Status === 'safe' && f.PhosphorusLevel === 'Low');
      if (safeFoods.length > 0) {
        const randomFood = safeFoods[Math.floor(Math.random() * safeFoods.length)];
        setRecommendedFood(randomFood);
        setIsRecModalOpen(true);
      }
    }
  }, [foods]);

  // Date Formatting Helper
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/foods`);
      if (!res.ok) throw new Error('Failed to fetch foods');
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyLogs = async (date, userId) => {
    try {
      const res = await fetch(`${API_URL}/api/eat-logs?userId=${userId}&date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setDailyLogs(data.logs);
      setMacros(data.macros);
      checkRiskAlerts(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const checkRiskAlerts = (logs) => {
    const alerts = [];
    const hasHighPotassium = logs.some(log => log.PotassiumLevel === 'High');
    const hasHighPhosphorus = logs.some(log => log.PhosphorusLevel === 'High');

    if (hasHighPotassium) alerts.push(t('healthAlertPotassium'));
    if (hasHighPhosphorus) alerts.push(t('healthAlertPhosphorus'));
    
    setRiskAlerts(alerts);
  };

  const handleAddLog = async ({ food, portion, mealType }) => {
     if (!session?.user?.id) {
       alert(t('loginPrompt'));
       return;
     }

     try {
       const res = await fetch(`${API_URL}/api/eat-logs`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           UserId: session.user.id,
           EatDate: selectedDate,
           FoodId: food.FoodId,
           MealType: mealType,
           Portion: portion
         })
       });

       if (!res.ok) throw new Error('Failed to save log');
       const data = await res.json();
       
       setDailyLogs(data.logs); 
       setMacros(data.macros);
       checkRiskAlerts(data.logs);
       
     } catch (err) {
       alert(err.message);
     }
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setIsDetailsModalOpen(true);
  };

  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchesSearch = food.FoodName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || food.Category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || food.Status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [foods, searchTerm, categoryFilter, statusFilter]);

  const proteinGoal = 42;
  const proteinProgress = Math.min(100, (macros.totalProtein / proteinGoal) * 100);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-20 lg:pb-10">
      {/* Left Column: Food Search & List */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Search className="text-blue-500" size={24} /> {t('foodDatabase')}
                </h2>
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Info size={14} /> {t('itemsLogged')}: {foods.length}
                </div>
            </div>
            
            <div className="space-y-4 mb-6 sm:mb-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('searchPlaceholder')} 
                        className="pl-12 pr-4 py-3 sm:py-4 w-full border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm bg-gray-50/50 hover:bg-white text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl bg-gray-50/50 appearance-none cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-sm transition-all"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">{t('allCategories')}</option>
                            <option value="โปรตีน">{t('catProtein')}</option>
                            <option value="คาร์โบไฮเดรต">{t('catCarbs')}</option>
                            <option value="ผัก">{t('catVeg')}</option>
                            <option value="ผลไม้">{t('catFruit')}</option>
                            <option value="เครื่องปรุง">{t('catCondiment')}</option>
                        </select>
                    </div>
                    
                    <div className="relative flex-1">
                        <select 
                            className="px-4 py-3 w-full border border-gray-200 rounded-xl bg-gray-50/50 appearance-none cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 text-sm transition-all"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">{t('allStatus')}</option>
                            <option value="safe">{t('statusSafe')}</option>
                            <option value="warning">{t('statusWarning')}</option>
                            <option value="danger">{t('statusDanger')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 text-blue-500 animate-pulse">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="font-bold">{t('loading')}</span>
                </div>
            ) : error ? (
                <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-2">
                   <AlertTriangle size={40} />
                   <span className="font-bold">Error: {error}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {filteredFoods.map(food => (
                        <FoodCard 
                            key={food.FoodId} 
                            food={food} 
                            onClick={() => handleFoodClick(food)} 
                        />
                    ))}
                    {filteredFoods.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
                            <Search size={40} className="text-gray-200" />
                            <span className="font-medium">{t('noFoodsFound')}</span>
                        </div>
                    )}
                </div>
            )}
        </section>
      </div>

      {/* Right Column: Daily Log & Stats */}
      <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-pulse border-y border-r border-red-100">
                <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                        <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-700">{t('healthWarning')}</h4>
                        {riskAlerts.map((alert, idx) => (
                            <p key={idx} className="text-sm text-red-600 mt-1 font-medium leading-tight">{alert}</p>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Macro Progress */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-500"/> {t('dailyNutrition')}
                </h3>
                
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-3 items-end">
                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">{t('totalProtein')}</span>
                        <div className="flex flex-col items-end">
                            <span className="font-black text-3xl text-blue-600 leading-none">{macros.totalProtein.toFixed(1)}</span>
                            <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">/ {proteinGoal} {t('unitG')}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden p-1 shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${proteinProgress > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} 
                            style={{ width: `${proteinProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             {t('goal')}
                        </p>
                        <p className={`text-[10px] font-black px-2 py-0.5 rounded ${proteinProgress > 100 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {proteinProgress.toFixed(0)}%
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('sodiumIntake')}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-black text-xl text-gray-800">{macros.totalSodium.toFixed(0)}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{t('unitMg')}</span>
                        </div>
                     </div>
                     <div className="flex flex-col border-l border-gray-100 pl-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('itemsLogged')}</span>
                        <span className="font-black text-xl text-gray-800">{dailyLogs.length}</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Daily Log List */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit max-h-[500px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                    <span>{t('todayLog')}</span>
                 </div>
                 <span className="bg-gray-50 text-gray-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                    {formatDisplayDate(selectedDate)}
                 </span>
            </h3>
            
            <div className="overflow-y-auto pr-1 custom-scrollbar">
                {dailyLogs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-3">
                        <div className="bg-white p-4 rounded-full shadow-sm text-gray-200">
                             <Plus size={32} />
                        </div>
                        <p className="font-medium px-6 leading-relaxed">
                            {t('noLogsYet')}<br/>
                            <span className="text-xs text-gray-300">{t('selectFoodToAdd')}</span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dailyLogs.map((log) => (
                            <div key={log.LogId} className="flex justify-between items-center p-3 hover:bg-blue-50/30 rounded-xl border border-gray-50 hover:border-blue-100 transition-all cursor-default group">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl bg-gray-50 p-2 rounded-xl group-hover:bg-white text-center w-12 h-12 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                                        {log.food_list?.IconImage || '🍽️'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">{log.food_list?.FoodName}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                            <span className="bg-white px-2 py-0.5 rounded shadow-sm text-blue-500 uppercase tracking-tighter">
                                                {log.MealType === 'Breakfast' ? t('breakfast') : 
                                                 log.MealType === 'Lunch' ? t('lunch') : 
                                                 log.MealType === 'Dinner' ? t('dinner') : t('snack')}
                                            </span>
                                            <span className="text-gray-200">•</span>
                                            <span className="uppercase">{log.Portion} {t('portion')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors">{((log.food_list?.ProteinGram || 0) * log.Portion).toFixed(1)}{t('unitG')} P</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{((log.food_list?.SodiumMg || 0) * log.Portion).toFixed(0)}{t('unitMg')} Na</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Modals */}
      <FoodDetailsModal 
        food={selectedFood}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onAddLog={(data) => handleAddLog({ food: selectedFood, ...data })}
      />

      <DailyRecommendationModal 
         food={recommendedFood}
         isOpen={isRecModalOpen}
         onClose={() => setIsRecModalOpen(false)}
         onAddLog={(food) => {
             setSelectedFood(food);
             setIsDetailsModalOpen(true);
         }}
      />
    </div>
  );
}
