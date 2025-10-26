// data/userProfile.js
class UserProfileManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async createProfile(profileData) {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .insert([profileData])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', userId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getNearbyFarmers(latitude, longitude, radiusKm = 50) {
        try {
            const { data, error } = await this.supabase
                .rpc('get_nearby_farmers', {
                    user_lat: latitude,
                    user_lon: longitude,
                    radius_km: radiusKm
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

const userProfileManager = new UserProfileManager(supabase);