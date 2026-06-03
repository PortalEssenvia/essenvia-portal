import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface T { id: string; name: string; role: string; content: string; avatar_url: string | null; sort_order: number; published: boolean; }
const empty: Omit<T, "id"> = { name: "", role: "", content: "", avatar_url: "", sort_order: 0, published: true };

export default function AdminDepoimentos() {
  const [list, setList] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    setList((data as T[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (t: T) => { setEditing(t); setForm({ name: t.name, role: t.role, content: t.content, avatar_url: t.avatar_url || "", sort_order: t.sort_order, published: t.published }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error("Nome e conteúdo obrigatórios"); return; }
    const payload = { ...form, avatar_url: form.avatar_url || null };
    const { error } = editing
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removido"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-verde-profundo">Depoimentos</h1>
          <p className="text-muted-foreground">Gerencie os depoimentos publicados.</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo depoimento</Button>
      </div>

      <div className="space-y-3">
        {list.length === 0 && <p className="text-muted-foreground">Nenhum depoimento ainda.</p>}
        {list.map((t) => (
          <Card key={t.id} className="p-4 border-bege flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-verde-profundo">{t.name}</p>
                {t.role && <span className="text-xs text-muted-foreground">— {t.role}</span>}
                {!t.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Rascunho</span>}
              </div>
              <p className="text-sm text-muted-foreground italic line-clamp-2">"{t.content}"</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar depoimento" : "Novo depoimento"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Local / papel</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="São Paulo, SP" /></div>
            <div className="space-y-2"><Label>Depoimento</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[120px]" /></div>
            <div className="space-y-2"><Label>URL do avatar (opcional)</Label><Input value={form.avatar_url || ""} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publicado</Label></div>
            <Button onClick={save} variant="gold" className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}