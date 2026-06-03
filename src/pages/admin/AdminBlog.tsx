import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Post { id: string; title: string; category: string; summary: string; sort_order: number; published: boolean; }

const empty: Omit<Post, "id"> = { title: "", category: "Geral", summary: "", sort_order: 0, published: true };

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("sort_order");
    setPosts((data as Post[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Post) => { setEditing(p); setForm({ title: p.title, category: p.category, summary: p.summary, sort_order: p.sort_order, published: p.published }); setOpen(true); };

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
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar artigo" : "Novo artigo"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Rotina, Emocional, Espiritualidade..." /></div>
            <div className="space-y-2"><Label>Resumo</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="min-h-[100px]" /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publicado</Label></div>
            <Button onClick={save} variant="gold" className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}