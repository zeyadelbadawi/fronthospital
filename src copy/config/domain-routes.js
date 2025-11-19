/**
 * CENTRALIZED DOMAIN ROUTES CONFIGURATION
 * Single source of truth for all route definitions
 * Used by middleware, routes-config, and subdomain-utils
 */

export const DOMAIN_ROUTES = {
    // Staff portal routes (stuff.localhost:3000 or stuff.yourdomain.com)
    staff: [
        "/",
        "/accountantportal",
        "/accountantportal/Payment-Transactions",
        "/accountantportal/checks",
        "/accountantportal/full-program-payment",
        "/accountantportal/profile-accountant",
        "/accountantportal/cash-payments",
        "/accountantportal/bank-transfer-payments",
        "/full-program",
        "/single-session",
        "/school",
        "/doctorportal",
        "/doctorportal/profile-doctor",
        "/calendar-main",
        "/Admin-Book-Appointment",
        "/full-program-appointments",
        "/appointments/add-appointments",
        "/appointments",
        "/student/list",
        "/student/add",
        "/student/edit",
        "/student/view",
        "/doctor/list",
        "/doctor/add",
        "/doctor/edit",
        "/accountant/list",
        "/accountant/add",
        "/accountant/edit",
        "/Payment-Transactions",
        "/checks",
        "/drive-link",
    ],

    // Client portal routes (localhost:3000 or yourdomain.com)
    client: ["/clientportal", "/Book-Appointment", "/profile", "/financial-records", "/student-calendar"],

    // Public routes on staff subdomain (accessible without authentication)
    publicStaff: ["/sign-in", "/error", "/not-found"],

    // Public routes on main domain (accessible without authentication)
    publicClient: [
        "/clientportal",
        "/clientportal/forgot-password",
        "/clientportal/reset-password",
        "/error",
        "/not-found",
    ],
}

/**
 * Check if a route is a staff route
 * @param {string} pathname - Route pathname
 * @returns {boolean}
 */
export function isStaffRoute(pathname) {
    return DOMAIN_ROUTES.staff.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

/**
 * Check if a route is a client route
 * @param {string} pathname - Route pathname
 * @returns {boolean}
 */
export function isClientRoute(pathname) {
    return DOMAIN_ROUTES.client.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

/**
 * Check if a route is public on staff subdomain
 * @param {string} pathname - Route pathname
 * @returns {boolean}
 */
export function isPublicStaffRoute(pathname) {
    return DOMAIN_ROUTES.publicStaff.includes(pathname)
}

/**
 * Check if a route is public on client domain
 * @param {string} pathname - Route pathname
 * @returns {boolean}
 */
export function isPublicClientRoute(pathname) {
    return DOMAIN_ROUTES.publicClient.some((route) => pathname === route || pathname.startsWith(route + "/"))
}
