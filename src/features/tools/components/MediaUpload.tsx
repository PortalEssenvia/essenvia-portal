import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Music, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { fileToDataUrl } from "../utils";
import type { MediaFile } from "../types";
import { toast } from "sonner";

interface Props {
  label: string;
  accept: string;
  kind: "audio" | "video" | "image";
  value?: MediaFile;
  onChange: (m: MediaFile | undefined) => void;
}

const Icon = ({ kind }: { kind: Props["kind"] }) =>
  kind === "audio" ? <Music className="w-4 h-4" /> : kind === "video" ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />;

export function MediaUpload({ label, accept, kind, value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (f: File | null) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 15MB para o navegador).");
      return;
    }
    try {
      const m = await fileToDataUrl(f);
      onChange(m);
      toast.success("Arquivo carregado");
    } catch {
      toast.error("Falha ao carregar arquivo");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-verde-profundo flex items-center gap-2"><Icon kind={kind} />{label}</span>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <X className="w-4 h-4 mr-1" />Remover
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
            <Upload className="w-4 h-4 mr-1" />Carregar
          </Button>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files?.[0] || null)} />
      </div>
      {value && (
        <div className="rounded-lg overflow-hidden border border-bege bg-bege-claro p-2">
          {kind === "audio" && <audio controls className="w-full" src={value.dataUrl} />}
          {kind === "video" && <video controls className="w-full max-h-64" src={value.dataUrl} />}
          {kind === "image" && <img className="w-full max-h-48 object-cover rounded" src={value.dataUrl} alt={value.name} />}
          <p className="text-xs text-muted-foreground mt-1 truncate">{value.name}</p>
        </div>
      )}
    </div>
  );
}