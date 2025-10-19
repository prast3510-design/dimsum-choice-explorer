import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChartBar, Users, Award, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-dimsum.jpg";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Temukan Dimsum Favorit Anda
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Sistem Pendukung Keputusan dengan Metode AHP untuk membantu Anda 
            memilih varian dimsum terbaik sesuai preferensi
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild className="text-lg">
              <Link to="/auth?mode=register">Mulai Sekarang</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Kenapa Menggunakan Sistem Kami?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Metode AHP yang terpercaya membantu Anda membuat keputusan yang tepat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <ChartBar className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Analisis Sistematis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Metode AHP menganalisis preferensi Anda secara sistematis dan terstruktur
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-2" />
                <CardTitle>User-Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interface yang mudah digunakan untuk semua kalangan pelanggan
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Hasil Akurat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rekomendasi berdasarkan perhitungan matematis yang akurat
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Personalisasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hasil yang disesuaikan dengan preferensi pribadi Anda
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Cara Kerja Sistem</h2>
            <p className="text-muted-foreground text-lg">
              Proses sederhana dalam 3 langkah
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Bandingkan Kriteria</h3>
              <p className="text-muted-foreground">
                Tentukan tingkat kepentingan dari setiap kriteria penilaian
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Nilai Varian</h3>
              <p className="text-muted-foreground">
                Berikan penilaian untuk setiap varian dimsum berdasarkan kriteria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Lihat Hasil</h3>
              <p className="text-muted-foreground">
                Dapatkan rekomendasi varian dimsum terbaik sesuai preferensi Anda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: 'var(--gradient-primary)' }}>
        <div className="container text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Siap Menemukan Dimsum Favorit?</h2>
          <p className="text-xl mb-8 opacity-95">
            Daftar sekarang dan mulai perjalanan kuliner Anda
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg">
            <Link to="/auth?mode=register">Daftar Gratis</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
