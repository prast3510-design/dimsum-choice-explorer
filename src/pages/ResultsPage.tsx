import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

interface Result {
  id: string;
  final_score: number;
  ranking: number;
  variants: {
    name: string;
    description: string;
    price: number;
  };
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchResults();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchResults = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          variants (
            name,
            description,
            price
          )
        `)
        .eq("user_id", session.user.id)
        .order("ranking");

      if (error) throw error;
      setResults(data || []);

      if (!data || data.length === 0) {
        toast.info("Belum ada hasil penilaian. Mulai penilaian baru?");
      }
    } catch (error: any) {
      toast.error("Gagal memuat hasil");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-orange-600" />;
      default:
        return null;
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

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Belum Ada Hasil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Anda belum melakukan penilaian. Mulai penilaian untuk mendapatkan rekomendasi
                dimsum favorit Anda.
              </p>
              <Button onClick={() => navigate("/comparison")} className="w-full">
                Mulai Penilaian
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
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
          <h1 className="text-4xl font-bold mb-2">Hasil Penilaian AHP</h1>
          <p className="text-muted-foreground">
            Rekomendasi varian dimsum berdasarkan preferensi Anda
          </p>
        </div>

        {/* Top 3 Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {results.slice(0, 3).map((result) => (
            <Card
              key={result.id}
              className={`border-2 ${
                result.ranking === 1
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                  : result.ranking === 2
                  ? "border-gray-400 bg-gray-50 dark:bg-gray-950/20"
                  : "border-orange-600 bg-orange-50 dark:bg-orange-950/20"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Peringkat {result.ranking}</CardTitle>
                  {getRankIcon(result.ranking)}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold mb-2">{result.variants.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {result.variants.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Rp {result.variants.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {(result.final_score * 100).toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Semua Hasil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index < 3 ? "bg-secondary/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 font-bold text-primary">
                      {result.ranking}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{result.variants.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.variants.description}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Rp {result.variants.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {(result.final_score * 100).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Skor</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t flex gap-4">
              <Button onClick={() => navigate("/comparison")} className="flex-1">
                Penilaian Baru
              </Button>
              <Button onClick={() => window.print()} variant="outline" className="flex-1">
                Cetak Hasil
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
