import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { youtubeEmbed } from "@/lib/youtube";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  url: string;
  title?: string;
}

export const VideoModal = ({ open, onOpenChange, url, title = "Vídeo" }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl p-0 bg-black border-0 [&>button]:hidden">
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <div className="aspect-video relative overflow-hidden">
        <iframe
          src={open ? youtubeEmbed(url) || "" : ""}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute left-0 w-full"
          style={{ top: "-60px", height: "calc(100% + 120px)" }}
        />
        <div className="absolute inset-0 z-40" />
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute -top-3 -right-3 md:top-2 md:right-2 z-50 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg ring-1 ring-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </DialogContent>
  </Dialog>
);