import React, { useState } from 'react';
import { X, Plus, Clock, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FoodDetailsModal = ({ food, isOpen, onClose, onAddLog }) => {
    const { t } = useLanguage();
    const [portion, setPortion] = useState(1);
    const [mealType, setMealType] = useState('Breakfast');

    if (!isOpen || !food) return null;

    const handleAdd = () => {
        onAddLog({ food, portion, mealType });
        onClose();
        setPortion(1);
        setMealType('Breakfast');
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'safe': return <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{t('safe')}</span>;
            case 'warning': return <span className="text-amber-500 font-bold uppercase tracking-widest text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{t('warning')}</span>;
            case 'danger': return <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-200">{t('danger')}</span>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                            <div className="text-5xl bg-slate-50 p-3 rounded-2xl">{food.IconImage || '🍽️'}</div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{food.FoodName}</h2>
                                <div className="mt-1">{getStatusIcon(food.Status)}</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Info size={16} className="text-blue-500" />
                                {t('physiologyReason')}
                            </h4>
                            <p className="text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm leading-relaxed italic">
                                "{food.PhysiologyReason || t('monitorIntakeCarefully')}"
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('protein')}</span>
                                <span className="text-lg font-bold text-slate-700">{food.ProteinGram || 0}<span className="text-xs font-medium text-slate-400 ml-0.5">{t('unitG')}</span></span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('sodium')}</span>
                                <span className="text-lg font-bold text-slate-700">{food.SodiumMg || 0}<span className="text-xs font-medium text-slate-400 ml-0.5">{t('unitMg')}</span></span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('potassium')}</span>
                                <span className="text-sm font-bold text-slate-700">{t(food.PotassiumLevel?.toLowerCase()) || food.PotassiumLevel}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('phosphorus')}</span>
                                <span className="text-sm font-bold text-slate-700">{t(food.PhosphorusLevel?.toLowerCase()) || food.PhosphorusLevel}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">{t('portion')} ({t('unitG')})</label>
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button onClick={() => setPortion(Math.max(0.5, portion - 0.5))} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-blue-600 font-bold transition-colors">-</button>
                                    <span className="font-bold w-12 text-center text-slate-800">{portion}</span>
                                    <button onClick={() => setPortion(portion + 0.5)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-blue-600 font-bold transition-colors">+</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">{t('mealType')}</label>
                                <select 
                                    value={mealType} 
                                    onChange={(e) => setMealType(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="Breakfast">{t('breakfast')}</option>
                                    <option value="Lunch">{t('lunch')}</option>
                                    <option value="Dinner">{t('dinner')}</option>
                                    <option value="Snack">{t('snack')}</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleAdd}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                            >
                                <Plus size={20} strokeWidth={3} />
                                {t('add')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetailsModal;