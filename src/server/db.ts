import { supabase } from './supabase';

// Database utility functions to replace Prisma operations

// User operations
export const userOperations = {
  findUnique: async (options: any) => {
    const where = options.where || options;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .match(where)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  findFirst: async (options: any) => {
    const where = options.where || options;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .match(where)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') return null; // No rows returned
    return data;
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (options.where) {
      query = query.match(options.where);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (options: any) => {
    const data = options.data || options;
    
    // If id is provided (from Supabase Auth), use it
    const insertData = data.id ? data : { ...data };

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return newUser;
  },

  update: async (options: any) => {
    const { where, data } = options;

    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .match(where)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const converted: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = obj[key];
  }
  return converted;
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const converted: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    // Recursively transform nested objects
    converted[camelKey] = toCamelCase(obj[key]);
  }
  return converted;
};

// Release operations
export const releaseOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRelease, error } = await supabase
      .from('releases')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRelease);
  },

  findMany: async (options: any = {}) => {
    let selectQuery = '*';

    // Handle include option
    if (options.include) {
      const includes = [];
      if (options.include.tracks) includes.push('tracks(*)');
      if (options.include.user) {
        if (options.include.user.select) {
          const fields = Object.keys(options.include.user.select).join(',');
          includes.push(`user:users(${fields})`);
        } else {
          includes.push('user:users(*)');
        }
      }
      selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
    }

    let query = supabase.from('releases').select(selectQuery);

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

    if (error) throw error;
    if (!data) return [];

    // Transform data to match Prisma format
    return data.map((release: any) => {
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

  findUnique: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);
    let selectQuery = '*';

    // Handle include option
    if (options.include) {
      const includes = [];
      if (options.include.tracks) includes.push('tracks(*)');
      if (options.include.user) {
        if (options.include.user.select) {
          const fields = Object.keys(options.include.user.select).join(',');
          includes.push(`user:users(${fields})`);
        } else {
          includes.push('user:users(*)');
        }
      }
      selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
    }

    const { data, error } = await supabase
      .from('releases')
      .select(selectQuery)
      .match(snakeWhere)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

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

  update: async (options: any) => {
    const where = options.where || options;
    const updateData = options.data || options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(updateData);
    let selectQuery = '*';

    // Handle include option
    if (options.include) {
      const includes = [];
      if (options.include.tracks) includes.push('tracks(*)');
      if (options.include.user) {
        if (options.include.user.select) {
          const fields = Object.keys(options.include.user.select).join(',');
          includes.push(`user:users(${fields})`);
        } else {
          includes.push('user:users(*)');
        }
      }
      selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
    }

    const { data: updatedRelease, error } = await supabase
      .from('releases')
      .update(snakeData)
      .match(snakeWhere)
      .select(selectQuery)
      .single();

    if (error) throw error;
    if (!updatedRelease) return null;

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

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('releases')
      .delete()
      .match(snakeWhere);

    if (error) throw error;
    return { success: true };
  }
};

// Track operations
export const trackOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newTrack, error } = await supabase
      .from('tracks')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newTrack);
  },

  findUnique: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);
    let selectQuery = '*';

    // Handle include option
    if (options.include) {
      const includes = [];
      if (options.include.release) includes.push('release:releases(*)');
      selectQuery = includes.length > 0 ? `*, ${includes.join(', ')}` : '*';
    }

    const { data, error } = await supabase
      .from('tracks')
      .select(selectQuery)
      .match(snakeWhere)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    // Transform data to match Prisma format
    const transformed = toCamelCase(data);
    if (transformed.release && Array.isArray(transformed.release)) {
      transformed.release = toCamelCase(transformed.release[0]);
    }

    return transformed;
  },

  update: async (options: any) => {
    const where = options.where || options;
    const updateData = options.data || options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(updateData);

    const { data: updatedTrack, error } = await supabase
      .from('tracks')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updatedTrack);
  },

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('tracks')
      .delete()
      .match(snakeWhere);

    if (error) throw error;
  }
};

// FileUpload operations
export const fileUploadOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newFileUpload, error } = await supabase
      .from('file_uploads')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newFileUpload);
  }
};

// Replacement for Prisma's $disconnect
export const disconnect = async () => {
  // Supabase doesn't need explicit disconnection
  return;
};

// SubLabel operations
export const subLabelOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    // Don't include userId for sub-labels (they're global)
    const { userId, ...cleanData } = data;
    const snakeData = toSnakeCase(cleanData);

    const { data: newSubLabel, error } = await supabase
      .from('sub_labels')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newSubLabel);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('sub_labels').select('*').order('name');

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('sub_labels')
      .delete()
      .eq('id', snakeWhere.id);

    if (error) throw error;
    return { success: true };
  },
};

// Artist operations
export const artistOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);
    
    const { data: newArtist, error } = await supabase
      .from('artists')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newArtist);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('artists').select('*');

    if (options.where) {
      query = query.match(options.where);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  findByName: async (name: string) => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(10);

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },
};

// Publisher operations
export const publisherOperations = {
  findMany: async () => {
    const { data, error } = await supabase
      .from('publishers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);
    
    const { data: newPublisher, error } = await supabase
      .from('publishers')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newPublisher);
  },

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('publishers')
      .delete()
      .eq('id', snakeWhere.id);

    if (error) throw error;
    return { success: true };
  },
};

// Album Category operations
export const albumCategoryOperations = {
  findMany: async () => {
    const { data, error } = await supabase
      .from('album_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);
    
    const { data: newCategory, error } = await supabase
      .from('album_categories')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newCategory);
  },

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('album_categories')
      .delete()
      .eq('id', snakeWhere.id);

    if (error) throw error;
    return { success: true };
  },
};

// Content Type operations
export const contentTypeOperations = {
  findMany: async () => {
    const { data, error } = await supabase
      .from('content_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);
    
    const { data: newType, error } = await supabase
      .from('content_types')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newType);
  },

  delete: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { error } = await supabase
      .from('content_types')
      .delete()
      .eq('id', snakeWhere.id);

    if (error) throw error;
    return { success: true };
  },
};

// YouTube Claim operations
export const youtubeClaimOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newClaim, error } = await supabase
      .from('youtube_claims')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newClaim);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('youtube_claims').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  findUnique: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { data, error } = await supabase
      .from('youtube_claims')
      .select('*')
      .match(snakeWhere)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('youtube_claims')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
  },
};

// YouTube OAC Request operations
export const youtubeOacRequestOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRequest, error } = await supabase
      .from('youtube_oac_requests')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRequest);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('youtube_oac_requests').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  findUnique: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { data, error } = await supabase
      .from('youtube_oac_requests')
      .select('*')
      .match(snakeWhere)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('youtube_oac_requests')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
  },
};

// Social Media Linking Request operations
export const socialMediaLinkingOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRequest, error } = await supabase
      .from('social_media_linking_requests')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRequest);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('social_media_linking_requests').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('social_media_linking_requests')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
  },
};

// Global Settings operations
export const globalSettingsOperations = {
  get: async (key: string) => {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  set: async (key: string, value: string) => {
    const { data, error } = await supabase
      .from('global_settings')
      .upsert({ setting_key: key, setting_value: value })
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*');

    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },
};

// User Label operations
export const userLabelOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newLabel, error } = await supabase
      .from('user_labels')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newLabel);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('user_labels').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },
};

// User Publisher operations
export const userPublisherOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newPublisher, error } = await supabase
      .from('user_publishers')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newPublisher);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('user_publishers').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },
};

// Artist Profile Linking operations
export const artistProfileLinkingOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRequest, error } = await supabase
      .from('artist_profile_linking_requests')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRequest);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('artist_profile_linking_requests').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('artist_profile_linking_requests')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
  },
};

// Export a db object that mimics Prisma's structure
export const db = {
  user: userOperations,
  release: releaseOperations,
  track: trackOperations,
  fileUpload: fileUploadOperations,
  subLabel: subLabelOperations,
  artist: artistOperations,
  publisher: publisherOperations,
  albumCategory: albumCategoryOperations,
  contentType: contentTypeOperations,
  youtubeClaim: youtubeClaimOperations,
  youtubeOacRequest: youtubeOacRequestOperations,
  socialMediaLinking: socialMediaLinkingOperations,
  globalSettings: globalSettingsOperations,
  userLabel: userLabelOperations,
  userPublisher: userPublisherOperations,
  artistProfileLinking: artistProfileLinkingOperations,
  $disconnect: disconnect
};

export default db;