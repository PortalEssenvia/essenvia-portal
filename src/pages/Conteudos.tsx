import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { youtubeEmbed, youtubeThumb } from "@/lib/youtube";

interface Post { id: string; title: string; category: string; summary: string; content: string | null; image_url: string | null; }
interface Video { id: string; title: string; youtube_url: string; }

const Conteudos = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);

  useEffect(() => {
    supabase.from("blog_posts").select("id,title,category,summary,content,image_url").eq("published", true).order("sort_order")
      .then(({ data }) => setPosts((data as Post[]) || []));
    supabase.from("videos").select("id,title,youtube_url").eq("published", true).order("sort_order")
      .then(({ data }) => setVideos((data as Video[]) || []));
  }, []);

  return (
    <>
    <section className="py-20 bg-gradient-soft">
      <div className="container">
        <SectionHeader eyebrow="Conteúdos" title="Artigos e vídeos para sua jornada" />
      </div>
    </section>
    <section className="py-12">
      <div className="container">
        <Tabs defaultValue="blog" className="max-w-6xl mx-auto">
          <TabsList className="mx-auto grid grid-cols-2 w-full max-w-sm bg-bege mb-12">
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
          </TabsList>
          <TabsContent value="blog">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.length === 0 && <p className="text-muted-foreground col-span-full text-center">Em breve novos artigos.</p>}
              {posts.map((a) => (
                <Card key={a.id} onClick={() => setActivePost(a)} className="overflow-hidden bg-card border-bege shadow-card hover:shadow-soft transition-smooth cursor-pointer">
                  <div className="aspect-[4/3] bg-gradient-soft overflow-hidden">
                    {a.image_url && <img src={a.image_url} alt={a.title} className="w-full h-full object-contain" />}
                  </div>
                  <div className="p-6">
                    <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 bg-dourado/20 text-dourado">{a.category}</span>
                    <h3 className="font-display text-lg text-verde-profundo leading-snug">{a.title}</h3>
                    {a.summary && <p className="text-sm text-muted-foreground mt-2">{a.summary}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.length === 0 && <p className="text-muted-foreground col-span-full text-center">Em breve novos vídeos.</p>}
              {videos.map((v) => {
                const thumb = youtubeThumb(v.youtube_url);
                return (
                <Card key={v.id} onClick={() => setActive(v)} className="overflow-hidden bg-card border-bege shadow-card hover:shadow-soft transition-smooth cursor-pointer group">
                  <div className="aspect-video bg-gradient-deep relative flex items-center justify-center overflow-hidden">
                    {thumb && <img src={thumb} alt={v.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />}
                    <div className="w-16 h-16 rounded-full bg-dourado/90 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <Play className="w-7 h-7 text-verde-profundo fill-verde-profundo ml-1" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base text-verde-profundo">{v.title}</h3>
                  </div>
                </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
    <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
      <DialogContent className="max-w-3xl p-0 bg-black border-0 [&>button]:hidden">
        <DialogTitle className="sr-only">{active?.title}</DialogTitle>
        {active && (
          <div className="aspect-video relative overflow-hidden">
            {/* Iframe superdimensionado para cortar título (topo) e barra do YouTube (base) que aparecem no carregamento */}
            <iframe
              src={youtubeEmbed(active.youtube_url) || ""}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute left-0 w-full"
              style={{ top: "-60px", height: "calc(100% + 120px)" }}
            />
            {/* Bloqueia toda interação com o iframe (hover/click) para que nenhum overlay do YouTube apareça */}
            <div className="absolute inset-0 z-40" style={{ pointerEvents: "auto" }} />
            <button
              onClick={() => setActive(null)}
              aria-label="Fechar"
              className="absolute -top-3 -right-3 md:top-2 md:right-2 z-50 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg ring-1 ring-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    <Dialog open={!!activePost} onOpenChange={(o) => !o && setActivePost(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-card">
        {activePost && (
          <article>
            {activePost.image_url && (
              <img src={activePost.image_url} alt={activePost.title} className="w-full max-h-[60vh] object-contain bg-bege-claro" />
            )}
            <div className="p-8">
              <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 bg-dourado/20 text-dourado">{activePost.category}</span>
              <DialogTitle className="font-display text-3xl text-verde-profundo leading-tight mb-4">{activePost.title}</DialogTitle>
              {activePost.summary && <p className="text-muted-foreground italic mb-6">{activePost.summary}</p>}
              <div className="prose prose-sm md:prose-base max-w-none text-foreground">
                {(activePost.content || "Conteúdo em breve.").split(/\n\n+/).map((p, i) => (
                  <p key={i} className="mb-4 whitespace-pre-line leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </article>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Conteudos;
