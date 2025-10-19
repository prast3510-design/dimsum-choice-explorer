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

interface Criterion {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  weight: number;
}

export default function AdminCriteria() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdminAuth();
    fetchCriteria();
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

  const fetchCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from("criteria")
        .select("*")
        .order("name");

      if (error) throw error;
      setCriteria(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat kriteria");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingCriterion) {
        const { error } = await supabase
          .from("criteria")
          .update(formData)
          .eq("id", editingCriterion.id);

        if (error) throw error;
        toast.success("Kriteria berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("criteria").insert({
          ...formData,
          created_by: session.user.id,
        });

        if (error) throw error;
        toast.success("Kriteria berhasil ditambahkan!");
      }

      setDialogOpen(false);
      setEditingCriterion(null);
      setFormData({ name: "", description: "", is_active: true });
      fetchCriteria();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan kriteria");
    }
  };

  const handleEdit = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    setFormData({
      name: criterion.name,
      description: criterion.description || "",
      is_active: criterion.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kriteria ini?")) return;

    try {
      const { error } = await supabase.from("criteria").delete().eq("id", id);

      if (error) throw error;
      toast.success("Kriteria berhasil dihapus!");
      fetchCriteria();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus kriteria");
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
            <h1 className="text-4xl font-bold mb-2">Kelola Kriteria</h1>
            <p className="text-muted-foreground">Tambah, edit, atau hapus kriteria penilaian</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCriterion(null);
                  setFormData({ name: "", description: "", is_active: true });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kriteria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCriterion ? "Edit Kriteria" : "Tambah Kriteria Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingCriterion
                    ? "Perbarui informasi kriteria"
                    : "Masukkan informasi kriteria baru"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Kriteria</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Contoh: Rasa"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi kriteria..."
                    rows={3}
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
                  {editingCriterion ? "Perbarui" : "Tambah"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Kriteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {criterion.name}
                      {!criterion.is_active && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Tidak Aktif
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(criterion)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(criterion.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {criteria.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada kriteria. Tambahkan kriteria baru untuk memulai.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
