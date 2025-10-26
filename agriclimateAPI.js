// api/agriclimateAPI.js
class AgriclimateAPI {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.userProfile = new UserProfileManager(supabaseClient);
        this.fileManager = new FileManager(supabaseClient);
        this.weatherManager = new WeatherManager(supabaseClient);
        this.auth = new AuthManager(supabaseClient);
        this.realtime = new RealtimeManager(supabaseClient);
    }

    // Comprehensive registration process
    async completeRegistration(formData) {
        try {
            // 1. Create auth user
            const authResult = await this.auth.signUp(
                formData.email, 
                formData.password, 
                {
                    full_name: formData.full_name,
                    display_name: formData.display_name
                }
            );

            if (!authResult.success) {
                throw new Error(authResult.error);
            }

            const userId = authResult.data.user.id;

            // 2. Upload files
            const fileUploads = await this.uploadRegistrationFiles(formData, userId);

            // 3. Create user profile
            const profileData = {
                id: userId,
                ...formData,
                ...fileUploads,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            delete profileData.password;
            delete profileData.confirm_password;

            const profileResult = await this.userProfile.createProfile(profileData);
            
            if (!profileResult.success) {
                throw new Error(profileResult.error);
            }

            // 4. Set up weather alerts
            if (formData.weather_alerts === 'yes') {
                await this.weatherManager.createWeatherAlertSettings(userId, {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    alert_channels: formData.alert_channels || ['email'],
                    severity_preference: formData.alert_frequency || 'medium'
                });
            }

            // 5. Generate initial recommendations
            await this.generateInitialRecommendations(userId, formData);

            return { success: true, userId };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    async uploadRegistrationFiles(formData, userId) {
        const fileUploads = {};

        try {
            // Upload profile photo
            if (formData.profile_photo) {
                const result = await this.fileManager.uploadFile(
                    formData.profile_photo, 
                    'profile-photos', 
                    userId
                );
                if (result.success) {
                    fileUploads.profile_photo_url = result.url;
                }
            }

            // Upload soil test file
            if (formData.soil_test_file) {
                const result = await this.fileManager.uploadFile(
                    formData.soil_test_file, 
                    'soil-tests', 
                    userId
                );
                if (result.success) {
                    fileUploads.soil_test_file_url = result.path;
                }
            }

            // Upload vaccination file
            if (formData.vaccination_file) {
                const result = await this.fileManager.uploadFile(
                    formData.vaccination_file, 
                    'vaccination', 
                    userId
                );
                if (result.success) {
                    fileUploads.vaccination_file_url = result.path;
                }
            }

            // Upload certificates (multiple files)
            if (formData.certificates_file && formData.certificates_file.length > 0) {
                const results = await this.fileManager.uploadMultipleFiles(
                    Array.from(formData.certificates_file), 
                    'certificates', 
                    userId
                );
                const successfulUploads = results.filter(r => r.success).map(r => r.path);
                if (successfulUploads.length > 0) {
                    fileUploads.certificates_file_urls = successfulUploads;
                }
            }

            // Upload government ID
            if (formData.government_id_file) {
                const result = await this.fileManager.uploadFile(
                    formData.government_id_file, 
                    'government-ids', 
                    userId
                );
                if (result.success) {
                    fileUploads.government_id_file_url = result.path;
                }
            }

            // Upload data import file
            if (formData.data_import_file) {
                const result = await this.fileManager.uploadFile(
                    formData.data_import_file, 
                    'data-imports', 
                    userId
                );
                if (result.success) {
                    fileUploads.data_import_file_url = result.path;
                }
            }

        } catch (error) {
            console.error('File upload error:', error);
        }

        return fileUploads;
    }

    async generateInitialRecommendations(userId, userData) {
        try {
            const recommendations = {
                crops: this.getCropRecommendations(userData),
                livestock: this.getLivestockRecommendations(userData),
                practices: this.getPracticeRecommendations(userData),
                technology: this.getTechnologyRecommendations(userData)
            };

            const { error } = await this.supabase
                .from('user_recommendations')
                .insert([{
                    user_id: userId,
                    type: 'initial',
                    recommendations: recommendations
                }]);

            if (error) throw error;

        } catch (error) {
            console.error('Error generating recommendations:', error);
        }
    }

    getCropRecommendations(userData) {
        const recommendations = [];
        
        // Climate-based recommendations
        if (userData.climate_resilient_interest) {
            recommendations.push('drought-resistant-maize', 'climate-smart-beans');
        }
        
        // Soil-based recommendations
        if (userData.soil_type === 'sandy') {
            recommendations.push('millet', 'groundnuts', 'sweet-potatoes');
        } else if (userData.soil_type === 'clay') {
            recommendations.push('rice', 'wheat', 'cotton');
        }
        
        // Size-based recommendations
        if (userData.farm_size < 2) {
            recommendations.push('high-value-vegetables', 'herbs', 'fruits');
        } else {
            recommendations.push('staple-grains', 'cash-crops');
        }
        
        return recommendations;
    }

    getLivestockRecommendations(userData) {
        const recommendations = [];
        
        if (userData.livestock_types?.includes('cattle')) {
            if (userData.climate_zone === 'arid') {
                recommendations.push('zebu-cattle', 'boran-cattle');
            } else {
                recommendations.push('dairy-cattle', 'beef-cattle');
            }
        }
        
        if (userData.livestock_types?.includes('goats')) {
            recommendations.push('boer-goats', 'dairy-goats');
        }
        
        if (userData.livestock_types?.includes('chickens')) {
            recommendations.push('improved-breeds', 'dual-purpose-chickens');
        }
        
        return recommendations;
    }

    getPracticeRecommendations(userData) {
        const recommendations = [];
        
        if (userData.irrigation_type === 'none') {
            recommendations.push('rainwater-harvesting', 'drought-resistant-farming');
        }
        
        if (userData.organic_farming === 'yes') {
            recommendations.push('organic-pest-control', 'composting', 'bio-fertilizers');
        }
        
        if (userData.soil_ph && userData.soil_ph < 6.0) {
            recommendations.push('soil-liming', 'ph-management');
        }
        
        return recommendations;
    }

    getTechnologyRecommendations(userData) {
        const recommendations = [];
        
        if (userData.smartphone_usage === 'yes') {
            recommendations.push('mobile-apps', 'digital-record-keeping');
        }
        
        if (userData.internet_connectivity !== 'none') {
            recommendations.push('online-markets', 'weather-apps', 'e-learning');
        }
        
        if (userData.external_integration === 'yes') {
            recommendations.push('iot-sensors', 'precision-agriculture');
        }
        
        return recommendations;
    }
}

// Initialize the main API
const agriclimateAPI = new AgriclimateAPI(supabase);