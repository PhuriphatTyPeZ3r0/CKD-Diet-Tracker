const supabase = require('../config/supabase');

exports.getAllFoods = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('food_list')
            .select('FoodId:foodid, FoodName:foodname, Category:category, Status:status, PhysiologyReason:physiologyreason, IconImage:iconimage, ProteinGram:proteingram, SodiumMg:sodiummg, PotassiumLevel:potassiumlevel, PhosphorusLevel:phosphoruslevel, IsActive:isactive')
            .eq('isactive', true)
            .order('foodname', { ascending: true });

        if (error) {
            throw error;
        }
        
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching food list from Supabase', details: err.message });
    }
};