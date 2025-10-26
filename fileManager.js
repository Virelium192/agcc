// data/fileManager.js
class FileManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async uploadFile(file, folder, userId) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${userId}/${folder}/${fileName}`;

            const { data, error } = await this.supabase.storage
                .from('user-files')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = this.supabase.storage
                .from('user-files')
                .getPublicUrl(filePath);

            return { success: true, path: filePath, url: publicUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async uploadMultipleFiles(files, folder, userId) {
        const results = [];
        
        for (const file of files) {
            const result = await this.uploadFile(file, folder, userId);
            results.push(result);
        }
        
        return results;
    }

    async deleteFile(filePath) {
        try {
            const { error } = await this.supabase.storage
                .from('user-files')
                .remove([filePath]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getFileUrl(filePath) {
        const { data } = this.supabase.storage
            .from('user-files')
            .getPublicUrl(filePath);
        
        return data.publicUrl;
    }
}

const fileManager = new FileManager(supabase);