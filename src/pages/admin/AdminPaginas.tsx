import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type FieldDef = { key: string; label: string; multiline?: boolean };

const PAGES: { id: string; label: string; fields: FieldDef[] }[] = [
  {
    id: "home", label: "Home",
    fields: [
      { key: "hero_title", label: "Título principal" },
      { key: "hero_subtitle", label: "Subtítulo", multiline: true },
      { key: "cta_text", label: "Texto do CTA final", multiline: true },
    ],
  },
  {
    id: "metodo", label: "Método",
    fields: [
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", multiline: true },
    ],
  },
  {
    id: "programas", label: "Programas",
    fields: [
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", multiline: true },
    ],
  },
  {
    id: "cursos", label: "Cursos",
    fields: [
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", multiline: true },
    ],
  },
  {
    id: "comunidade", label: "Comunidade",
    fields: [
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", multiline: true },
    ],
  },
];

function PageEditor({ page, fields }: { page: string; fields: FieldDef[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_content").select("section_key, value").eq("page", page).then(({ data }) => {
      const m: Record<string, string> = {};
      (data || []).forEach((r: any) => { m[r.section_key] = r.value; });
      setValues(m);
    });
  }, [page]);

  const save = async () => {
    setSaving(true);
    const rows = fields.map((f) => ({ page, section_key: f.key, value: values[f.key] ?? "" }));
    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "page,section_key" });
    setSaving(false);
    if (error) toast.error("Erro ao salvar: " + error.message);
    else toast.success("Conteúdo salvo!");
  };

  return (
    <Card className="p-6 border-bege space-y-4">
      {fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label className="text-verde-profundo">{f.label}</Label>
          {f.multiline ? (
            <Textarea
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="min-h-[100px] bg-bege-claro"
            />
          ) : (
            <Input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="bg-bege-claro"
            />
          )}
        </div>
      ))}
      <Button onClick={save} disabled={saving} variant="gold">{saving ? "Salvando..." : "Salvar alterações"}</Button>
    </Card>
  );
}

export default function AdminPaginas() {
  return (
    <div>
      <h1 className="font-display text-3xl text-verde-profundo mb-2">Páginas</h1>
      <p className="text-muted-foreground mb-6">Edite os textos principais de cada página.</p>
      <Tabs defaultValue="home">
        <TabsList className="bg-bege mb-6 flex-wrap h-auto">
          {PAGES.map((p) => <TabsTrigger key={p.id} value={p.id}>{p.label}</TabsTrigger>)}
        </TabsList>
        {PAGES.map((p) => (
          <TabsContent key={p.id} value={p.id}>
            <PageEditor page={p.id} fields={p.fields} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}