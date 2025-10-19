import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { ChefHat, LogOut } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch user role
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setRole(data?.role ?? null);
          });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setRole(data?.role ?? null);
          });
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Koki Dimsum Blok M
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=register">Daftar</Link>
              </Button>
            </>
          ) : (
            <>
              {role === "admin" ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/admin">Dashboard Admin</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/admin/criteria">Kelola Kriteria</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/admin/variants">Kelola Varian</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/customer">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/comparison">Mulai Penilaian</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/results">Hasil Saya</Link>
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
