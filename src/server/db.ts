import { supabase } from './supabase';

// Database utility functions to replace Prisma operations

// Helper function to convert camelCase to snake_case
const toSnakeCaseUser = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = obj[key];
  }
  return converted;
};

// Helper function to convert snake_case to camelCase
const toCamelCaseUser = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCaseUser);

  const converted: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = obj[key];
  }
  return converted;
};

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
    return toCamelCaseUser(data);
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
    return toCamelCaseUser(data);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (options.where) {
      query = query.match(options.where);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCaseUser) : [];
  },

  create: async (options: any) => {
    const data = options.data || options;

    // If id is provided (from Supabase Auth), use it
    const insertData = data.id ? data : { ...data };
    const snakeData = toSnakeCaseUser(insertData);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCaseUser(newUser);
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeData = toSnakeCaseUser(data);

    const { data: updated, error } = await supabase
      .from('users')
      .update(snakeData)
      .match(where)
      .select()
      .single();

    if (error) throw error;
    return toCamelCaseUser(updated);
  },

  upsert: async (options: any) => {
    const { where, update, create } = options;

    // Try to find existing user
    const existing = await userOperations.findUnique({ where });

    if (existing) {
      // Update existing user
      return await userOperations.update({ where, data: update });
    } else {
      // Create new user
      return await userOperations.create({ data: create });
    }
  },

  deleteMany: async (options: any) => {
    const where = options.where || options;

    const { error } = await supabase
      .from('users')
      .delete()
      .match(where);

    if (error) throw error;
    return { count: 1 }; // Supabase doesn't return count
  },

  delete: async (options: any) => {
    const where = options.where || options;

    const { error } = await supabase
      .from('users')
      .delete()
      .match(where);

    if (error) throw error;
    return { success: true };
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
    console.log('[DEBUG] db.subLabel.create data:', data);
    const snakeData = toSnakeCase(data);

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
      if (options.where.OR) {
        // Handle OR query for getting both global and user specific labels
        // Expected format: OR: [{ user_id: null }, { user_id: userId }]
        // Expected format: OR: [{ user_id: null }, { user_id: userId }]
        const userCondition = options.where.OR.find((c: any) => c.user_id && c.user_id !== 'is.null')?.user_id;

        if (userCondition) {
          query = query.or(`user_id.is.null,user_id.eq.${userCondition}`);
        } else {
          query = query.is('user_id', null);
        }
      } else {
        const snakeWhere = toSnakeCase(options.where);
        query = query.match(snakeWhere);
      }
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

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('sub_labels')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
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

// Custom Label Request operations
export const customLabelRequestOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRequest, error } = await supabase
      .from('custom_label_requests')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRequest);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('custom_label_requests').select('*, user:users(*)').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data ? data.map((item: any) => {
      const camelItem = toCamelCase(item);
      // Ensure user is properly nested if returned
      if (item.user) {
        camelItem.user = toCamelCase(item.user);
      }
      return camelItem;
    }) : [];
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('custom_label_requests')
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

// Agreement Request operations
export const agreementRequestOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newRequest, error } = await supabase
      .from('agreement_requests')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newRequest);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('agreement_requests').select('*').order('created_at', { ascending: false });

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
    return data ? data.map(toCamelCase) : [];
  },

  findUnique: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    const { data, error } = await supabase
      .from('agreement_requests')
      .select('*')
      .match(snakeWhere)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return toCamelCase(data);
  },

  findFirst: async (options: any) => {
    const where = options.where || options;
    const snakeWhere = toSnakeCase(where);

    let query = supabase
      .from('agreement_requests')
      .select('*')
      .match(snakeWhere);

    if (options.orderBy) {
      const [field, direction] = Object.entries(options.orderBy)[0];
      const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      query = query.order(snakeField, { ascending: direction === 'asc' });
    }

    const { data, error } = await query.limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return toCamelCase(data);
  },

  update: async (options: any) => {
    const { where, data } = options;
    const snakeWhere = toSnakeCase(where);
    const snakeData = toSnakeCase(data);

    const { data: updated, error } = await supabase
      .from('agreement_requests')
      .update(snakeData)
      .match(snakeWhere)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(updated);
  },

  deleteMany: async (options: any) => {
    const where = options.where || options;

    // Handle OR clause
    if (where.OR && Array.isArray(where.OR)) {
      // Delete each condition separately
      for (const condition of where.OR) {
        const snakeCondition = toSnakeCase(condition);
        await supabase
          .from('agreement_requests')
          .delete()
          .match(snakeCondition);
      }
      return { count: where.OR.length };
    }

    const snakeWhere = toSnakeCase(where);
    const { error } = await supabase
      .from('agreement_requests')
      .delete()
      .match(snakeWhere);

    if (error) throw error;
    return { count: 1 };
  },
};

// Agreement Audit Log operations
export const agreementAuditLogOperations = {
  create: async (options: any) => {
    const data = options.data || options;
    const snakeData = toSnakeCase(data);

    const { data: newLog, error } = await supabase
      .from('agreement_audit_log')
      .insert(snakeData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(newLog);
  },

  findMany: async (options: any = {}) => {
    let query = supabase.from('agreement_audit_log').select('*').order('created_at', { ascending: false });

    if (options.where) {
      const snakeWhere = toSnakeCase(options.where);
      query = query.match(snakeWhere);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ? data.map(toCamelCase) : [];
  },

  deleteMany: async (options: any) => {
    const where = options.where || options;

    // Handle special cases like 'in' operator
    if (where.agreementRequestId && where.agreementRequestId.in) {
      const ids = where.agreementRequestId.in;
      const { error } = await supabase
        .from('agreement_audit_log')
        .delete()
        .in('agreement_request_id', ids);

      if (error) throw error;
      return { count: ids.length };
    }

    const snakeWhere = toSnakeCase(where);
    const { error } = await supabase
      .from('agreement_audit_log')
      .delete()
      .match(snakeWhere);

    if (error) throw error;
    return { count: 1 };
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
  customLabelRequest: customLabelRequestOperations,
  agreementRequest: agreementRequestOperations,
  agreementAuditLog: agreementAuditLogOperations,
  $disconnect: disconnect
};

export default db;