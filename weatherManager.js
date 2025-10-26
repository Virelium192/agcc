// data/weatherManager.js
class WeatherManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async createWeatherAlertSettings(userId, settings) {
        try {
            const { data, error } = await this.supabase
                .from('weather_alert_settings')
                .insert([{ user_id: userId, ...settings }])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getWeatherAlerts(userId, limit = 20) {
        try {
            const { data, error } = await this.supabase
                .from('weather_alerts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async markAlertAsRead(alertId) {
        try {
            const { error } = await this.supabase
                .from('weather_alerts')
                .update({ is_read: true })
                .eq('id', alertId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

const weatherManager = new WeatherManager(supabase);