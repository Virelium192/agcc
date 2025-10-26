// realtime/subscriptions.js
class RealtimeManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.subscriptions = new Map();
    }

    subscribeToWeatherAlerts(userId, callback) {
        const subscription = this.supabase
            .channel('weather_alerts')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'weather_alerts',
                    filter: `user_id=eq.${userId}`
                }, 
                callback
            )
            .subscribe();

        this.subscriptions.set('weather_alerts', subscription);
        return subscription;
    }

    subscribeToMarketPrices(commodities, regions, callback) {
        const subscription = this.supabase
            .channel('market_prices')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'market_prices'
                },
                (payload) => {
                    const { new: newRecord } = payload;
                    if (commodities.includes(newRecord.commodity) && 
                        regions.includes(newRecord.region)) {
                        callback(payload);
                    }
                }
            )
            .subscribe();

        this.subscriptions.set('market_prices', subscription);
        return subscription;
    }

    subscribeToCommunityPosts(categories, callback) {
        const subscription = this.supabase
            .channel('community_posts')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'community_posts'
                },
                (payload) => {
                    const record = payload.new || payload.old;
                    if (categories.includes(record.category)) {
                        callback(payload);
                    }
                }
            )
            .subscribe();

        this.subscriptions.set('community_posts', subscription);
        return subscription;
    }

    unsubscribe(channelName) {
        const subscription = this.subscriptions.get(channelName);
        if (subscription) {
            this.supabase.removeChannel(subscription);
            this.subscriptions.delete(channelName);
        }
    }

    unsubscribeAll() {
        this.subscriptions.forEach((subscription, channelName) => {
            this.supabase.removeChannel(subscription);
        });
        this.subscriptions.clear();
    }
}

const realtimeManager = new RealtimeManager(supabase);