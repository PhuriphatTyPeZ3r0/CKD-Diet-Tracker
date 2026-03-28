'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    th: {
        appTitle: "CKD Diet Tracker",
        appSubtitle: "โภชนบำบัดโรคไตระยะ 3",
        dateTime: "วันที่และเวลา",
        foodDatabase: "ฐานข้อมูลอาหาร",
        searchPlaceholder: "ค้นหาอาหาร (เช่น ไข่, ปลา)...",
        allCategories: "ทุกหมวดหมู่",
        catProtein: "โปรตีน",
        catCarbs: "คาร์โบไฮเดรต",
        catVeg: "ผัก",
        catFruit: "ผลไม้",
        catCondiment: "เครื่องปรุง",
        allStatus: "ทุกสถานะ",
        statusSafe: "ปลอดภัย (สีเขียว)",
        statusWarning: "ควรระวัง (สีเหลือง)",
        statusDanger: "อันตราย (สีแดง)",
        loading: "กำลังโหลดข้อมูลอาหาร...",
        noFoodsFound: "ไม่พบอาหารที่ตรงกับตัวกรองของคุณ",
        healthWarning: "คำเตือนด้านสุขภาพ",
        dailyNutrition: "โภชนาการรายวัน",
        goal: "เป้าหมาย",
        totalProtein: "โปรตีนรวม",
        consumed: "ของปริมาณที่ควรได้รับต่อวัน",
        sodiumIntake: "ปริมาณโซเดียม",
        itemsLogged: "รายการที่บันทึก",
        todayLog: "บันทึกของวันนี้",
        noLogsYet: "ยังไม่มีการบันทึกอาหาร",
        selectFoodToAdd: "เลือกอาหารจากรายการเพื่อเพิ่ม",
        portion: "ส่วน",
        mealType: "มื้ออาหาร",
        breakfast: "มื้อเช้า",
        lunch: "มื้อกลางวัน",
        dinner: "มื้อเย็น",
        snack: "มื้อว่าง",
        close: "ปิด",
        add: "เพิ่ม",
        save: "บันทึก",
        cancel: "ยกเลิก",
        protein: "โปรตีน",
        sodium: "โซเดียม",
        potassium: "โพแทสเซียม",
        phosphorus: "ฟอสฟอรัส",
        high: "สูง",
        medium: "ปานกลาง",
        low: "ต่ำ",
        safe: "ปลอดภัย",
        warning: "ควรระวัง",
        danger: "อันตราย",
        physiologyReason: "คำอธิบายทางการแพทย์",
        dailyRecommendation: "เมนูแนะนำวันนี้ 🌟",
        safeToEat: "ทานได้อย่างปลอดภัย ไม่ทำร้ายไต",
        enterSearch: "เข้าสู่ระบบค้นหาอาหาร",
        healthAlertPotassium: "พบการบริโภคโพแทสเซียมสูงในวันนี้ โปรดติดตามการทานผลไม้/ผักของคุณ",
        healthAlertPhosphorus: "พบการบริโภคฟอสฟอรัสสูง หลีกเลี่ยงผลิตภัณฑ์นม ถั่ว และเนื้อสัตว์แปรรูป",
        safeToEatDesc: "อาหารชนิดนี้มีปริมาณแร่ธาตุอยู่ในเกณฑ์เหมาะสม และไม่เพิ่มภาระของเสียให้ไตมากเกินไป",
        warningToEatDesc: "อาหารชนิดนี้ทานได้ในปริมาณจำกัด ควรพิจารณาระดับโพแทสเซียมหรือคำแนะนำจากแพทย์ร่วมด้วย",
        dangerToEatDesc: "อาหารชนิดนี้มีความเสี่ยงเพิ่มภาระต่อไตหรือรบกวนสมดุลแร่ธาตุ จึงควรหลีกเลี่ยง",
        safeToEatTitle: "ทานได้อย่างปลอดภัย",
        warningToEatTitle: "ทานได้แต่ต้องระวังปริมาณ",
        dangerToEatTitle: "อันตรายต่อไต ห้ามทานเด็ดขาด",
        addLogSuccess: "บันทึกเรียบร้อยแล้ว",
        unitG: "กรัม",
        unitMg: "มก.",
        language: "ภาษา"
    },
    en: {
        appTitle: "CKD Diet Tracker",
        appSubtitle: "Kidney Diet Therapy Stage 3",
        dateTime: "Date & Time",
        foodDatabase: "Food Database",
        searchPlaceholder: "Search food (e.g. egg, fish)...",
        allCategories: "All Categories",
        catProtein: "Protein",
        catCarbs: "Carbs",
        catVeg: "Vegetables",
        catFruit: "Fruits",
        catCondiment: "Condiments",
        allStatus: "All Status",
        statusSafe: "Safe (Green)",
        statusWarning: "Warning (Yellow)",
        statusDanger: "Danger (Red)",
        loading: "Loading food data...",
        noFoodsFound: "No foods found matching your filters.",
        healthWarning: "Health Warning",
        dailyNutrition: "Daily Nutrition",
        goal: "Goal",
        totalProtein: "Total Protein",
        consumed: "of daily quota consumed",
        sodiumIntake: "Sodium Intake",
        itemsLogged: "Items Logged",
        todayLog: "Today's Log",
        noLogsYet: "No foods logged yet.",
        selectFoodToAdd: "Select a food from the list to add.",
        portion: "portion",
        mealType: "Meal Type",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack",
        close: "Close",
        add: "Add",
        save: "Save",
        cancel: "Cancel",
        protein: "Protein",
        sodium: "Sodium",
        potassium: "Potassium",
        phosphorus: "Phosphorus",
        high: "High",
        medium: "Medium",
        low: "Low",
        safe: "Safe",
        warning: "Warning",
        danger: "Danger",
        physiologyReason: "Physiology Reason",
        dailyRecommendation: "Daily Recommendation 🌟",
        safeToEat: "Safe to eat, won't harm your kidneys",
        enterSearch: "Enter Food Search",
        healthAlertPotassium: "High Potassium intake detected today. Please monitor your fruit/vegetable intake.",
        healthAlertPhosphorus: "High Phosphorus intake detected. Avoid dairy, nuts, and processed meats.",
        safeToEatDesc: "This food has mineral levels within appropriate ranges and does not overburden the kidneys with waste.",
        warningToEatDesc: "This food can be eaten in limited amounts. Consider potassium levels or medical advice.",
        dangerToEatDesc: "This food risks increasing the burden on kidneys or disrupting mineral balance. Should be avoided.",
        safeToEatTitle: "Safe to eat",
        warningToEatTitle: "Eat with caution/limited amount",
        dangerToEatTitle: "Dangerous to kidneys, strictly avoid",
        addLogSuccess: "Log added successfully",
        unitG: "g",
        unitMg: "mg",
        language: "Language"
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('th');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'th' ? 'en' : 'th'));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
