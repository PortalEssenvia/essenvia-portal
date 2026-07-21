import { Link } from "react-router-dom";
import { Instagram, Youtube, MessageCircle, ArrowUpRight } from "lucide-react";

const navLinks = [
  { to: "/metodo",      label: "O Método" },
  { to: "/programas",   label: "Os 7 Pilares" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/cursos",      label: "Cursos" },
  { to: "/conteudos",   label: "Conteúdos" },
  { to: "/depoimentos", label: "Depoimentos" },
];

const socials = [
  { href: "#", label: "Instagram", Icon: Instagram },
  { href: "#", label: "YouTube",   Icon: Youtube },
  { href: "#", label: "WhatsApp",  Icon: MessageCircle },
];

export const Footer = () => (
  <footer className="bg-gradient-deep text-bege">
    {/* Divider dourado */}
    <div className="divider-gold" />

    <div className="container py-16 grid gap-12 md:grid-cols-12">

      {/* Marca */}
      <div className="md:col-span-5">
        <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
          <img
            src="/logo.png"
            alt="Renovação Constante"
            className="h-12 w-12 object-contain rounded-full ring-1 ring-dourado/30 group-hover:ring-dourado/60 transition-smooth"
          />
          <div className="leading-none">
            <p className="font-display text-base tracking-[0.15em] text-dourado font-semibold">RENOVAÇÃO</p>
            <p className="font-display text-base tracking-[0.15em] text-bege-claro/80 font-semibold">CONSTANTE</p>
          </div>
        </Link>

        <p className="text-bege/70 max-w-sm leading-relaxed text-sm mb-6">
          Renove suas emoções. Renove sua história. Renove sua vida.
        </p>

        <p className="text-bege/40 text-xs leading-relaxed max-w-xs italic border-l border-dourado/30 pl-4">
          "Não buscamos apenas aliviar dores emocionais. Buscamos desenvolver pessoas
          capazes de se renovar continuamente."
        </p>
      </div>

      {/* Espaçador */}
      <div className="hidden md:block md:col-span-1" />

      {/* Navegação */}
      <div className="md:col-span-3">
        <h4 className="font-display text-dourado text-sm tracking-widest uppercase mb-5">
          Navegação
        </h4>
        <ul className="space-y-3">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="flex items-center gap-1.5 text-sm text-bege/65 hover:text-dourado transition-smooth group"
              >
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Redes sociais */}
      <div className="md:col-span-3">
        <h4 className="font-display text-dourado text-sm tracking-widest uppercase mb-5">
          Conecte-se
        </h4>
        <div className="flex gap-3 mb-6">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-10 h-10 rounded-full border border-dourado/25 flex items-center justify-center text-bege/60 hover:bg-dourado/15 hover:text-dourado hover:border-dourado/50 transition-smooth"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
        <p className="text-bege/40 text-xs">
          Siga nossas redes para conteúdos diários de renovação emocional e propósito.
        </p>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/8">
      <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-bege/35">
          © 2026 Método Renovação Constante. Todos os direitos reservados.
        </p>
        <p className="text-xs text-bege/25">
          Desenvolvido com propósito e intenção.
        </p>
      </div>
    </div>
  </footer>
);
