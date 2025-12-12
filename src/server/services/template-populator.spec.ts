import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { populateTemplate, validateUserData } from './template-populator';

const userDataArbitrary = fc.record({
  user_display_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && !s.includes('{{') && !s.includes('}}')),
  user_legal_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && !s.includes('{{') && !s.includes('}}')),
  user_email: fc.emailAddress().filter(s => !s.includes('{{') && !s.includes('}}')),
  user_mobile: fc.string({ minLength: 10, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('{{') && !s.includes('}}')),
  user_full_address: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0 && !s.includes('{{') && !s.includes('}}')),
  user_entity_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && !s.includes('{{') && !s.includes('}}')),
});

describe('Template Populator - Property 1', () => {
  it('replaces all placeholders', () => {
    fc.assert(
      fc.property(userDataArbitrary, (userData) => {
        const template = 'Hello {{user_display_name}}, email: {{user_email}}';
        const populated = populateTemplate(template, userData);
        expect(populated).not.toContain('{{');
        expect(populated).not.toContain('}}');
      }),
      { numRuns: 100 }
    );
  });

  it('replaces all 8 placeholders with values', () => {
    fc.assert(
      fc.property(userDataArbitrary, (userData) => {
        const template = 'Display: {{user_display_name}} Legal: {{user_legal_name}} Email: {{user_email}} Mobile: {{user_mobile}} Address: {{user_full_address}} Entity: {{user_entity_name}} Effective: {{effective_date}} Today: {{today_date}}';
        const populated = populateTemplate(template, userData);
        expect(populated).toContain(userData.user_display_name);
        expect(populated).toContain(userData.user_legal_name);
        expect(populated).toContain(userData.user_email);
        expect(populated).toContain(userData.user_mobile);
        expect(populated).toContain(userData.user_full_address);
        expect(populated).toContain(userData.user_entity_name);
        expect(populated).toContain('09-10-2025');
      }),
      { numRuns: 100 }
    );
  });
});

describe('Template Populator - Property 2', () => {
  it('replaces all IT Music with entity name', () => {
    fc.assert(
      fc.property(userDataArbitrary, (userData) => {
        const template = 'IT Music is the label. Welcome to IT Music.';
        const populated = populateTemplate(template, userData);
        expect(populated).not.toContain('IT Music');
        expect(populated).toContain(userData.user_entity_name);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Validation', () => {
  it('detects empty fields', () => {
    const invalidUserData = {
      user_display_name: '',
      user_legal_name: 'John Doe',
      user_email: 'test@example.com',
      user_mobile: '1234567890',
      user_full_address: '123 Main St',
      user_entity_name: 'Test Label',
    };
    const errors = validateUserData(invalidUserData);
    expect(errors.length).toBeGreaterThan(0);
  });
});
