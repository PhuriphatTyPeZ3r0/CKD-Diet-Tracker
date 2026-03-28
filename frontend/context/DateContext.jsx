'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const getNow = () => {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now - offset).toISOString().slice(0, 16);
        };
        setSelectedDate(getNow());
    }, []);

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => useContext(DateContext);