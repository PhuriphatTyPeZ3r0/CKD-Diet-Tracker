-- Supabase/PostgreSQL Setup Script
-- This script is designed to be run in the Supabase SQL editor.

-- =======================================================
-- 1. Cleanup: Drop existing tables and types to ensure a clean state
-- =======================================================
DROP TABLE IF EXISTS public.DAY_EATING CASCADE;
DROP TABLE IF EXISTS public.health_data CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.FOOD_LIST CASCADE;

DROP TYPE IF EXISTS food_status CASCADE;
DROP TYPE IF EXISTS nutrient_level CASCADE;
DROP TYPE IF EXISTS meal_type CASCADE;

-- =======================================================
-- 2. Enum Types (For better data consistency)
-- =======================================================
CREATE TYPE food_status AS ENUM ('safe', 'warning', 'danger');
CREATE TYPE nutrient_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE meal_type AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snack');


-- =======================================================
-- 3.1 Table: user_profiles (ข้อมูลบัญชีและข้อมูลพื้นฐาน)
-- =======================================================
CREATE TABLE public.user_profiles (
    account_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- 3.2 Table: health_data (ข้อมูลส่วนตัวด้านสุขภาพ - Personal Data)
-- =======================================================
CREATE TABLE public.health_data (
    health_id SERIAL PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.user_profiles(account_id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2) NOT NULL,
    ckd_stage INT DEFAULT 3,
    date_of_birth DATE,
    gender VARCHAR(10),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_account_health UNIQUE (account_id)
);


-- =======================================================
-- 4. Table: FOOD_LIST (ฐานข้อมูลอาหาร)
-- =======================================================
CREATE TABLE public.FOOD_LIST (
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
-- 5. Table: DAY_EATING (บันทึกการกินอาหารในแต่ละวันของผู้ป่วย)
-- =======================================================
CREATE TABLE public.DAY_EATING (
    LogId SERIAL PRIMARY KEY,
    account_id UUID NOT NULL,
    EatDate TIMESTAMPTZ NOT NULL,
    FoodId INT NOT NULL,
    MealType meal_type,
    Portion NUMERIC(5,2) DEFAULT 1.0,
    CreatedAt TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT FK_DayEating_User FOREIGN KEY (account_id) REFERENCES public.user_profiles(account_id) ON DELETE CASCADE,
    CONSTRAINT FK_DayEating_Food FOREIGN KEY (FoodId) REFERENCES public.FOOD_LIST(FoodId) ON DELETE CASCADE
);


-- =======================================================
-- 6. Automations / Triggers
-- =======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (account_id, email, phone_number, username, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.phone,
    -- ดึงชื่อจาก Google (ถ้ามี) หรือตั้งเป็นค่าว่าง
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- สร้างข้อมูลสุขภาพเริ่มต้นให้ผู้ใช้ใหม่ทันที
  INSERT INTO public.health_data (account_id, weight_kg, ckd_stage)
  VALUES (new.id, 0.00, 3); -- ให้ผู้ใช้ไปกรอกข้อมูลน้ำหนักทีหลังผ่านแอป
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง Trigger เพื่อดักจับเมื่อมีการ Insert ลงใน auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =======================================================
-- MOCK DATA: สร้างข้อมูลจำลองเบื้องต้น
-- =======================================================

-- 1. เพิ่มข้อมูลอาหาร
INSERT INTO public.FOOD_LIST (FoodName, Category, Status, PhysiologyReason, IconImage, ProteinGram, PotassiumLevel, PhosphorusLevel)
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
