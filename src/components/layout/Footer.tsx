import { Link } from "react-router-dom";
import { Instagram, Youtube, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-deep text-bege mt-24">
      <div className="container py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Nova Essenvia" className="h-14 w-auto bg-bege-claro/10 rounded-full p-1" />
            <span className="font-display text-2xl tracking-widest text-dourado">NOVA ESSENVIA</span>
          </div>
          <p className="text-bege/80 max-w-md leading-relaxed">
            Um caminho de volta para você. Consciência, cura, transformação e propósito.
          </p>
        </div>
        <div>
          <h4 className="font-display text-dourado text-base mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm text-bege/80">
            <li><Link to="/metodo" className="hover:text-dourado transition-smooth">Método</Link></li>
            <li><Link to="/programas" className="hover:text-dourado transition-smooth">Programas</Link></li>
            <li><Link to="/ferramentas" className="hover:text-dourado transition-smooth">Ferramentas</Link></li>
            <li><Link to="/cursos" className="hover:text-dourado transition-smooth">Cursos</Link></li>
            <li><Link to="/conteudos" className="hover:text-dourado transition-smooth">Conteúdos</Link></li>
            <li><Link to="/depoimentos" className="hover:text-dourado transition-smooth">Depoimentos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-dourado text-base mb-4">Conecte-se</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full border border-dourado/40 hover:bg-dourado/10 transition-smooth"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="YouTube" className="p-2 rounded-full border border-dourado/40 hover:bg-dourado/10 transition-smooth"><Youtube className="w-5 h-5" /></a>
            <a href="#" aria-label="WhatsApp" className="p-2 rounded-full border border-dourado/40 hover:bg-dourado/10 transition-smooth"><MessageCircle className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-dourado/20">
        <div className="container py-6 text-center text-sm text-bege/60">
          © 2026 Nova Essenvia. Todos os direitos reservados. | www.novaessenvia.com.br
        </div>
      </div>
    </footer>
  );
};
