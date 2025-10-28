# Subdomain-Based Routing Implementation Guide

## Overview
This document outlines the complete subdomain-based routing system implemented for separating staff and client portals into different domains.

## Architecture

### Domain Structure
- **Main Domain**: `localhost:3000` (development) or `yourdomain.com` (production)
  - Client/Patient portal
  - Public pages: `/clientportal`, `/clientportal/forgot-password`, `/clientportal/reset-password`
  
- **Staff Subdomain**: `stuff.localhost:3000` (development) or `stuff.yourdomain.com` (production)
  - Admin, HeadDoctor, Doctor, Accountant portals
  - Public page: `/sign-in`

## Files Created/Modified

### New Files Created

#### 1. `/utils/subdomain-utils.js`
Core utility functions for subdomain detection and domain management:
- `getSubdomain()` - Extract subdomain from hostname
- `isStaffSubdomain()` - Check if on staff subdomain
- `isMainDomain()` - Check if on main domain
- `getCorrectDomainForRole(role)` - Get correct domain for a role
- `redirectToCorrectDomain(role, pathname)` - Redirect user to correct domain
- `isStaffRoute(pathname)` - Check if route is staff-only
- `isClientRoute(pathname)` - Check if route is client-only
- `isPublicRoute(pathname)` - Check if route is public
- `validateRouteAccess(pathname, role)` - Validate route access with detailed reasons

#### 2. `/middleware.js`
Next.js middleware for server-side subdomain routing validation:
- Prevents staff routes from being accessed on main domain
- Prevents client routes from being accessed on staff subdomain
- Enforces sign-in page location on staff subdomain only

### Modified Files

#### 1. `/config/routes-config.js`
- Added `STAFF_ROUTES` array - All staff-only routes
- Added `CLIENT_ROUTES` array - All client-only routes
- Updated `isRouteAllowed()` function to check domain-route matching
- Added domain validation logic

#### 2. `/hooks/useRoleBasedAuth.js`
- Integrated subdomain detection
- Added `validateRouteAccess()` checks
- Implemented domain-based redirects
- Added logic to redirect users to correct domain based on role
- Updated logout to redirect to correct sign-in page

#### 3. `/components/RBACWrapper.jsx`
- No changes needed (works with updated auth hook)

#### 4. `/app/error/page.jsx`
- Added domain-aware error messages
- Different messages for staff vs. client portals
- Domain-specific redirect buttons

#### 5. `/app/not-found.jsx`
- Added domain-aware 404 messages
- Domain-specific redirect logic

#### 6. `/components/SignInLayer.jsx`
- Added subdomain validation on mount
- Prevents non-staff users from accessing sign-in page
- Redirects authenticated users to correct dashboard
- Validates subdomain before allowing sign-in

#### 7. `/app/page.jsx`
- Added root path redirect logic
- Main domain root (`/`) redirects to `/clientportal`
- Staff subdomain root (`/`) shows admin dashboard

#### 8. `/helper/axiosSetup.js`
- Enhanced token refresh logic
- Added domain-aware redirect on token failure
- Improved error handling

## Routing Logic

### Access Control Flow

\`\`\`
User visits URL
    ↓
Middleware checks domain-route match
    ↓
useRoleBasedAuth hook validates access
    ↓
validateRouteAccess() checks:
    1. Is route public?
    2. Is user authenticated?
    3. Does domain match route type?
    4. Does role match domain?
    5. Is user authorized for this route?
    ↓
If valid → Render page
If invalid → Redirect appropriately
\`\`\`

### Redirect Scenarios

#### Unauthenticated Users
- On `stuff.localhost:3000` accessing protected route → `/error` (access denied)
- On `localhost:3000` accessing protected route → `/error` (access denied)
- Exception: `/sign-in` on staff subdomain and `/clientportal` on main domain are public

#### Cross-Domain Access
- Staff route on main domain → `/not-found`
- Client route on staff subdomain → `/not-found`

#### Role-Domain Mismatch
- Patient on staff subdomain → Redirect to `localhost:3000/clientportal`
- Staff role on main domain → Redirect to `stuff.localhost:3000/{dashboard}`

#### Sign-In Page
- Accessing `/sign-in` on main domain → Redirect to `/clientportal`
- Authenticated user on `/sign-in` → Redirect to dashboard

## Security Features

### Token Management
- Tokens stored in localStorage (can be upgraded to httpOnly cookies)
- Automatic token refresh on 401 errors
- Token cleared on refresh failure
- Domain-aware redirect on token expiration

### Input Validation
- Email validation in sign-in form
- Password length validation
- Input sanitization (XSS prevention)

### Account Lockout
- 5 failed login attempts trigger 15-minute lockout
- Lockout data stored per email address
- Lockout timer countdown displayed to user

### Domain Enforcement
- Middleware validates domain-route matching
- Client-side validation in auth hook
- Prevents unauthorized domain access

## Development vs. Production

### Development Setup
\`\`\`
Main Domain: localhost:3000
Staff Subdomain: stuff.localhost:3000

Note: For local development with subdomains, add to /etc/hosts:
127.0.0.1 localhost
127.0.0.1 stuff.localhost
\`\`\`

### Production Setup
\`\`\`
Main Domain: yourdomain.com
Staff Subdomain: stuff.yourdomain.com

DNS Configuration:
- yourdomain.com → Your app server
- stuff.yourdomain.com → Same app server (wildcard or explicit)
\`\`\`

## Testing Checklist

### Staff Subdomain Tests
- [ ] Access `/sign-in` on `stuff.localhost:3000` → Works
- [ ] Access `/sign-in` on `localhost:3000` → Redirects to `/clientportal`
- [ ] Access `/school` on `stuff.localhost:3000` as admin → Works
- [ ] Access `/school` on `localhost:3000` → Shows 404
- [ ] Access `/clientportal` on `stuff.localhost:3000` → Shows 404
- [ ] Unauthenticated access to `/school` on `stuff.localhost:3000` → Redirects to `/error`
- [ ] Patient login on `stuff.localhost:3000` → Redirects to `localhost:3000/clientportal`

### Main Domain Tests
- [ ] Access `/clientportal` on `localhost:3000` → Works
- [ ] Access `/clientportal` on `stuff.localhost:3000` → Shows 404
- [ ] Access `/school` on `localhost:3000` → Shows 404
- [ ] Unauthenticated access to `/profile` on `localhost:3000` → Redirects to `/error`
- [ ] Root path `/` on `localhost:3000` → Redirects to `/clientportal`
- [ ] Root path `/` on `stuff.localhost:3000` → Shows admin dashboard

### Authentication Tests
- [ ] Login as admin → Redirects to `/` on `stuff.localhost:3000`
- [ ] Login as doctor → Redirects to `/doctorportal` on `stuff.localhost:3000`
- [ ] Login as accountant → Redirects to `/accountantportal` on `stuff.localhost:3000`
- [ ] Logout from staff portal → Redirects to `/sign-in`
- [ ] Logout from client portal → Redirects to `/clientportal`
- [ ] Token expiration → Redirects to appropriate sign-in page

## Configuration Notes

### Environment Variables
Ensure these are set in your `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

### Next.js Configuration
The middleware is configured to run on all routes except static files and images.

### Browser Cookies
For production, consider upgrading token storage to httpOnly cookies for enhanced security.

## Troubleshooting

### Issue: Subdomain not working in development
**Solution**: Add entries to `/etc/hosts`:
\`\`\`
127.0.0.1 localhost
127.0.0.1 stuff.localhost
\`\`\`

### Issue: Middleware not triggering
**Solution**: Ensure `middleware.js` is in the root directory and properly configured.

### Issue: Token not persisting across redirects
**Solution**: Check localStorage is not being cleared. Verify token is being stored correctly.

### Issue: Infinite redirect loop
**Solution**: Check that `validateRouteAccess()` is not returning conflicting results. Review auth hook logic.

## Future Enhancements

1. **HttpOnly Cookies**: Upgrade token storage to httpOnly cookies for better security
2. **CSRF Protection**: Add CSRF token validation
3. **Rate Limiting**: Implement rate limiting on sign-in attempts
4. **Audit Logging**: Log all domain access attempts
5. **Multi-Factor Authentication**: Add MFA for staff accounts
6. **Session Management**: Implement session timeout and refresh
