import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { extractYoutubeId, youtubeThumb } from "@/lib/youtube";

interface Video { id: string; title: string; youtube_url: string; sort_order: number; published: boolean; }
const empty: Omit<Video, "id"> = { title: "", youtube_url: "", sort_order: 0, published: true };

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("videos").select("*").order("sort_order");
    setVideos((data as Video[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: Video) => { setEditing(v); setForm({ title: v.title, youtube_url: v.youtube_url, sort_order: v.sort_order, published: v.published }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Título obrigatório"); return; }
    if (!extractYoutubeId(form.youtube_url)) { toast.error("Link do YouTube inválido"); return; }
    const { error } = editing
      ? await supabase.from("videos").update(form).eq("id", editing.id)
      : await supabase.from("videos").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este vídeo?")) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removido"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-verde-profundo">Vídeos</h1>
          <p className="text-muted-foreground">Cole o link do YouTube — abre embedado no site.</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo vídeo</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {videos.length === 0 && <p className="text-muted-foreground">Nenhum vídeo ainda.</p>}
        {videos.map((v) => {
          const thumb = youtubeThumb(v.youtube_url);
          return (
            <Card key={v.id} className="p-4 border-bege flex gap-4">
              {thumb && <img src={thumb} alt="" className="w-28 h-20 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-verde-profundo truncate">{v.title}</p>
                <p className="text-xs text-muted-foreground truncate">{v.youtube_url}</p>
                {!v.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-block mt-1">Rascunho</span>}
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar vídeo" : "Novo vídeo"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Link do YouTube</Label><Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publicado</Label></div>
            <Button onClick={save} variant="gold" className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}