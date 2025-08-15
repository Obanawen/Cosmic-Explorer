// Clerk configuration for CKY domain restrictions
// This file contains configuration options that need to be set in the Clerk Dashboard

export const clerkConfigOptions = {
  // These settings need to be configured in your Clerk Dashboard:
  
  // 1. Go to "User & Authentication" → "Social Connections"
  // 2. Disable ALL social connections (Google, Facebook, etc.)
  
  // 3. Go to "Email, Phone, Username" → "Allowed email addresses and domains"
  // 4. Add: student.cky.edu.hk
  
  // 5. Go to "Email, Phone, Username" → "Email address"
  // 6. Enable "Email address required" and "Email verification required"
  
  // 7. Go to "Email, Phone, Username" → "Username"
  // 8. Disable "Username required"
  
  // The frontend components will handle hiding social buttons
  // Domain restriction is enforced at the Clerk service level
};

// Note: Most of these restrictions are configured in the Clerk Dashboard
// The frontend components use appearance props to hide social login options 