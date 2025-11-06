# Label & Publisher Settings Guide

## Overview
The Label & Publisher Settings feature allows users to manage custom labels and publishers with global defaults and user-specific overrides.

## Database Schema

### Tables Created
1. **global_settings** - Stores system-wide default values
2. **user_labels** - User-specific custom labels
3. **user_publishers** - User-specific custom publishers
4. **users** - Extended with `custom_label` and `custom_publisher` columns

### Migration File
Run `label-publisher-refactor.sql` to create the necessary tables and set up:
- Global default label: "Internet Records"
- Global default publisher: "Internet Records"
- User-specific label and publisher tables
- RLS policies for security

## Features

### Global Defaults
- System-wide default label and publisher
- Displayed to all users
- Used when user hasn't selected a custom option

### User Custom Labels
- Users can create their own labels
- Add, view, and delete custom labels
- Each label is unique per user

### User Custom Publishers
- Users can create their own publishers
- Add, view, and delete custom publishers
- Each publisher is unique per user

### User Preferences
- Select active label (custom or use global default)
- Select active publisher (custom or use global default)
- Preferences saved to user profile

## API Endpoints

### GET /api/label-publisher/global-defaults
Returns the global default label and publisher

### GET /api/label-publisher/user-labels
Returns all custom labels for the authenticated user

### GET /api/label-publisher/user-publishers
Returns all custom publishers for the authenticated user

### POST /api/label-publisher/user-labels
Create a new custom label
Body: `{ labelName: string }`

### POST /api/label-publisher/user-publishers
Create a new custom publisher
Body: `{ publisherName: string }`

### DELETE /api/label-publisher/user-labels/:id
Delete a custom label

### DELETE /api/label-publisher/user-publishers/:id
Delete a custom publisher

### GET /api/label-publisher/user-preferences
Get user's selected label and publisher preferences

### PUT /api/label-publisher/user-preferences
Update user's selected label and publisher
Body: `{ customLabel: string | null, customPublisher: string | null }`

## User Interface

### Access
Navigate to `/label-publisher-settings` in the application

### Sections

1. **Global Defaults**
   - View system-wide defaults
   - Read-only display

2. **Your Custom Labels**
   - Add new labels via input field
   - View all your custom labels
   - Delete labels you no longer need

3. **Your Custom Publishers**
   - Add new publishers via input field
   - View all your custom publishers
   - Delete publishers you no longer need

4. **Your Active Selection**
   - Dropdown to select active label (or use global default)
   - Dropdown to select active publisher (or use global default)
   - Save button to persist preferences

## Usage Flow

1. User navigates to Label & Publisher Settings
2. Views global defaults (Internet Records)
3. Creates custom labels/publishers as needed
4. Selects preferred label and publisher from dropdowns
5. Saves preferences
6. Selected preferences are used throughout the application

## Security

- All endpoints require authentication
- Users can only view/modify their own labels and publishers
- RLS policies ensure data isolation
- Global settings are read-only for regular users

## Integration

The selected label and publisher can be accessed via:
- User preferences API endpoint
- User object's `customLabel` and `customPublisher` fields
- Falls back to global defaults if not set
