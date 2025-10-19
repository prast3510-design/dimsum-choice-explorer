import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Variant {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
}

export default function AdminVariants() {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdminAuth();
    fetchVariants();
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

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from("variants")
        .select("*")
        .order("name");

      if (error) throw error;
      setVariants(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat varian");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingVariant) {
        const { error } = await supabase
          .from("variants")
          .update(formData)
          .eq("id", editingVariant.id);

        if (error) throw error;
        toast.success("Varian berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("variants").insert({
          ...formData,
          created_by: session.user.id,
        });

        if (error) throw error;
        toast.success("Varian berhasil ditambahkan!");
      }

      setDialogOpen(false);
      setEditingVariant(null);
      setFormData({ name: "", description: "", price: 0, image_url: "", is_active: true });
      fetchVariants();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan varian");
    }
  };

  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      description: variant.description || "",
      price: variant.price,
      image_url: variant.image_url || "",
      is_active: variant.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus varian ini?")) return;

    try {
      const { error } = await supabase.from("variants").delete().eq("id", id);

      if (error) throw error;
      toast.success("Varian berhasil dihapus!");
      fetchVariants();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus varian");
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
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Kelola Varian Dimsum</h1>
            <p className="text-muted-foreground">Tambah, edit, atau hapus varian dimsum</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingVariant(null);
                  setFormData({
                    name: "",
                    description: "",
                    price: 0,
                    image_url: "",
                    is_active: true,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Varian
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? "Edit Varian" : "Tambah Varian Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingVariant ? "Perbarui informasi varian" : "Masukkan informasi varian baru"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Varian</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Contoh: Hakao Udang"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi varian..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Harga (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    placeholder="25000"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">URL Gambar (opsional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Status Aktif</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingVariant ? "Perbarui" : "Tambah"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{variant.name}</span>
                  {!variant.is_active && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Tidak Aktif
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
                <p className="text-lg font-bold mb-4">Rp {variant.price.toLocaleString("id-ID")}</p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(variant)} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(variant.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {variants.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Belum ada varian. Tambahkan varian baru untuk memulai.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
