// Temporary in-memory storage for testing
const users: Array<{id: string; email: string; password: string; name?: string}> = [];

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export const AuthService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9), // Simple random ID
      email,
      password,
      name
    };
    users.push(newUser);

    console.log('Registered users:', users); // For debugging

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      access_token: 'fake-jwt-token-' + newUser.id
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    console.log('Login successful for:', email); // For debugging

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      access_token: 'fake-jwt-token-' + user.id
    };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): AuthResponse | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  },

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.access_token || null;
  },

  // For debugging
  getAllUsers(): User[] {
    return users.map(({ password: _, ...user }) => user);
  }
}; 