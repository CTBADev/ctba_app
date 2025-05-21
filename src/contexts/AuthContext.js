import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Hardcoded admin credentials for now
    if (email === "admin@ctba.co.za" && password === "CTBA2025!") {
      const user = { email, role: "admin" };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    }
    throw new Error("Invalid credentials");
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
