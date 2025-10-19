import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Info } from "lucide-react";

interface Criterion {
  id: string;
  name: string;
  description: string;
}

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [comparisons, setComparisons] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCriteria();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from("criteria")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCriteria(data || []);

      // Initialize comparisons with default value (1 = sama penting)
      const initialComparisons: Record<string, number> = {};
      for (let i = 0; i < (data?.length || 0); i++) {
        for (let j = i + 1; j < (data?.length || 0); j++) {
          const key = `${data![i].id}_${data![j].id}`;
          initialComparisons[key] = 1;
        }
      }
      setComparisons(initialComparisons);
    } catch (error: any) {
      toast.error("Gagal memuat kriteria");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComparisons = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Delete existing comparisons for this user
      await supabase
        .from("comparisons")
        .delete()
        .eq("user_id", session.user.id);

      // Insert new comparisons
      const comparisonData = Object.entries(comparisons).map(([key, value]) => {
        const [criterion1_id, criterion2_id] = key.split("_");
        return {
          user_id: session.user.id,
          criterion1_id,
          criterion2_id,
          comparison_value: value,
        };
      });

      const { error } = await supabase
        .from("comparisons")
        .insert(comparisonData);

      if (error) throw error;

      toast.success("Perbandingan kriteria berhasil disimpan!");
      navigate("/evaluation");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan perbandingan");
    } finally {
      setSaving(false);
    }
  };

  const getComparisonValue = (c1: string, c2: string) => {
    return comparisons[`${c1}_${c2}`] || 1;
  };

  const setComparisonValue = (c1: string, c2: string, value: number) => {
    setComparisons(prev => ({
      ...prev,
      [`${c1}_${c2}`]: value,
    }));
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
        <Button variant="ghost" onClick={() => navigate("/customer")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Perbandingan Kriteria</h1>
          <p className="text-muted-foreground">
            Bandingkan tingkat kepentingan antar kriteria penilaian
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Matriks Perbandingan Berpasangan</CardTitle>
                <CardDescription>
                  Gunakan skala 1-9 untuk membandingkan kepentingan kriteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {criteria.map((c1, i) =>
                  criteria.slice(i + 1).map((c2) => (
                    <div key={`${c1.id}_${c2.id}`} className="space-y-2">
                      <Label className="font-semibold">
                        {c1.name} vs {c2.name}
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground min-w-[100px]">
                          {c1.name} lebih penting
                        </span>
                        <input
                          type="range"
                          min="1"
                          max="9"
                          step="1"
                          value={getComparisonValue(c1.id, c2.id)}
                          onChange={(e) =>
                            setComparisonValue(c1.id, c2.id, Number(e.target.value))
                          }
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-[100px] text-right">
                          {c2.name} lebih penting
                        </span>
                        <div className="w-12 text-center font-bold text-primary">
                          {getComparisonValue(c1.id, c2.id)}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <Button onClick={handleSaveComparisons} disabled={saving} className="w-full mt-6">
                  {saving ? "Menyimpan..." : "Simpan & Lanjut ke Penilaian Varian"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Panduan Skala
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">1</span>
                  <span className="text-sm text-muted-foreground">Sama penting</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">3</span>
                  <span className="text-sm text-muted-foreground">Sedikit lebih penting</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">5</span>
                  <span className="text-sm text-muted-foreground">Lebih penting</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">7</span>
                  <span className="text-sm text-muted-foreground">Sangat lebih penting</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold">9</span>
                  <span className="text-sm text-muted-foreground">Mutlak lebih penting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
