'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ChevronRight, PieChart } from 'lucide-react';
import { useDate } from '../context/DateContext';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import DailyRecommendationModal from '../components/DailyRecommendationModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const { selectedDate } = useDate();
  const [foods, setFoods] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [macros, setMacros] = useState({ totalProtein: 0, totalSodium: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchFoods();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyLogs(selectedDate);
    }
  }, [selectedDate]);

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
    return new Intl.DateTimeFormat('th-TH', {
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

  const fetchDailyLogs = async (date) => {
    try {
      const res = await fetch(`${API_URL}/api/eat-logs?userId=1&date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setDailyLogs(data.logs);
      setMacros(data.macros);
      checkRiskAlerts(data.logs);
    } catch (err) {
      console.error(err);
      // Don't block UI if log fetch fails (e.g. backend down)
    }
  };

  const checkRiskAlerts = (logs) => {
    const alerts = [];
    const hasHighPotassium = logs.some(log => log.PotassiumLevel === 'High');
    const hasHighPhosphorus = logs.some(log => log.PhosphorusLevel === 'High');

    if (hasHighPotassium) alerts.push("High Potassium intake detected today. Please monitor your fruit/vegetable intake.");
    if (hasHighPhosphorus) alerts.push("High Phosphorus intake detected. Avoid dairy, nuts, and processed meats.");
    
    setRiskAlerts(alerts);
  };

  const handleAddLog = async ({ food, portion, mealType }) => {
     try {
       const res = await fetch(`${API_URL}/api/eat-logs`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           UserId: 1,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Food Search & List */}
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Food Database</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search food (e.g. egg, fish)..." 
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-gray-700 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <select 
                            className="pl-9 pr-8 py-2 w-full border border-gray-200 rounded-lg bg-white appearance-none cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="โปรตีน">Protein</option>
                            <option value="คาร์โบไฮเดรต">Carbs</option>
                            <option value="ผัก">Vegetables</option>
                            <option value="ผลไม้">Fruits</option>
                            <option value="เครื่องปรุง">Condiments</option>
                        </select>
                    </div>
                    
                    <select 
                        className="px-4 py-2 w-full sm:w-auto border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="safe">Safe (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="danger">Danger (Red)</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 text-blue-500 animate-pulse">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                    Loading food data...
                </div>
            ) : error ? (
                <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                   Error: {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFoods.map(food => (
                        <FoodCard 
                            key={food.FoodId} 
                            food={food} 
                            onClick={() => handleFoodClick(food)} 
                        />
                    ))}
                    {filteredFoods.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No foods found matching your filters.
                        </div>
                    )}
                </div>
            )}
        </section>
      </div>

      {/* Right Column: Daily Log & Stats */}
      <div className="space-y-6">
        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
                <div className="flex items-start">
                    <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-red-700">Health Warning</h4>
                        {riskAlerts.map((alert, idx) => (
                            <p key={idx} className="text-sm text-red-600 mt-1">{alert}</p>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Macro Progress */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-blue-500"/> Daily Nutrition
                <span className="text-xs font-normal text-gray-400 ml-auto">Goal: {proteinGoal}g Protein</span>
            </h3>
            
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2 items-end">
                    <span className="font-medium text-gray-600">Total Protein</span>
                    <span className="font-bold text-2xl text-blue-600">{macros.totalProtein.toFixed(1)} <span className="text-sm text-gray-400 font-normal">/ {proteinGoal}g</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${proteinProgress > 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
                        style={{ width: `${proteinProgress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">
                    {proteinProgress.toFixed(0)}% of daily quota consumed
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                 <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Sodium Intake</div>
                    <div className="font-bold text-gray-800 text-lg">{macros.totalSodium.toFixed(0)} <span className="text-sm text-gray-400 font-normal">mg</span></div>
                 </div>
                 <div className="text-center border-l border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Items Logged</div>
                    <div className="font-bold text-gray-800 text-lg">{dailyLogs.length}</div>
                 </div>
            </div>
        </div>

        {/* Daily Log List */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
                 <span>Today's Log</span>
                 <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{formatDisplayDate(selectedDate)}</span>
            </h3>
            
            {dailyLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No foods logged yet.<br/>
                    Select a food from the list to add.
                </div>
            ) : (
                <div className="space-y-3">
                    {dailyLogs.map((log) => (
                        <div key={log.LogId} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-all cursor-default group">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl bg-gray-50 p-2 rounded-lg group-hover:bg-white text-center w-10 h-10 flex items-center justify-center">
                                    {log.IconImage || '🍽️'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">{log.FoodName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{log.MealType}</span>
                                        <span>•</span>
                                        <span>{log.Portion} portion</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-blue-600">{((log.ProteinGram || 0) * log.Portion).toFixed(1)}g P</div>
                                <div className="text-[10px] text-gray-400">{log.SodiumMg || 0}mg Na</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
