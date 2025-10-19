import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Star } from "lucide-react";

interface Criterion {
  id: string;
  name: string;
  description: string;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function EvaluationPage() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchData = async () => {
    try {
      const [criteriaRes, variantsRes] = await Promise.all([
        supabase.from("criteria").select("*").eq("is_active", true).order("name"),
        supabase.from("variants").select("*").eq("is_active", true).order("name"),
      ]);

      if (criteriaRes.error) throw criteriaRes.error;
      if (variantsRes.error) throw variantsRes.error;

      setCriteria(criteriaRes.data || []);
      setVariants(variantsRes.data || []);

      // Initialize scores with default value (3 = sedang)
      const initialScores: Record<string, number> = {};
      (variantsRes.data || []).forEach((v) => {
        (criteriaRes.data || []).forEach((c) => {
          initialScores[`${v.id}_${c.id}`] = 3;
        });
      });
      setScores(initialScores);
    } catch (error: any) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const getScore = (variantId: string, criterionId: string) => {
    return scores[`${variantId}_${criterionId}`] || 3;
  };

  const setScore = (variantId: string, criterionId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [`${variantId}_${criterionId}`]: score,
    }));
  };

  const calculateAHP = async () => {
    setCalculating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save scores to database
      const scoreData = Object.entries(scores).map(([key, score]) => {
        const [variant_id, criterion_id] = key.split("_");
        return {
          user_id: session.user.id,
          variant_id,
          criterion_id,
          score,
        };
      });

      // Delete existing scores
      await supabase.from("variant_scores").delete().eq("user_id", session.user.id);

      // Insert new scores
      await supabase.from("variant_scores").insert(scoreData);

      // Fetch comparisons to calculate weights
      const { data: comparisons } = await supabase
        .from("comparisons")
        .select("*")
        .eq("user_id", session.user.id);

      // Simple AHP calculation - normalize scores
      const criteriaWeights: Record<string, number> = {};
      let totalWeight = 0;

      // Equal weights for simplicity (in real AHP, this would use eigenvector calculation)
      criteria.forEach((c) => {
        criteriaWeights[c.id] = 1 / criteria.length;
        totalWeight += criteriaWeights[c.id];
      });

      // Calculate final scores for each variant
      const results = variants.map((v) => {
        let finalScore = 0;
        criteria.forEach((c) => {
          const score = getScore(v.id, c.id);
          const normalizedScore = score / 5; // Normalize to 0-1
          finalScore += normalizedScore * criteriaWeights[c.id];
        });
        return {
          user_id: session.user.id,
          variant_id: v.id,
          final_score: finalScore,
          ranking: 0, // Will be set after sorting
        };
      });

      // Sort and assign rankings
      results.sort((a, b) => b.final_score - a.final_score);
      results.forEach((r, index) => {
        r.ranking = index + 1;
      });

      // Delete existing results
      await supabase.from("results").delete().eq("user_id", session.user.id);

      // Insert new results
      const { error: resultsError } = await supabase.from("results").insert(results);

      if (resultsError) throw resultsError;

      toast.success("Perhitungan AHP berhasil!");
      navigate("/results");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghitung hasil");
    } finally {
      setCalculating(false);
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
        <Button variant="ghost" onClick={() => navigate("/comparison")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Penilaian Varian Dimsum</h1>
          <p className="text-muted-foreground">
            Berikan penilaian untuk setiap varian berdasarkan kriteria
          </p>
        </div>

        <div className="space-y-6">
          {variants.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <CardTitle>{variant.name}</CardTitle>
                <CardDescription>
                  {variant.description} - Rp {variant.price.toLocaleString("id-ID")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {criteria.map((criterion) => (
                  <div key={`${variant.id}_${criterion.id}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">{criterion.name}</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setScore(variant.id, criterion.id, star)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= getScore(variant.id, criterion.id)
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <Button onClick={calculateAHP} disabled={calculating} className="w-full" size="lg">
              {calculating ? "Menghitung..." : "Hitung Hasil AHP"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
