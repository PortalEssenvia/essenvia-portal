import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Video, MessageSquareQuote, FileEdit } from "lucide-react";

const cards = [
  { to: "/admin/paginas", label: "Páginas", icon: FileEdit, desc: "Editar textos da Home, Método, Programas, Cursos e Comunidade." },
  { to: "/admin/blog", label: "Blog", icon: FileText, desc: "Gerenciar artigos exibidos em Conteúdos." },
  { to: "/admin/videos", label: "Vídeos", icon: Video, desc: "Adicionar links do YouTube." },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote, desc: "Editar depoimentos publicados." },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl text-verde-profundo mb-2">Painel</h1>
      <p className="text-muted-foreground mb-8">Gerencie todo o conteúdo do site.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="p-6 hover:shadow-soft transition-smooth border-bege cursor-pointer h-full">
              <c.icon className="w-8 h-8 text-dourado mb-3" />
              <h3 className="font-display text-xl text-verde-profundo mb-1">{c.label}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}