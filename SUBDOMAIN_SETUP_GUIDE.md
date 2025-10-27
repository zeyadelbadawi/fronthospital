# Subdomain Separation Setup Guide

## Overview
This guide explains how to set up and test the subdomain separation for your client portal. The client portal will be accessible at `client.localhost:3000` while the main application remains at `localhost:3000`.

## Local Development Setup

### Step 1: Update Your Hosts File

#### Windows (C:\Windows\System32\drivers\etc\hosts)
Add the following lines:
\`\`\`
127.0.0.1 localhost
127.0.0.1 client.localhost
\`\`\`

#### macOS/Linux (/etc/hosts)
Add the following lines:
\`\`\`
127.0.0.1 localhost
127.0.0.1 client.localhost
\`\`\`

### Step 2: Update Backend Environment Variables

In your `backend-project/.env` file, update the ALLOWED_ORIGINS:

\`\`\`env
ALLOWED_ORIGINS=http://localhost:3000,http://client.localhost:3000,http://localhost:3001,http://client.localhost:3001
\`\`\`

For production, add your domain and subdomain:
\`\`\`env
ALLOWED_ORIGINS=https://yourdomain.com,https://client.yourdomain.com
\`\`\`

### Step 3: Start Your Application

1. Start the backend server:
\`\`\`bash
cd backend-project
npm start
# Server runs on http://localhost:8070
\`\`\`

2. Start the frontend development server:
\`\`\`bash
npm run dev
# Frontend runs on http://localhost:3000
\`\`\`

## Testing the Subdomain Separation

### Test 1: Main Domain Access
1. Navigate to `http://localhost:3000`
2. You should see the main website
3. Click on "Client Portal" or navigate to `/clientportal`
4. You should be redirected to `http://client.localhost:3000/`

### Test 2: Client Subdomain Direct Access
1. Navigate to `http://client.localhost:3000/`
2. You should see the client portal homepage
3. All client portal pages should be accessible:
   - `http://client.localhost:3000/` (home)
   - `http://client.localhost:3000/book-appointment`
   - `http://client.localhost:3000/profile`
   - `http://client.localhost:3000/financial-records`

### Test 3: Authentication Flow
1. Go to `http://localhost:3000/sign-in`
2. Select "Patient" role
3. Enter patient credentials
4. You should be redirected to `http://client.localhost:3000/`
5. Verify you're on the client subdomain

### Test 4: RBAC Protection
1. Try accessing `http://client.localhost:3000/` without logging in
2. You should be redirected to the login page
3. Log in as a patient
4. You should have access to all client portal pages
5. Log in as a doctor/admin/accountant
6. You should be redirected to their respective portals

### Test 5: Cross-Subdomain Navigation
1. Log in as a patient on `http://client.localhost:3000/`
2. Try navigating to `http://localhost:3000/` (main domain)
3. You should be automatically redirected back to `http://client.localhost:3000/`

### Test 6: Logout Flow
1. Log in as a patient on the client portal
2. Click logout
3. You should be redirected to `http://localhost:3000/sign-in`
4. Verify the token is cleared from localStorage

## Production Deployment

### DNS Configuration
1. Create a CNAME record for your subdomain:
   - Subdomain: `client`
   - Points to: `yourdomain.com`

2. Or use A records pointing to your server IP:
   - `yourdomain.com` → Your Server IP
   - `client.yourdomain.com` → Your Server IP

### Environment Variables
Update your production environment variables:

**Frontend (.env.production)**
\`\`\`env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
\`\`\`

**Backend (.env.production)**
\`\`\`env
ALLOWED_ORIGINS=https://yourdomain.com,https://client.yourdomain.com
\`\`\`

### SSL/TLS Certificates
Ensure your SSL certificate covers both domains:
- `yourdomain.com`
- `*.yourdomain.com` (wildcard) or `client.yourdomain.com` (specific)

## Architecture Overview

### Middleware Flow
1. Request comes in with host header
2. Middleware detects subdomain from host
3. If subdomain is "client", request is rewritten to `/client` path
4. Next.js routes to appropriate layout and pages

### Authentication Flow
1. Patient logs in on main domain
2. SignInLayer detects patient role
3. Redirects to `client.{hostname}:{port}`
4. useRoleBasedAuth hook verifies subdomain
5. Patient is granted access to client portal

### RBAC Protection
1. All client portal pages wrapped with RBACWrapper
2. RBACWrapper uses useRoleBasedAuth hook
3. Hook checks user role and subdomain
4. Non-patient users redirected to their portals
5. Unauthenticated users redirected to login

## Troubleshooting

### Issue: Can't access client.localhost
**Solution:** Verify hosts file is updated correctly and restart your browser

### Issue: CORS errors in console
**Solution:** Check backend ALLOWED_ORIGINS environment variable includes client subdomain

### Issue: Redirects not working
**Solution:** Clear browser cache and localStorage, restart dev server

### Issue: Middleware not detecting subdomain
**Solution:** Verify middleware.ts is in the root directory and Next.js is restarted

### Issue: Token not persisting across subdomains
**Solution:** Ensure cookies are set with domain: `.localhost` for local dev

## File Structure

\`\`\`
app/
├── client/
│   ├── layout.tsx (Client portal layout)
│   ├── page.jsx (Client portal home)
│   ├── book-appointment/
│   │   └── page.jsx
│   ├── profile/
│   │   └── page.jsx
│   ├── financial-records/
│   │   └── page.jsx
│   ├── forgot-password/
│   │   └── page.jsx
│   └── reset-password/
│       └── page.jsx
├── layout.jsx (Main layout)
├── page.jsx (Main home)
└── ... (other main domain pages)

middleware.ts (Subdomain detection)
\`\`\`

## Key Files Modified

1. **middleware.ts** - Subdomain detection and routing
2. **app/client/layout.tsx** - Client portal layout
3. **app/client/** - Client portal pages
4. **components/SignInLayer.jsx** - Patient redirect to subdomain
5. **hooks/useRoleBasedAuth.js** - Subdomain-aware auth
6. **backend-project/config/cors.js** - CORS configuration

## Support

For issues or questions, refer to the implementation details in the code comments or contact your development team.
