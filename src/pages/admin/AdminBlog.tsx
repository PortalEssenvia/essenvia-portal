import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Post { id: string; title: string; category: string; summary: string; content: string; image_url: string; sort_order: number; published: boolean; }

const empty: Omit<Post, "id"> = { title: "", category: "Geral", summary: "", content: "", image_url: "", sort_order: 0, published: true };

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("sort_order");
    setPosts((data as Post[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Post) => { setEditing(p); setForm({ title: p.title, category: p.category, summary: p.summary, content: p.content || "", image_url: p.image_url || "", sort_order: p.sort_order, published: p.published }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Título obrigatório"); return; }
    const { error } = editing
      ? await supabase.from("blog_posts").update(form).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este artigo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removido"); load();
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um arquivo de imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx 5MB)"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data, error: urlErr } = await supabase.storage.from("blog-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (urlErr || !data) { toast.error(urlErr?.message || "Falha ao gerar URL"); setUploading(false); return; }
    setForm((f) => ({ ...f, image_url: data.signedUrl }));
    setUploading(false);
    toast.success("Imagem enviada!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-verde-profundo">Blog</h1>
          <p className="text-muted-foreground">Artigos exibidos em Conteúdos.</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo artigo</Button>
      </div>

      <div className="space-y-3">
        {posts.length === 0 && <p className="text-muted-foreground">Nenhum artigo ainda.</p>}
        {posts.map((p) => (
          <Card key={p.id} className="p-4 border-bege flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-dourado/20 text-dourado font-semibold">{p.category}</span>
                {!p.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Rascunho</span>}
              </div>
              <p className="font-medium text-verde-profundo">{p.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{p.summary}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar artigo" : "Novo artigo"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Rotina, Emocional, Espiritualidade..." /></div>
            <div className="space-y-2">
              <Label>Imagem de capa</Label>
              <div className="flex items-center gap-2">
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Cole uma URL ou envie um arquivo" />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => document.getElementById("blog-image-file")?.click()}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span className="ml-1">Enviar</span>
                </Button>
                <input id="blog-image-file" type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files?.[0] || null); e.target.value = ""; }} />
              </div>
              {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-md border border-bege" />}
            </div>
            <div className="space-y-2"><Label>Resumo</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="min-h-[100px]" /></div>
            <div className="space-y-2"><Label>Conteúdo completo</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[240px]" placeholder="Escreva o artigo completo aqui. Use linhas em branco para separar parágrafos." /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publicado</Label></div>
            <Button onClick={save} variant="gold" className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}