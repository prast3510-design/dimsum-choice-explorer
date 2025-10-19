import { Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Koki Dimsum Blok M</h3>
            <p className="text-muted-foreground text-sm">
              Sistem Pendukung Keputusan untuk membantu Anda menemukan varian dimsum
              favorit dengan metode AHP (Analytical Hierarchy Process).
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Kontak</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Blok M, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@kokidimsum.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Koki Dimsum Blok M. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};
