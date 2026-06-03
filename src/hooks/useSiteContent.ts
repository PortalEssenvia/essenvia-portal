import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteContent(page: string) {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("section_key, value")
      .eq("page", page)
      .then(({ data }) => {
        if (cancelled) return;
        const m: Record<string, string> = {};
        (data || []).forEach((r: any) => { m[r.section_key] = r.value; });
        setMap(m);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  const get = (key: string, fallback = "") => map[key] ?? fallback;
  return { get, loading, map };
}