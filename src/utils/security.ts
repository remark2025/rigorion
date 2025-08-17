/**
 * Security utilities for client-side protection
 * Implements defense-in-depth security measures
 */

// CSP violation handler
export function setupCSPViolationReporting() {
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
    });
    
    // Report to analytics/monitoring service
    if (window.gtag) {
      window.gtag('event', 'csp_violation', {
        blocked_uri: event.blockedURI,
        violated_directive: event.violatedDirective,
      });
    }
  });
}

// Input sanitization utilities
export class InputSanitizer {
  private static htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  static escapeHtml(text: string): string {
    return text.replace(/[&<>"'/]/g, (char) => this.htmlEscapeMap[char]);
  }

  static sanitizeForStorage(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.escapeHtml(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForStorage(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.escapeHtml(key)] = this.sanitizeForStorage(value);
      }
      return sanitized;
    }
    
    return data;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateQuestionId(id: string): boolean {
    // Only allow alphanumeric characters, hyphens, and underscores
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 50;
  }

  static sanitizePackId(packId: string): string {
    // Remove any non-alphanumeric characters except hyphens and underscores
    return packId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
  }
}

// URL and navigation security
export class NavigationSecurity {
  private static allowedDomains = [
    'localhost',
    '127.0.0.1',
    'your-domain.com', // Replace with actual domain
    'supabase.co',
    'stripe.com',
  ];

  static isUrlSafe(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Block javascript: and data: URLs
      if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
        return false;
      }
      
      // Only allow HTTPS in production
      if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Check against allowed domains
      return this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  static safeRedirect(url: string): void {
    if (this.isUrlSafe(url)) {
      window.location.href = url;
    } else {
      console.warn('Blocked unsafe redirect to:', url);
      // Redirect to safe default
      window.location.href = '/';
    }
  }

  static safeOpen(url: string): void {
    if (this.isUrlSafe(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('Blocked unsafe window.open to:', url);
    }
  }
}

// Storage security
export class StorageSecurity {
  private static sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'session',
    'private',
  ];

  static isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
  }

  static secureSetItem(key: string, value: string): boolean {
    try {
      if (this.isSensitiveKey(key)) {
        console.warn('Attempting to store sensitive data in localStorage:', key);
        return false;
      }
      
      // Encrypt sensitive data before storage (implement as needed)
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to store item securely:', error);
      return false;
    }
  }

  static secureGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  }

  static clearSensitiveData(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.isSensitiveKey(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage too
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Failed to clear sensitive data:', error);
    }
  }
}

// API request security
export class APIRequestSecurity {
  private static trustedOrigins = [
    'https://your-domain.com', // Replace with actual domain
    'https://*.supabase.co',
  ];

  static validateRequestOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.trustedOrigins.some(trusted => {
        if (trusted.includes('*')) {
          const domain = trusted.replace('https://*.', '');
          return urlObj.hostname.endsWith(domain);
        }
        return urlObj.origin === trusted;
      });
    } catch {
      return false;
    }
  }

  static secureHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...additionalHeaders,
    };
  }

  static async secureRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    if (!this.validateRequestOrigin(url)) {
      throw new Error('Request to untrusted origin blocked');
    }

    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...this.secureHeaders(),
        ...options.headers,
      },
      credentials: 'same-origin', // Prevent CSRF
    };

    return fetch(url, secureOptions);
  }
}

// Content security
export class ContentSecurity {
  private static allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'
  ];

  private static allowedAttributes = ['class', 'id'];

  static sanitizeHTML(html: string): string {
    // Create a temporary DOM element
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove all script tags
    temp.querySelectorAll('script').forEach(el => el.remove());
    
    // Remove event handlers
    temp.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        if (!this.allowedAttributes.includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Remove non-allowed tags
    temp.querySelectorAll('*').forEach(el => {
      if (!this.allowedTags.includes(el.tagName.toLowerCase())) {
        el.replaceWith(document.createTextNode(el.textContent || ''));
      }
    });

    return temp.innerHTML;
  }

  static validateQuestionContent(content: unknown): boolean {
    if (typeof content !== 'object' || !content) {
      return false;
    }

    const questionContent = content as Record<string, unknown>;
    
    // Check required fields
    const requiredFields = ['id', 'type', 'content'];
    for (const field of requiredFields) {
      if (!questionContent[field]) {
        return false;
      }
    }

    // Validate question ID
    if (!InputSanitizer.validateQuestionId(String(questionContent.id))) {
      return false;
    }

    // Validate content length
    const contentText = String(questionContent.content);
    if (contentText.length > 10000) { // Reasonable limit
      return false;
    }

    return true;
  }
}

// Session security
export class SessionSecurity {
  private static readonly MAX_SESSION_TIME = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

  static isSessionValid(sessionStart: number, lastActivity: number): boolean {
    const now = Date.now();
    
    // Check if session has exceeded maximum time
    if (now - sessionStart > this.MAX_SESSION_TIME) {
      return false;
    }
    
    // Check if user has been inactive too long
    if (now - lastActivity > this.ACTIVITY_TIMEOUT) {
      return false;
    }
    
    return true;
  }

  static recordActivity(): void {
    try {
      sessionStorage.setItem('lastActivity', Date.now().toString());
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  }

  static getLastActivity(): number {
    try {
      const lastActivity = sessionStorage.getItem('lastActivity');
      return lastActivity ? parseInt(lastActivity, 10) : Date.now();
    } catch (error) {
      console.error('Failed to get last activity:', error);
      return Date.now();
    }
  }

  static setupActivityTracking(): void {
    // Track user interactions
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.recordActivity();
      }, { passive: true });
    });

    // Check session validity periodically
    setInterval(() => {
      const sessionStart = parseInt(
        sessionStorage.getItem('sessionStart') || Date.now().toString(),
        10
      );
      const lastActivity = this.getLastActivity();
      
      if (!this.isSessionValid(sessionStart, lastActivity)) {
        console.warn('Session expired');
        // Clear sensitive data and redirect to login
        StorageSecurity.clearSensitiveData();
        NavigationSecurity.safeRedirect('/login');
      }
    }, 60000); // Check every minute
  }
}

// Initialize security measures
export function initializeSecurity(): void {
  console.log('🔒 Initializing security measures...');
  
  setupCSPViolationReporting();
  SessionSecurity.setupActivityTracking();
  
  // Set session start time
  if (!sessionStorage.getItem('sessionStart')) {
    sessionStorage.setItem('sessionStart', Date.now().toString());
  }
  
  // Disable right-click in production (optional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Disable F12, Ctrl+Shift+I, etc.
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    });
  }
  
  console.log('✅ Security initialization complete');
}

// Export utilities
export {
  setupCSPViolationReporting,
  InputSanitizer,
  NavigationSecurity,
  StorageSecurity,
  APIRequestSecurity,
  ContentSecurity,
  SessionSecurity,
};