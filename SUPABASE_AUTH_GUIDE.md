# Supabase Auth Integration Guide

## ✅ Supabase Auth Successfully Integrated!

The project now uses **Supabase Auth** for authentication instead of custom JWT tokens. This provides better security, session management, and user management.

---

## 🔐 How It Works

### Authentication Flow

1. **Signup**: User creates account → Supabase Auth creates user → Profile created in database
2. **Login**: User logs in → Supabase Auth verifies → Returns access token
3. **Protected Routes**: Token verified by Supabase Auth → User data fetched from database

### Key Benefits

- ✅ Secure password hashing (managed by Supabase)
- ✅ Session management with refresh tokens
- ✅ Email verification (optional)
- ✅ Password reset functionality
- ✅ OAuth providers support (Google, GitHub, etc.)
- ✅ Built-in security features

---

## 📡 API Endpoints

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, refreshToken, user }
```

#### Signup
```
POST /api/auth/signup
Body: { email, password, name, role }
Response: { token, refreshToken, user, message }
```

#### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: { message }
```

#### Refresh Token
```
POST /api/auth/refresh
Body: { refreshToken }
Response: { token, refreshToken }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

---

## 🔑 Admin User Setup

### Option 1: Automatic Creation (Recommended)

The server automatically creates an admin user on startup using environment variables:

```env
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_NAME="Admin User"
ADMIN_INITIAL_PASSWORD=admin123
```

### Option 2: Manual Creation via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add User"
4. Enter email and password
5. Copy the user ID
6. Run this SQL in the SQL Editor:

```sql
INSERT INTO users (id, email, name, password, role, created_at, updated_at)
VALUES (
  'paste-user-id-here',
  'admin@example.com',
  'Admin User',
  '',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Option 3: Using the API

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

Then update the role in Supabase:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 🎯 Usage Examples

### Frontend Login

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
};
```

### Frontend Signup

```typescript
const signup = async (email: string, password: string, name: string, role: string) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });
  
  const data = await response.json();
  
  if (data.token) {
    // User is logged in
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
  } else {
    // Email confirmation required
    alert(data.message);
  }
};
```

### Making Authenticated Requests

```typescript
const getProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/releases', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

### Refreshing Tokens

```typescript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

---

## 🔒 Security Features

### Token Management

- **Access Token**: Short-lived (1 hour by default)
- **Refresh Token**: Long-lived (used to get new access tokens)
- **Automatic Expiry**: Tokens expire and must be refreshed

### Password Security

- Passwords are hashed by Supabase (bcrypt)
- Never stored in plain text
- Minimum password requirements enforced

### Session Management

- Sessions tracked by Supabase
- Can be revoked from dashboard
- Automatic cleanup of expired sessions

---

## 🛠️ Configuration

### Supabase Dashboard Settings

1. **Authentication → Settings**
   - Enable/disable email confirmation
   - Set password requirements
   - Configure session timeout

2. **Authentication → Providers**
   - Enable OAuth providers (Google, GitHub, etc.)
   - Configure redirect URLs

3. **Authentication → Email Templates**
   - Customize confirmation emails
   - Customize password reset emails

### Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin User
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_NAME="Admin User"
ADMIN_INITIAL_PASSWORD=admin123

# JWT (for backward compatibility)
JWT_SECRET=your-jwt-secret
```

---

## 🧪 Testing Authentication

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"artist@example.com",
    "password":"password123",
    "name":"Test Artist",
    "role":"ARTIST"
  }'
```

### Test Protected Route

```bash
# First, get a token from login
TOKEN="your-token-here"

curl http://localhost:3000/api/releases \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Migration from Old Auth

If you had users with the old JWT system:

1. Users need to reset their passwords
2. Or manually migrate:
   - Create user in Supabase Auth
   - Update user ID in database to match Supabase Auth ID

---

## 📝 Common Issues & Solutions

### Issue: "User not found" after login

**Solution**: Make sure the user profile exists in the database. The signup process should create both:
1. User in Supabase Auth
2. Profile in your database

### Issue: "Invalid token"

**Solution**: 
- Token might be expired - use refresh token
- Token format incorrect - ensure "Bearer " prefix
- Check Supabase service role key is correct

### Issue: "Admin user creation failed"

**Solution**:
- Check Supabase service role key has admin privileges
- Manually create admin user via Supabase dashboard
- Check database connection

---

## 🎉 Success!

Your application now uses Supabase Auth for secure, scalable authentication!

**Login at**: http://localhost:5173/login
**Admin credentials**: admin@example.com / admin123
