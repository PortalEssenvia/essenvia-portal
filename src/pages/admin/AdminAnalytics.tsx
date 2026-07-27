import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, MousePointerClick, Mail } from "lucide-react";

type EventRow = {
  id: string;
  event_name: string;
  properties: Record<string, unknown> | null;
  session_id: string | null;
  path: string | null;
  created_at: string;
};

type Subscriber = { id: string; email: string; source: string | null; created_at: string };

const RANGES = { "24h": 1, "7d": 7, "30d": 30 } as const;
type RangeKey = keyof typeof RANGES;

export default function AdminAnalytics() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date(Date.now() - RANGES[range] * 86400_000).toISOString();
    setLoading(true);
    Promise.all([
      supabase
        .from("analytics_events")
        .select("id,event_name,properties,session_id,path,created_at")
        .gte("created_at", from)
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("newsletter_subscribers")
        .select("id,email,source,created_at")
        .gte("created_at", from)
        .order("created_at", { ascending: false }),
    ]).then(([ev, ns]) => {
      setEvents((ev.data as EventRow[]) ?? []);
      setSubs((ns.data as Subscriber[]) ?? []);
      setLoading(false);
    });
  }, [range]);

  const stats = useMemo(() => {
    const pageViews = events.filter((e) => e.event_name === "page_view").length;
    const sessions = new Set(events.map((e) => e.session_id).filter(Boolean)).size;
    const popupOpen = events.filter((e) => e.event_name === "exit_popup_open").length;
    const popupClose = events.filter((e) => e.event_name === "exit_popup_close").length;
    const nlAttempt = events.filter((e) => e.event_name === "newsletter_submit_attempt").length;
    const nlSuccess = events.filter((e) => e.event_name === "newsletter_submit_success").length;
    const clicks = events.filter((e) => e.event_name.endsWith("_click")).length;
    const popupConv = popupOpen > 0 ? ((nlSuccess / popupOpen) * 100).toFixed(1) : "0.0";
    return { pageViews, sessions, popupOpen, popupClose, nlAttempt, nlSuccess, clicks, popupConv };
  }, [events]);

  const byEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) map.set(e.event_name, (map.get(e.event_name) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-verde-profundo">Analytics</h1>
          <p className="text-sm text-muted-foreground">Eventos, conversão e engajamento</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24h</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Pageviews" value={stats.pageViews} />
        <StatCard icon={<Users className="w-4 h-4" />} label="Sessões únicas" value={stats.sessions} />
        <StatCard icon={<MousePointerClick className="w-4 h-4" />} label="Cliques rastreados" value={stats.clicks} />
        <StatCard icon={<Mail className="w-4 h-4" />} label="Newsletter (sucesso)" value={stats.nlSuccess} sub={`${stats.nlAttempt} tentativas`} />
        <StatCard label="Popup aberto" value={stats.popupOpen} />
        <StatCard label="Popup fechado" value={stats.popupClose} />
        <StatCard label="Conversão popup → newsletter" value={`${stats.popupConv}%`} />
        <StatCard label="Inscritos (período)" value={subs.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Eventos por tipo</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : byEvent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Evento</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {byEvent.map(([name, count]) => (
                  <TableRow key={name}>
                    <TableCell className="font-mono text-sm">{name}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Inscritos na newsletter</CardTitle></CardHeader>
        <CardContent>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum inscrito neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.slice(0, 100).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.source ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Eventos recentes (últimos 50)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Propriedades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.slice(0, 50).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(e.created_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="font-mono text-xs">{e.event_name}</TableCell>
                  <TableCell className="text-xs">{e.path ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono max-w-[320px] truncate" title={JSON.stringify(e.properties)}>
                    {e.properties && Object.keys(e.properties).length > 0 ? JSON.stringify(e.properties) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon?: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
        <p className="mt-2 font-display text-2xl text-verde-profundo">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}