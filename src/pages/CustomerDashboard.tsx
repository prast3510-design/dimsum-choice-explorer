import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Award, TrendingUp } from "lucide-react";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    lastResult: null as any,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
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

    if (roleData?.role === "admin") {
      navigate("/admin");
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get total evaluations
      const { count } = await supabase
        .from("results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      // Get last result with variant name
      const { data: lastResult } = await supabase
        .from("results")
        .select(`
          *,
          variants (name)
        `)
        .eq("user_id", session.user.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalEvaluations: count || 0,
        lastResult,
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
          <h1 className="text-4xl font-bold mb-2">Dashboard Customer</h1>
          <p className="text-muted-foreground">Kelola penilaian dan lihat hasil rekomendasi dimsum Anda</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Penilaian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalEvaluations}</p>
              <p className="text-sm text-muted-foreground mt-1">Penilaian yang telah dilakukan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Rekomendasi Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.lastResult?.variants?.name || "-"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.lastResult ? `Skor: ${Number(stats.lastResult.final_score).toFixed(2)}` : "Belum ada penilaian"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Aktif</p>
              <p className="text-sm text-muted-foreground mt-1">Akun terverifikasi</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mulai Penilaian Baru</CardTitle>
            <CardDescription>
              Ikuti proses penilaian untuk mendapatkan rekomendasi dimsum terbaik sesuai preferensi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={() => navigate("/comparison")} size="lg" className="w-full">
                Mulai Perbandingan Kriteria
              </Button>
              <Button onClick={() => navigate("/results")} variant="outline" size="lg" className="w-full">
                Lihat Hasil Sebelumnya
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <h3 className="font-semibold mb-2">Cara Menggunakan Sistem:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Bandingkan tingkat kepentingan antar kriteria penilaian</li>
                <li>Berikan nilai untuk setiap varian dimsum</li>
                <li>Sistem akan menghitung dan memberikan rekomendasi terbaik</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
