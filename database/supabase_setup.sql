    -- Supabase/PostgreSQL Setup Script
    -- This script is designed to be run in the Supabase SQL editor.

    -- =======================================================
    -- 1. Enum Types (For better data consistency)
    -- =======================================================
    -- Drop types if they exist to allow for re-running the script
    DROP TYPE IF EXISTS food_status CASCADE;
    DROP TYPE IF EXISTS nutrient_level CASCADE;
    DROP TYPE IF EXISTS meal_type CASCADE;

    CREATE TYPE food_status AS ENUM ('safe', 'warning', 'danger');
    CREATE TYPE nutrient_level AS ENUM ('Low', 'Medium', 'High');
    CREATE TYPE meal_type AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snack');


    -- =======================================================
    -- 2. Table: USERS (ข้อมูลผู้ป่วย)
    -- =======================================================
    CREATE TABLE IF NOT EXISTS USERS (
        UserId SERIAL PRIMARY KEY,
        Username VARCHAR(100) NOT NULL,
        WeightKg NUMERIC(5,2) NOT NULL,
        CKD_Stage INT DEFAULT 3,
        CreatedAt TIMESTAMPTZ DEFAULT NOW()
    );


    -- =======================================================
    -- 3. Table: FOOD_LIST (ฐานข้อมูลอาหาร)
    -- =======================================================
    CREATE TABLE IF NOT EXISTS FOOD_LIST (
        FoodId SERIAL PRIMARY KEY,
        FoodName VARCHAR(255) NOT NULL,
        Category VARCHAR(50) NOT NULL,
        Status food_status NOT NULL,
        PhysiologyReason TEXT,
        IconImage VARCHAR(50),
        
        ProteinGram NUMERIC(5,2) DEFAULT 0,
        SodiumMg NUMERIC(8,2) DEFAULT 0,
        PotassiumLevel nutrient_level DEFAULT 'Low',
        PhosphorusLevel nutrient_level DEFAULT 'Low',
        
        IsActive BOOLEAN DEFAULT TRUE
    );


    -- =======================================================
    -- 4. Table: DAY_EATING (บันทึกการกินอาหารในแต่ละวันของผู้ป่วย)
    -- =======================================================
    CREATE TABLE IF NOT EXISTS DAY_EATING (
        LogId SERIAL PRIMARY KEY,
        UserId INT NOT NULL,
        EatDate TIMESTAMPTZ NOT NULL,
        FoodId INT NOT NULL,
        MealType meal_type,
        Portion NUMERIC(5,2) DEFAULT 1.0,
        CreatedAt TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT FK_DayEating_User FOREIGN KEY (UserId) REFERENCES USERS(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_DayEating_Food FOREIGN KEY (FoodId) REFERENCES FOOD_LIST(FoodId) ON DELETE CASCADE
    );


    -- =======================================================
    -- MOCK DATA: สร้างข้อมูลจำลองเบื้องต้น
    -- =======================================================

    -- Truncate tables to prevent duplicate data on re-run
    TRUNCATE TABLE USERS, FOOD_LIST, DAY_EATING RESTART IDENTITY CASCADE;

    -- 1. เพิ่มข้อมูลผู้ใช้งานจำลอง
    INSERT INTO USERS (Username, WeightKg, CKD_Stage) VALUES ('สมชาย ใจดี', 60.00, 3);

    -- 2. เพิ่มข้อมูลอาหาร
    INSERT INTO FOOD_LIST (FoodName, Category, Status, PhysiologyReason, IconImage, ProteinGram, PotassiumLevel, PhosphorusLevel)
    VALUES 
    -- หมวดโปรตีน
    ('ไข่ขาว', 'โปรตีน', 'safe', 'ปราศจากฟอสฟอรัสอย่างสิ้นเชิง และมีโปรตีนอัลบูมินช่วยลดอาการบวมน้ำ', '🥚', 3.5, 'Low', 'Low'),
    ('ปลากระพง', 'โปรตีน', 'safe', 'แหล่งโปรตีนชั้นเลิศ มีโอเมก้า-3 ต้านการอักเสบ', '🐟', 7.0, 'Medium', 'Medium'),
    ('เนื้อวัว', 'โปรตีน', 'danger', 'เส้นใยกล้ามเนื้อซับซ้อน เกิดของเสียไนโตรเจนและพิวรีนสูง ไตทำงานหนัก', '🥩', 7.0, 'High', 'High'),
    ('ปูอัด / ลูกชิ้น', 'โปรตีน', 'danger', 'มีฟอสเฟตอนินทรีย์สูง ดูดซึมเข้าเลือด 100% ทำให้ฟอสฟอรัสพุ่งเฉียบพลัน', '🍢', 4.0, 'Medium', 'High'),

    -- หมวดคาร์โบไฮเดรต
    ('วุ้นเส้น / สาคู', 'คาร์โบไฮเดรต', 'safe', 'แป้งปลอดโปรตีน ให้พลังงานแต่ไม่เพิ่มภาระไนโตรเจนให้ไต', '🍜', 0.0, 'Low', 'Low'),
    ('ข้าวขาวเสาไห้', 'คาร์โบไฮเดรต', 'safe', 'ขัดสีแล้ว กำจัดฟอสฟอรัสและโพแทสเซียมออกไป ปลอดภัยกว่าข้าวกล้อง', '🍚', 2.0, 'Low', 'Low'),
    ('ข้าวกล้อง / โฮลวีท', 'คาร์โบไฮเดรต', 'danger', 'มีกรดไฟติกสูง (กักเก็บฟอสฟอรัส) และโพแทสเซียมสูง นำไปสู่เกลือแร่เสียสมดุล', '🌾', 3.0, 'High', 'High'),

    -- หมวดผัก
    ('มะเขือเปราะ / บวบ', 'ผัก', 'safe', 'กลุ่มผักสีอ่อน โพแทสเซียมต่ำ', '🍆', 0.5, 'Low', 'Low'),
    ('มะเขือเทศ', 'ผัก', 'warning', 'ทานได้พอเหมาะ ถ้าระดับโพแทสเซียมในเลือดปกติ ห้ามทานเยอะ', '🍅', 0.5, 'High', 'Medium'),
    ('ยอดตำลึง / ชะอม', 'ผัก', 'danger', 'ผักยอดมีเซลล์แบ่งตัว กระจุกตัวของโพแทสเซียม ฟอสฟอรัส และพิวรีนสูงมาก', '🌿', 1.0, 'High', 'High'),

    -- หมวดผลไม้
    ('สาลี่ / ส้มโอ', 'ผลไม้', 'safe', 'ผลไม้โพแทสเซียมต่ำ ทานได้ 1 ส่วนต่อมื้อ (6-8 ชิ้นคำ)', '🍐', 0.0, 'Low', 'Low'),
    ('กล้วย / กีวี่ / อะโวคาโด', 'ผลไม้', 'danger', 'ระเบิดโพแทสเซียม (Potassium bombs) เสี่ยงต่อภาวะหัวใจเต้นผิดจังหวะฉับพลัน', '🍌', 0.0, 'High', 'Low'),

    -- หมวดเครื่องปรุง
    ('น้ำมันรำข้าว', 'เครื่องปรุง', 'safe', 'ไขมันดี ช่วยลด LDL', '🛢️', 0.0, 'Low', 'Low'),
    ('เกลือลดโซเดียม', 'เครื่องปรุง', 'danger', 'ใช้โพแทสเซียมคลอไรด์ (KCl) แทนเกลือ ทำให้โพแทสเซียมคั่งจนหัวใจวายได้', '🧂', 0.0, 'High', 'Low');

    -- 3. เพิ่มข้อมูลการกินจำลอง
    INSERT INTO DAY_EATING (UserId, EatDate, FoodId, MealType, Portion)
    VALUES 
    (1, CURRENT_DATE, 1, 'Breakfast', 2.0),
    (1, CURRENT_DATE, 6, 'Breakfast', 1.0),
    (1, CURRENT_DATE, 8, 'Breakfast', 1.0);
