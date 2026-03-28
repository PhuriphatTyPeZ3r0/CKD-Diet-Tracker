'use client';

import React, { createContext, useContext, useState } from 'react';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => useContext(DateContext);