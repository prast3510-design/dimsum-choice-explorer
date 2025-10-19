import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Award, BarChart3, ChefHat } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVariants: 0,
    totalCriteria: 0,
    totalEvaluations: 0,
  });

  useEffect(() => {
    checkAdminAuth();
    fetchStats();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "admin") {
      navigate("/customer");
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, variantsRes, criteriaRes, evaluationsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("variants").select("*", { count: "exact", head: true }),
        supabase.from("criteria").select("*", { count: "exact", head: true }),
        supabase.from("results").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalVariants: variantsRes.count || 0,
        totalCriteria: criteriaRes.count || 0,
        totalEvaluations: evaluationsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola sistem dan monitor aktivitas pengguna</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-5 w-5 text-primary" />
                Varian Dimsum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalVariants}</p>
              <p className="text-sm text-muted-foreground mt-1">Varian tersedia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Kriteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalCriteria}</p>
              <p className="text-sm text-muted-foreground mt-1">Kriteria penilaian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Penilaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalEvaluations}</p>
              <p className="text-sm text-muted-foreground mt-1">Penilaian dilakukan</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate("/admin/criteria")}
                className="w-full p-3 text-left rounded-lg border hover:bg-secondary transition-colors"
              >
                <p className="font-semibold">Kelola Kriteria</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus kriteria penilaian</p>
              </button>
              <button
                onClick={() => navigate("/admin/variants")}
                className="w-full p-3 text-left rounded-lg border hover:bg-secondary transition-colors"
              >
                <p className="font-semibold">Kelola Varian Dimsum</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus varian dimsum</p>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Status Sistem</span>
                <span className="font-semibold text-green-600">Aktif</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="font-semibold text-green-600">Terhubung</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Metode Analisis</span>
                <span className="font-semibold">AHP</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
