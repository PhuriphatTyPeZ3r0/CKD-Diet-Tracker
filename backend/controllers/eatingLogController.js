const supabase = require('../config/supabase');

async function getLogsAndCalculateMacros(userId, date) {
    // Extract date part YYYY-MM-DD if date contains time
    const datePart = date.split('T')[0];
    
    const { data: logs, error } = await supabase
        .from('day_eating')
        .select(`
            LogId:logid, EatDate:eatdate, MealType:mealtype, Portion:portion, CreatedAt:createdat,
            food_list (
                FoodId:foodid, FoodName:foodname, Category:category, Status:status, IconImage:iconimage,
                ProteinGram:proteingram, SodiumMg:sodiummg, PotassiumLevel:potassiumlevel, PhosphorusLevel:phosphoruslevel
            )
        `)
        .eq('userid', userId)
        .gte('eatdate', `${datePart}T00:00:00`)
        .lte('eatdate', `${datePart}T23:59:59`)
        .order('eatdate', { ascending: false });

    if (error) {
        throw error;
    }

    const macros = calculateMacros(logs);
    return { logs, macros };
}

exports.createLog = async (req, res) => {
    try {
        const { UserId, EatDate, FoodId, MealType, Portion } = req.body;
        
        if (!UserId || !EatDate || !FoodId || !MealType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: newLogData, error: insertError } = await supabase
            .from('day_eating')
            .insert([{ userid: UserId, eatdate: EatDate, foodid: FoodId, mealtype: MealType, portion: Portion }])
            .select('LogId:logid')
            .single();

        if (insertError) {
            throw insertError;
        }

        const { logs, macros } = await getLogsAndCalculateMacros(UserId, EatDate);
        
        res.status(201).json({ message: 'Eating log created', logId: newLogData.LogId, macros, logs });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

exports.getDailyLogs = async (req, res) => {
    try {
        const { userId, date } = req.query;
        
        if (!userId || !date) {
            return res.status(400).json({ error: 'Missing userId or date query parameter' });
        }
        
        const { logs, macros } = await getLogsAndCalculateMacros(userId, date);
        
        res.status(200).json({ logs, macros });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

function calculateMacros(logs) {
    let totalProtein = 0;
    let totalSodium = 0;

    logs.forEach(log => {
        const food = log.food_list;
        if (food) {
            const portion = parseFloat(log.Portion) || 1.0;
            totalProtein += (parseFloat(food.ProteinGram) || 0) * portion;
            totalSodium += (parseFloat(food.SodiumMg) || 0) * portion;
        }
    });

    return {
        totalProtein,
        totalSodium
    };
}