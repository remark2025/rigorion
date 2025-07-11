
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  session: Session | null; // Add the session property
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Export the AuthContext so it can be imported elsewhere
export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null, // Initialize the session property
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null); // Add state for session
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setUser(currentSession?.user ?? null);
        setSession(currentSession); // Store the session
        
        // Log the JWT token to console
        if (currentSession?.access_token) {
          console.log('JWT Token:', currentSession.access_token);
        }
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          // Important: Make sure to set loading to false when there's no session
          setLoading(false);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setUser(newSession?.user ?? null);
            setSession(newSession); // Update session on auth state change
            
            // Log the JWT token to console when it changes
            if (newSession?.access_token) {
              console.log('JWT Token (on auth state change):', newSession.access_token);
            }
            
            if (newSession?.user) {
              await fetchProfile(newSession.user.id);
            } else {
              setProfile(null);
              setLoading(false);
            }
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating default profile for user:", userId);
          setProfile({
            id: userId,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            avatar_url: null,
            updated_at: new Date().toISOString()
          });
          setLoading(false);
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // Create a fallback profile from user data instead of showing error
      if (user) {
        console.log("Creating fallback profile from user data");
        setProfile({
          id: userId,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email);
      console.log("Supabase URL:", SUPABASE_URL);
      console.log("Supabase Key (first 20 chars):", SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + "...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign-in response:", { data, error });

      if (error) throw error;

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Sign-in error details:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      toast({
        title: "Sign In Failed",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });

      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error("Sign-out error:", error.message);
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, // Add session to context value
      loading, 
      signUp, 
      signIn, 
      signOut, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
