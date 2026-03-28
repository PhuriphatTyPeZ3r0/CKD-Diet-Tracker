import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DailyRecommendationModal = ({ food, isOpen, onClose, onAddLog }) => {
    const { t } = useLanguage();
    if (!isOpen || !food) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
                    <button 
                        onClick={onClose} 
                        className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                    <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-4 animate-bounce">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-black mb-1">{t('dailyRecommendation')}</h2>
                    <p className="text-emerald-50 text-sm font-medium opacity-90">{t('safeToEat')}</p>
                </div>

                <div className="p-8 text-center">
                    <div className="text-7xl mb-6 drop-shadow-lg">{food.IconImage || '🍎'}</div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-2">{food.FoodName}</h3>
                    <div className="inline-flex bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-200">
                        {t('safe')}
                    </div>

                    <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
                        {food.PhysiologyReason || t('safeToEatDesc')}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onClose}
                            className="py-3.5 px-6 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors border border-slate-100"
                        >
                            {t('close')}
                        </button>
                        {onAddLog && (
                            <button 
                                onClick={() => { onAddLog(food); onClose(); }}
                                className="py-3.5 px-6 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                            >
                                <ExternalLink size={18} strokeWidth={3} />
                                {t('add')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyRecommendationModal;