import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

const DailyRecommendationModal = ({ food, isOpen, onClose, onAddLog }) => {
    if (!isOpen || !food) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🌟 Recommended Today
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="text-6xl mb-4">{food.IconImage || '🍎'}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{food.FoodName}</h3>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                        Safe Choice
                    </div>
                </div>

                <p className="text-gray-600 mb-6 text-center">
                    {food.PhysiologyReason || "This food is low in potassium and phosphorus, making it an excellent choice for your diet today."}
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {onAddLog && (
                        <button 
                            onClick={() => { onAddLog(food); onClose(); }}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={18} />
                            Add to Log
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyRecommendationModal;