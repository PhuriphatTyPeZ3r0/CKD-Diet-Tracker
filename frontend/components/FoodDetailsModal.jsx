import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';

const FoodDetailsModal = ({ food, isOpen, onClose, onAddLog }) => {
    if (!isOpen || !food) return null;

    const [portion, setPortion] = useState(1);
    const [mealType, setMealType] = useState('Breakfast');

    const handleAdd = () => {
        onAddLog({ food, portion, mealType });
        onClose();
        setPortion(1);
        setMealType('Breakfast');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {food.IconImage || '🍽️'} {food.FoodName}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="mb-6 space-y-3">
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Physiology & Nutrition</div>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 text-sm">
                        {food.PhysiologyReason || "Monitor your intake carefully based on medical advice."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono text-gray-500">
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-bold">Protein</span>
                            {food.ProteinGram || 0}g
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-bold">Sodium</span>
                            {food.SodiumMg || 0}mg
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-bold">Potassium</span>
                            {food.PotassiumLevel}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <span className="block font-bold">Phosphorus</span>
                            {food.PhosphorusLevel}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Portion (Serving)</label>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setPortion(Math.max(0.5, portion - 0.5))} className="p-1 bg-gray-200 rounded text-gray-700">-</button>
                            <span className="font-bold w-8 text-center">{portion}</span>
                            <button onClick={() => setPortion(portion + 0.5)} className="p-1 bg-gray-200 rounded text-gray-700">+</button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Meal Time</label>
                        <select 
                            value={mealType} 
                            onChange={(e) => setMealType(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleAdd}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus size={20} />
                        Add to Today's Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodDetailsModal;