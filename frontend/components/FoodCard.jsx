import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const FoodCard = ({ food, onClick }) => {
    const { FoodName, Category, Status, IconImage, PhysiologyReason } = food;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'danger': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'safe': return <CheckCircle size={16} />;
            case 'warning': return <AlertTriangle size={16} />;
            case 'danger': return <XCircle size={16} />;
            default: return null;
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-3 sm:gap-0`}
        >
            <div className="flex items-center space-x-4">
                <div className="text-3xl">{IconImage || '🍽️'}</div>
                <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{FoodName}</h3>
                    <p className="text-sm text-gray-500">{Category}</p>
                </div>
            </div>
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border self-start sm:self-auto ${getStatusColor(Status)}`}>
                {getStatusIcon(Status)}
                <span className="capitalize">{Status}</span>
            </div>
        </div>
    );
};

export default FoodCard;