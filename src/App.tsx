import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import Home from "./pages/Home";
import Metodo from "./pages/Metodo";
import Programas from "./pages/Programas";
import Ferramentas from "./pages/Ferramentas";
import Cursos from "./pages/Cursos";
import Conteudos from "./pages/Conteudos";
import Depoimentos from "./pages/Depoimentos";
import Comunidade from "./pages/Comunidade";
import Entrar from "./pages/Entrar";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/metodo" element={<Metodo />} />
            <Route path="/programas" element={<Programas />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/conteudos" element={<Conteudos />} />
            <Route path="/depoimentos" element={<Depoimentos />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/entrar" element={<Entrar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
