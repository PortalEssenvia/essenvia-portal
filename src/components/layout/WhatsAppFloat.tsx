import { MessageCircle } from "lucide-react";

export const WhatsAppFloat = () => (
  <a
    href="https://wa.me/5500000000000"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco no WhatsApp"
    className="fixed bottom-6 right-6 z-50 bg-verde-medio hover:bg-verde-profundo text-bege-claro rounded-full p-4 shadow-gold transition-smooth animate-float"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);
