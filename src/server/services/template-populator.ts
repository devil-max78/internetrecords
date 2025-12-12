/**
 * Template Populator Service
 * 
 * This service handles the population of agreement templates with user data.
 * It replaces placeholders with actual user information and validates that
 * all required fields are present.
 */

export interface UserData {
  user_display_name: string;
  user_legal_name: string;
  user_email: string;
  user_mobile: string;
  user_full_address: string;
  user_entity_name: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates that all required user profile fields are present and non-empty
 * 
 * @param userData - The user data to validate
 * @returns Array of validation errors, empty if all fields are valid
 */
export function validateUserData(userData: Partial<UserData>): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredFields: (keyof UserData)[] = [
    'user_display_name',
    'user_legal_name',
    'user_email',
    'user_mobile',
    'user_full_address',
    'user_entity_name'
  ];

  for (const field of requiredFields) {
    const value = userData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        field,
        message: `${field} is required and cannot be empty`
      });
    }
  }

  return errors;
}

/**
 * Populates an agreement template with user data
 * 
 * Replaces all placeholders in the template:
 * - {{user_display_name}} - User's display name
 * - {{user_legal_name}} - User's legal signature name
 * - {{user_email}} - User's registered email
 * - {{user_mobile}} - User's registered mobile number
 * - {{user_full_address}} - User's complete address
 * - {{user_entity_name}} - User's artist or label name
 * - {{effective_date}} - Fixed date "09-10-2025"
 * - {{today_date}} - Current date at generation time
 * 
 * Also replaces all occurrences of "IT Music" with the user's entity name
 * 
 * @param template - The HTML template string with placeholders
 * @param userData - The user data to populate the template with
 * @returns The populated template string
 * @throws Error if required user data fields are missing
 */
/**
 * Escapes special regex replacement characters in a string
 * This prevents strings like "$&" from being interpreted as special replacement patterns
 */
function escapeReplacement(str: string): string {
  return str.replace(/\$/g, '$$$$');
}

export function populateTemplate(template: string, userData: UserData): string {
  // Validate user data first
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map(e => e.message).join(', ');
    throw new Error(`Missing required user profile fields: ${errorMessages}`);
  }

  // Get today's date in a readable format (MM-DD-YYYY)
  const today = new Date();
  const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
  
  // Fixed effective date as per requirements
  const effectiveDate = '09-10-2025';

  // Replace all placeholders - escape special characters in user data
  let populated = template
    .replace(/\{\{user_display_name\}\}/g, escapeReplacement(userData.user_display_name))
    .replace(/\{\{user_legal_name\}\}/g, escapeReplacement(userData.user_legal_name))
    .replace(/\{\{user_email\}\}/g, escapeReplacement(userData.user_email))
    .replace(/\{\{user_mobile\}\}/g, escapeReplacement(userData.user_mobile))
    .replace(/\{\{user_full_address\}\}/g, escapeReplacement(userData.user_full_address))
    .replace(/\{\{user_entity_name\}\}/g, escapeReplacement(userData.user_entity_name))
    .replace(/\{\{effective_date\}\}/g, effectiveDate)
    .replace(/\{\{today_date\}\}/g, todayDate);

  // Replace all occurrences of "IT Music" with user's entity name
  // Using case-insensitive replacement to catch variations
  populated = populated.replace(/IT Music/gi, escapeReplacement(userData.user_entity_name));

  return populated;
}
