import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { UrgencyBar } from "./UrgencyBar";
import { ReadingProgress } from "./ReadingProgress";
import { BackToTop } from "./BackToTop";
import { ExitIntentPopup } from "@/components/newsletter/ExitIntentPopup";
import { track } from "@/lib/track";

export const Layout = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { void track("page_view", { path: pathname }); }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-dourado focus:text-verde-profundo focus:font-semibold"
      >
        Pular para o conteúdo principal
      </a>
      <UrgencyBar />
      <Header />
      <ReadingProgress />
      <main
        id="main-content"
        className="flex-1 pt-20 md:pt-24"
        style={{ marginTop: "var(--urgency-h, 0px)" }}
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <ExitIntentPopup />
    </div>
  );
};
