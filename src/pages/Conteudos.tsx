import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Play } from "lucide-react";

const articles = [
  { title: "Como criar uma rotina matinal que realmente funciona", cat: "Rotina", color: "bg-dourado/20 text-dourado" },
  { title: "5 sinais de autossabotagem", cat: "Emocional", color: "bg-verde-medio/20 text-verde-medio" },
  { title: "O poder da gratidão: ciência e prática", cat: "Espiritualidade", color: "bg-azul-escuro/20 text-azul-escuro" },
  { title: "Como a meditação muda seu cérebro", cat: "Hábitos", color: "bg-bege text-verde-profundo" },
  { title: "Disciplina não é punição — é liberdade", cat: "Rotina", color: "bg-dourado/20 text-dourado" },
  { title: "Quando recair: como voltar sem culpa", cat: "Superação", color: "bg-verde-profundo/15 text-verde-profundo" },
];

const videos = [
  { title: "Introdução ao Método Nova Essenvia", duration: "12:34" },
  { title: "Meditação guiada: presença", duration: "18:02" },
  { title: "Como mapear seus gatilhos", duration: "9:45" },
  { title: "Detox digital em 7 dias", duration: "15:20" },
  { title: "Construindo nova identidade", duration: "22:10" },
  { title: "Plano anti-recaída", duration: "11:08" },
];

const Conteudos = () => (
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
              {articles.map((a) => (
                <Card key={a.title} className="overflow-hidden bg-card border-bege shadow-card hover:shadow-soft transition-smooth cursor-pointer">
                  <div className="h-40 bg-gradient-soft" />
                  <div className="p-6">
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 ${a.color}`}>{a.cat}</span>
                    <h3 className="font-display text-lg text-verde-profundo leading-snug">{a.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((v) => (
                <Card key={v.title} className="overflow-hidden bg-card border-bege shadow-card hover:shadow-soft transition-smooth cursor-pointer group">
                  <div className="aspect-video bg-gradient-deep relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-dourado/90 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <Play className="w-7 h-7 text-verde-profundo fill-verde-profundo ml-1" />
                    </div>
                    <span className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded bg-azul-escuro/80 text-bege-claro">{v.duration}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base text-verde-profundo">{v.title}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  </>
);

export default Conteudos;
