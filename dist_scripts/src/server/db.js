"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.artistProfileLinkingOperations = exports.userPublisherOperations = exports.userLabelOperations = exports.globalSettingsOperations = exports.customLabelRequestOperations = exports.socialMediaLinkingOperations = exports.youtubeOacRequestOperations = exports.youtubeClaimOperations = exports.contentTypeOperations = exports.albumCategoryOperations = exports.publisherOperations = exports.artistOperations = exports.subLabelOperations = exports.disconnect = exports.fileUploadOperations = exports.trackOperations = exports.releaseOperations = exports.userOperations = void 0;
const supabase_1 = require("./supabase");
// Database utility functions to replace Prisma operations
// User operations
exports.userOperations = {
    findUnique: async (options) => {
        const where = options.where || options;
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .match(where)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return data;
    },
    findFirst: async (options) => {
        const where = options.where || options;
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .match(where)
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116')
            return null; // No rows returned
        return data;
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('users').select('*').order('created_at', { ascending: false });
        if (options.where) {
            query = query.match(options.where);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data || [];
    },
    create: async (options) => {
        const data = options.data || options;
        // If id is provided (from Supabase Auth), use it
        const insertData = data.id ? data : { ...data };
        const { data: newUser, error } = await supabase_1.supabase
            .from('users')
            .insert(insertData)
            .select()
            .single();
        if (error)
            throw error;
        return newUser;
    },
    update: async (options) => {
        const { where, data } = options;
        const { data: updated, error } = await supabase_1.supabase
            .from('users')
            .update(data)
            .match(where)
            .select()
            .single();
        if (error)
            throw error;
        return updated;
    },
};
// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj) => {
    if (!obj || typeof obj !== 'object')
        return obj;
    const converted = {};
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        converted[snakeKey] = obj[key];
    }
    return converted;
};
// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
    if (!obj || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj))
        return obj.map(toCamelCase);
    const converted = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        // Recursively transform nested objects
        converted[camelKey] = toCamelCase(obj[key]);
    }
    return converted;
};
// Release operations
exports.releaseOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newRelease, error } = await supabase_1.supabase
            .from('releases')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newRelease);
    },
    findMany: async (options = {}) => {
        let selectQuery = '*';
        // Handle include option
        if (options.include) {
            const includes = [];
            if (options.include.tracks)
                includes.push('tracks(*)');
            if (options.include.user) {
                if (options.include.user.select) {
                    const fields = Object.keys(options.include.user.select).join(',');
                    includes.push(`user:users(${fields})`);
                }
                else {
                    includes.push('user:users(*)');
                }
            }
            selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
        }
        let query = supabase_1.supabase.from('releases').select(selectQuery);
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        if (options.orderBy) {
            const [field, direction] = Object.entries(options.orderBy)[0];
            const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            query = query.order(snakeField, { ascending: direction === 'asc' });
        }
        const { data, error } = await query;
        if (error)
            throw error;
        if (!data)
            return [];
        // Transform data to match Prisma format
        return data.map((release) => {
            const transformed = toCamelCase(release);
            if (transformed.user && Array.isArray(transformed.user)) {
                transformed.user = toCamelCase(transformed.user[0]);
            }
            if (transformed.tracks) {
                transformed.tracks = transformed.tracks.map(toCamelCase);
            }
            return transformed;
        });
    },
    findUnique: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        let selectQuery = '*';
        // Handle include option
        if (options.include) {
            const includes = [];
            if (options.include.tracks)
                includes.push('tracks(*)');
            if (options.include.user) {
                if (options.include.user.select) {
                    const fields = Object.keys(options.include.user.select).join(',');
                    includes.push(`user:users(${fields})`);
                }
                else {
                    includes.push('user:users(*)');
                }
            }
            selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
        }
        const { data, error } = await supabase_1.supabase
            .from('releases')
            .select(selectQuery)
            .match(snakeWhere)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        if (!data)
            return null;
        // Transform data to match Prisma format
        const transformed = toCamelCase(data);
        if (transformed.user && Array.isArray(transformed.user)) {
            transformed.user = toCamelCase(transformed.user[0]);
        }
        if (transformed.tracks) {
            transformed.tracks = transformed.tracks.map(toCamelCase);
        }
        return transformed;
    },
    update: async (options) => {
        const where = options.where || options;
        const updateData = options.data || options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(updateData);
        let selectQuery = '*';
        // Handle include option
        if (options.include) {
            const includes = [];
            if (options.include.tracks)
                includes.push('tracks(*)');
            if (options.include.user) {
                if (options.include.user.select) {
                    const fields = Object.keys(options.include.user.select).join(',');
                    includes.push(`user:users(${fields})`);
                }
                else {
                    includes.push('user:users(*)');
                }
            }
            selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
        }
        const { data: updatedRelease, error } = await supabase_1.supabase
            .from('releases')
            .update(snakeData)
            .match(snakeWhere)
            .select(selectQuery)
            .single();
        if (error)
            throw error;
        if (!updatedRelease)
            return null;
        // Transform data to match Prisma format
        const transformed = toCamelCase(updatedRelease);
        if (transformed.user && Array.isArray(transformed.user)) {
            transformed.user = toCamelCase(transformed.user[0]);
        }
        if (transformed.tracks) {
            transformed.tracks = transformed.tracks.map(toCamelCase);
        }
        return transformed;
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('releases')
            .delete()
            .match(snakeWhere);
        if (error)
            throw error;
        return { success: true };
    }
};
// Track operations
exports.trackOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newTrack, error } = await supabase_1.supabase
            .from('tracks')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newTrack);
    },
    findUnique: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        let selectQuery = '*';
        // Handle include option
        if (options.include) {
            const includes = [];
            if (options.include.release)
                includes.push('release:releases(*)');
            selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
        }
        const { data, error } = await supabase_1.supabase
            .from('tracks')
            .select(selectQuery)
            .match(snakeWhere)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        if (!data)
            return null;
        // Transform data to match Prisma format
        const transformed = toCamelCase(data);
        if (transformed.release && Array.isArray(transformed.release)) {
            transformed.release = toCamelCase(transformed.release[0]);
        }
        return transformed;
    },
    update: async (options) => {
        const where = options.where || options;
        const updateData = options.data || options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(updateData);
        const { data: updatedTrack, error } = await supabase_1.supabase
            .from('tracks')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updatedTrack);
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('tracks')
            .delete()
            .match(snakeWhere);
        if (error)
            throw error;
    }
};
// FileUpload operations
exports.fileUploadOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newFileUpload, error } = await supabase_1.supabase
            .from('file_uploads')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newFileUpload);
    }
};
// Replacement for Prisma's $disconnect
const disconnect = async () => {
    // Supabase doesn't need explicit disconnection
    return;
};
exports.disconnect = disconnect;
// SubLabel operations
exports.subLabelOperations = {
    create: async (options) => {
        const data = options.data || options;
        // Don't include userId for sub-labels (they're global)
        const { userId, ...cleanData } = data;
        const snakeData = toSnakeCase(cleanData);
        const { data: newSubLabel, error } = await supabase_1.supabase
            .from('sub_labels')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newSubLabel);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('sub_labels').select('*').order('name');
        if (options.where) {
            if (options.where.OR) {
                // Handle OR query for getting both global and user specific labels
                // Expected format: OR: [{ user_id: null }, { user_id: userId }]
                // Expected format: OR: [{ user_id: null }, { user_id: userId }]
                const userCondition = options.where.OR.find((c) => c.user_id && c.user_id !== 'is.null')?.user_id;
                if (userCondition) {
                    query = query.or(`user_id.is.null,user_id.eq.${userCondition}`);
                }
                else {
                    query = query.is('user_id', null);
                }
            }
            else {
                const snakeWhere = toSnakeCase(options.where);
                query = query.match(snakeWhere);
            }
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('sub_labels')
            .delete()
            .eq('id', snakeWhere.id);
        if (error)
            throw error;
        return { success: true };
    },
};
// Artist operations
exports.artistOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newArtist, error } = await supabase_1.supabase
            .from('artists')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newArtist);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('artists').select('*');
        if (options.where) {
            query = query.match(options.where);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    findByName: async (name) => {
        const { data, error } = await supabase_1.supabase
            .from('artists')
            .select('*')
            .ilike('name', `%${name}%`)
            .limit(10);
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
};
// Publisher operations
exports.publisherOperations = {
    findMany: async () => {
        const { data, error } = await supabase_1.supabase
            .from('publishers')
            .select('*')
            .order('name');
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newPublisher, error } = await supabase_1.supabase
            .from('publishers')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newPublisher);
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('publishers')
            .delete()
            .eq('id', snakeWhere.id);
        if (error)
            throw error;
        return { success: true };
    },
};
// Album Category operations
exports.albumCategoryOperations = {
    findMany: async () => {
        const { data, error } = await supabase_1.supabase
            .from('album_categories')
            .select('*')
            .order('name');
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newCategory, error } = await supabase_1.supabase
            .from('album_categories')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newCategory);
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('album_categories')
            .delete()
            .eq('id', snakeWhere.id);
        if (error)
            throw error;
        return { success: true };
    },
};
// Content Type operations
exports.contentTypeOperations = {
    findMany: async () => {
        const { data, error } = await supabase_1.supabase
            .from('content_types')
            .select('*')
            .order('name');
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newType, error } = await supabase_1.supabase
            .from('content_types')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newType);
    },
    delete: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { error } = await supabase_1.supabase
            .from('content_types')
            .delete()
            .eq('id', snakeWhere.id);
        if (error)
            throw error;
        return { success: true };
    },
};
// YouTube Claim operations
exports.youtubeClaimOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newClaim, error } = await supabase_1.supabase
            .from('youtube_claims')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newClaim);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('youtube_claims').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    findUnique: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { data, error } = await supabase_1.supabase
            .from('youtube_claims')
            .select('*')
            .match(snakeWhere)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return toCamelCase(data);
    },
    update: async (options) => {
        const { where, data } = options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(data);
        const { data: updated, error } = await supabase_1.supabase
            .from('youtube_claims')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updated);
    },
};
// YouTube OAC Request operations
exports.youtubeOacRequestOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newRequest, error } = await supabase_1.supabase
            .from('youtube_oac_requests')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newRequest);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('youtube_oac_requests').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    findUnique: async (options) => {
        const where = options.where || options;
        const snakeWhere = toSnakeCase(where);
        const { data, error } = await supabase_1.supabase
            .from('youtube_oac_requests')
            .select('*')
            .match(snakeWhere)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return toCamelCase(data);
    },
    update: async (options) => {
        const { where, data } = options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(data);
        const { data: updated, error } = await supabase_1.supabase
            .from('youtube_oac_requests')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updated);
    },
};
// Social Media Linking Request operations
exports.socialMediaLinkingOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newRequest, error } = await supabase_1.supabase
            .from('social_media_linking_requests')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newRequest);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('social_media_linking_requests').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    update: async (options) => {
        const { where, data } = options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(data);
        const { data: updated, error } = await supabase_1.supabase
            .from('social_media_linking_requests')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updated);
    },
};
// Custom Label Request operations
exports.customLabelRequestOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newRequest, error } = await supabase_1.supabase
            .from('custom_label_requests')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newRequest);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('custom_label_requests').select('*, user:users(*)').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map((item) => {
            const camelItem = toCamelCase(item);
            // Ensure user is properly nested if returned
            if (item.user) {
                camelItem.user = toCamelCase(item.user);
            }
            return camelItem;
        }) : [];
    },
    update: async (options) => {
        const { where, data } = options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(data);
        const { data: updated, error } = await supabase_1.supabase
            .from('custom_label_requests')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updated);
    },
};
// Global Settings operations
exports.globalSettingsOperations = {
    get: async (key) => {
        const { data, error } = await supabase_1.supabase
            .from('global_settings')
            .select('*')
            .eq('setting_key', key)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return toCamelCase(data);
    },
    set: async (key, value) => {
        const { data, error } = await supabase_1.supabase
            .from('global_settings')
            .upsert({ setting_key: key, setting_value: value })
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(data);
    },
    getAll: async () => {
        const { data, error } = await supabase_1.supabase
            .from('global_settings')
            .select('*');
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
};
// User Label operations
exports.userLabelOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newLabel, error } = await supabase_1.supabase
            .from('user_labels')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newLabel);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('user_labels').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
};
// User Publisher operations
exports.userPublisherOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newPublisher, error } = await supabase_1.supabase
            .from('user_publishers')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newPublisher);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('user_publishers').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
};
// Artist Profile Linking operations
exports.artistProfileLinkingOperations = {
    create: async (options) => {
        const data = options.data || options;
        const snakeData = toSnakeCase(data);
        const { data: newRequest, error } = await supabase_1.supabase
            .from('artist_profile_linking_requests')
            .insert(snakeData)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(newRequest);
    },
    findMany: async (options = {}) => {
        let query = supabase_1.supabase.from('artist_profile_linking_requests').select('*').order('created_at', { ascending: false });
        if (options.where) {
            const snakeWhere = toSnakeCase(options.where);
            query = query.match(snakeWhere);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data ? data.map(toCamelCase) : [];
    },
    update: async (options) => {
        const { where, data } = options;
        const snakeWhere = toSnakeCase(where);
        const snakeData = toSnakeCase(data);
        const { data: updated, error } = await supabase_1.supabase
            .from('artist_profile_linking_requests')
            .update(snakeData)
            .match(snakeWhere)
            .select()
            .single();
        if (error)
            throw error;
        return toCamelCase(updated);
    },
};
// Export a db object that mimics Prisma's structure
exports.db = {
    user: exports.userOperations,
    release: exports.releaseOperations,
    track: exports.trackOperations,
    fileUpload: exports.fileUploadOperations,
    subLabel: exports.subLabelOperations,
    artist: exports.artistOperations,
    publisher: exports.publisherOperations,
    albumCategory: exports.albumCategoryOperations,
    contentType: exports.contentTypeOperations,
    youtubeClaim: exports.youtubeClaimOperations,
    youtubeOacRequest: exports.youtubeOacRequestOperations,
    socialMediaLinking: exports.socialMediaLinkingOperations,
    globalSettings: exports.globalSettingsOperations,
    userLabel: exports.userLabelOperations,
    userPublisher: exports.userPublisherOperations,
    artistProfileLinking: exports.artistProfileLinkingOperations,
    customLabelRequest: exports.customLabelRequestOperations,
    $disconnect: exports.disconnect
};
exports.default = exports.db;
