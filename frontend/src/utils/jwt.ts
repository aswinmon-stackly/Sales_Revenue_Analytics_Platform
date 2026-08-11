

export interface DecodedToken {
  sub: string;
  name?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Decodes JWT payload without external dependencies
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Helper to safely extract user profile from LocalStorage token/user payload
 */
export function getUserFromStorage(): { name: string; email: string; role: string } | null {
  const token = localStorage.getItem('access_token');
  const storedUser = localStorage.getItem('user');

  // Priority 1: Check cached user JSON object
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return {
        name: parsed.name ?? 'User',
        email: parsed.email ?? '',
        role: parsed.role ?? 'USER',
      };
    } catch {
      // Fallback to token if JSON parsing fails
    }
  }

  // Priority 2: Extract directly from JWT access token
  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      return {
        name: decoded.name ?? 'Admin User',
        email: decoded.email ?? 'admin@example.com',
        role: decoded.role ?? 'ADMIN',
      };
    }
  }

  return null;
}