import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Users, Clock, CreditCard, CheckCircle2, Search, Plus, Pencil, KeyRound,
  Check, X, Unlock, Download, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  callAdmin, downloadCSV, PLANS, PLAN_LABEL, PAYMENT_LABEL, STATUS_LABEL,
  type AdminLog, type AdminModule, type AdminUser, type PlanPermission,
  type UserPlan, type UserStatus,
} from "./AdminDashboardData";

const statusBadge = (s: UserStatus | null) => {
  if (!s) return <Badge variant="secondary">—</Badge>;
  const map: Record<UserStatus, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    blocked: "bg-red-100 text-red-800 border-red-200",
    trial: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return <Badge variant="outline" className={map[s]}>{STATUS_LABEL[s]}</Badge>;
};

const paymentBadge = (p: AdminUser["payment_status"]) => {
  if (!p) return <Badge variant="secondary">—</Badge>;
  const map = {
    paid: "bg-green-100 text-green-800 border-green-200",
    awaiting: "bg-amber-100 text-amber-800 border-amber-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  } as const;
  return <Badge variant="outline" className={map[p]}>{PAYMENT_LABEL[p]}</Badge>;
};

const planBadge = (p: AdminUser["plan"]) => {
  if (!p) return <Badge variant="secondary">—</Badge>;
  const map: Record<UserPlan, string> = {
    free: "bg-gray-100 text-gray-700 border-gray-200",
    pro: "bg-blue-100 text-blue-800 border-blue-200",
    premium: "bg-dourado/20 text-verde-profundo border-dourado/40",
  };
  return <Badge variant="outline" className={map[p]}>{PLAN_LABEL[p]}</Badge>;
};

const fmtDate = (s: string | null) => {
  if (!s) return "Nunca";
  const d = new Date(s);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `há ${Math.max(1, Math.floor(diff / 60))} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 2) return "ontem";
  if (diff < 86400 * 30) return `há ${Math.floor(diff / 86400)} dias`;
  return d.toLocaleDateString("pt-BR");
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, overdue: 0, activePaid: 0 });
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [perms, setPerms] = useState<PlanPermission[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState<string>("all");
  const [fPlan, setFPlan] = useState<string>("all");
  const [fPayment, setFPayment] = useState<string>("all");
  const [tab, setTab] = useState<string>("all");

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [accessUser, setAccessUser] = useState<AdminUser | null>(null);
  const [moduleModal, setModuleModal] = useState<Partial<AdminModule> | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, m, p, l] = await Promise.all([
        callAdmin<{ users: AdminUser[]; metrics: typeof metrics }>("list_users"),
        callAdmin<{ modules: AdminModule[] }>("list_modules"),
        callAdmin<{ permissions: PlanPermission[] }>("list_plan_permissions"),
        callAdmin<{ logs: AdminLog[] }>("list_logs"),
      ]);
      setUsers(u.users); setMetrics(u.metrics);
      setModules(m.modules); setPerms(p.permissions); setLogs(l.logs);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const counts = useMemo(() => ({
    all: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    trial: users.filter((u) => u.status === "trial").length,
  }), [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (tab === "pending" && u.status !== "pending") return false;
      if (tab === "blocked" && u.status !== "blocked") return false;
      if (tab === "trial" && u.status !== "trial") return false;
      if (fStatus !== "all" && u.status !== fStatus) return false;
      if (fPlan !== "all" && u.plan !== fPlan) return false;
      if (fPayment !== "all" && u.payment_status !== fPayment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(u.full_name ?? "").toLowerCase().includes(q) && !(u.email ?? "").toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [users, tab, fStatus, fPlan, fPayment, search]);

  const setStatus = async (id: string, status: UserStatus) => {
    try {
      await callAdmin("set_status", { user_id: id, status });
      toast.success("Status atualizado");
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const permMap = useMemo(() => {
    const m = new Map<string, boolean>();
    perms.forEach((p) => m.set(`${p.plan}:${p.module_slug}`, p.allowed));
    return m;
  }, [perms]);

  const togglePerm = async (plan: UserPlan, slug: string, allowed: boolean) => {
    try {
      await callAdmin("set_plan_permission", { plan, module_slug: slug, allowed });
      setPerms((prev) => {
        const i = prev.findIndex((p) => p.plan === plan && p.module_slug === slug);
        if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], allowed }; return copy; }
        return [...prev, { plan, module_slug: slug, allowed }];
      });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-verde-profundo">Painel administrativo</h1>
        <p className="text-muted-foreground">Gestão de usuários, módulos e permissões.</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50 text-red-800 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1 opacity-80">Verifique se as colunas/tabelas do schema admin já foram criadas no banco.</p>
          </div>
        </Card>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Users className="w-4 h-4" />} title="Total de usuários" value={metrics.total} hint="cadastrados" />
        <MetricCard icon={<Clock className="w-4 h-4 text-amber-600" />} title="Aguardando aprovação" value={metrics.pending} hint="pendentes de revisão" valueClass="text-amber-600" />
        <MetricCard icon={<CreditCard className="w-4 h-4 text-red-600" />} title="Pagamento em atraso" value={metrics.overdue} hint="últimos 30 dias" valueClass="text-red-600" />
        <MetricCard icon={<CheckCircle2 className="w-4 h-4 text-green-600" />} title="Ativos (plano pago)" value={metrics.activePaid} hint={metrics.total ? `${Math.round((metrics.activePaid / metrics.total) * 100)}% do total` : "—"} valueClass="text-green-600" />
      </div>

      {/* Usuários */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-verde-profundo flex items-center gap-2"><Users className="w-5 h-5" /> Usuários</h2>
          <Button size="sm" variant="outline" disabled><Plus className="w-4 h-4 mr-1" />Novo usuário</Button>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou e-mail" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {(["active","pending","blocked","trial"] as UserStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fPlan} onValueChange={setFPlan}>
            <SelectTrigger><SelectValue placeholder="Todos os planos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              {PLANS.map((p) => <SelectItem key={p} value={p}>{PLAN_LABEL[p]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPayment} onValueChange={setFPayment}>
            <SelectTrigger><SelectValue placeholder="Pagamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos pagamentos</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="awaiting">Aguardando</SelectItem>
              <SelectItem value="overdue">Em atraso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-3">
          <TabsList>
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
            <TabsTrigger value="blocked">Bloqueados ({counts.blocked})</TabsTrigger>
            <TabsTrigger value="trial">Trial ({counts.trial})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Acesso liberado</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</TableCell></TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dourado/20 flex items-center justify-center text-verde-profundo font-medium text-sm overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.full_name ?? u.email ?? "?").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(u.status)}</TableCell>
                  <TableCell>{planBadge(u.plan)}</TableCell>
                  <TableCell>{paymentBadge(u.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {(u.access_modules ?? []).slice(0, 3).map((m) => (
                        <Badge key={m} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">{m}</Badge>
                      ))}
                      {(u.access_modules ?? []).length > 3 && <span className="text-xs text-muted-foreground">+{(u.access_modules ?? []).length - 3}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(u.last_seen_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Editar" onClick={() => setEditUser(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" title="Gerenciar acessos" onClick={() => setAccessUser(u)}><KeyRound className="w-4 h-4" /></Button>
                      {u.status === "pending" && (
                        <Button size="icon" variant="ghost" title="Aprovar" onClick={() => setStatus(u.id, "active")}><Check className="w-4 h-4 text-green-600" /></Button>
                      )}
                      {u.status !== "blocked" ? (
                        <Button size="icon" variant="ghost" title="Bloquear" onClick={() => setStatus(u.id, "blocked")}><X className="w-4 h-4 text-red-600" /></Button>
                      ) : (
                        <Button size="icon" variant="ghost" title="Reativar" onClick={() => setStatus(u.id, "active")}><Unlock className="w-4 h-4 text-green-600" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Mostrando {filtered.length} de {users.length} usuários</p>
      </Card>

      {/* Módulos + Matriz */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-verde-profundo">Módulos do sistema</h2>
            <Button size="sm" onClick={() => setModuleModal({ slug: "", name: "", description: "", min_plan: "free", is_active: true })}>
              <Plus className="w-4 h-4 mr-1" />Novo módulo
            </Button>
          </div>
          <div className="space-y-2">
            {modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhum módulo cadastrado.</p>}
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button className="font-medium text-sm hover:underline text-left" onClick={() => setModuleModal(m)}>{m.name}</button>
                    <Badge variant="outline" className="text-xs">{PLAN_LABEL[m.min_plan]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                </div>
                <Switch
                  checked={m.is_active}
                  onCheckedChange={async (v) => {
                    try {
                      await callAdmin("toggle_module", { id: m.id, is_active: v });
                      setModules((prev) => prev.map((x) => x.id === m.id ? { ...x, is_active: v } : x));
                    } catch (e: any) { toast.error(e.message); }
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-xl text-verde-profundo mb-4">Matriz plano × acesso</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  {PLANS.map((p) => <TableHead key={p} className="text-center">{PLAN_LABEL[p]}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Adicione módulos para configurar.</TableCell></TableRow>
                ) : modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-sm">{m.name}</TableCell>
                    {PLANS.map((p) => (
                      <TableCell key={p} className="text-center">
                        <Switch
                          checked={!!permMap.get(`${p}:${m.slug}`)}
                          onCheckedChange={(v) => togglePerm(p, m.slug, v)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Log */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-verde-profundo">Log de atividades</h2>
          <Button size="sm" variant="outline" onClick={() => downloadCSV("admin-logs.csv", logs.map((l) => ({
            data: l.created_at, acao: l.action, alvo: l.target_user_id ?? "", por: l.performed_by ?? "",
            detalhes: JSON.stringify(l.details ?? {}),
          })))}>
            <Download className="w-4 h-4 mr-1" />Exportar CSV
          </Button>
        </div>
        <div className="space-y-2 max-h-96 overflow-auto">
          {logs.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-0">
              <span className="text-xs text-muted-foreground w-32 shrink-0">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
              <Badge variant="outline" className="text-xs">{l.action}</Badge>
              <span className="text-muted-foreground text-xs truncate">{l.details ? JSON.stringify(l.details) : ""}</span>
            </div>
          ))}
        </div>
      </Card>

      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} onSaved={reload} />
      <AccessSheet user={accessUser} modules={modules} onClose={() => setAccessUser(null)} onSaved={reload} />
      <ModuleDialog module={moduleModal} onClose={() => setModuleModal(null)} onSaved={reload} />
    </div>
  );
}

function MetricCard({ icon, title, value, hint, valueClass }: { icon: React.ReactNode; title: string; value: number; hint?: string; valueClass?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{title}</div>
      <p className={`text-3xl font-display mt-2 ${valueClass ?? "text-verde-profundo"}`}>{value.toLocaleString("pt-BR")}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </Card>
  );
}

function EditUserDialog({ user, onClose, onSaved }: { user: AdminUser | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<AdminUser>>({});
  useEffect(() => { setForm(user ?? {}); }, [user]);
  if (!user) return null;
  const save = async () => {
    try {
      await callAdmin("update_user", {
        user_id: user.id,
        patch: {
          full_name: form.full_name,
          plan: form.plan,
          status: form.status,
          payment_status: form.payment_status,
          notes: form.notes,
        },
      });
      toast.success("Usuário atualizado");
      onSaved(); onClose();
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome</Label><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>E-mail</Label><Input value={user.email} disabled /></div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? ""} onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{(["active","pending","blocked","trial"] as UserStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plano</Label>
              <Select value={form.plan ?? ""} onValueChange={(v) => setForm({ ...form, plan: v as UserPlan })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p}>{PLAN_LABEL[p]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pagamento</Label>
              <Select value={form.payment_status ?? ""} onValueChange={(v) => setForm({ ...form, payment_status: v as any })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="awaiting">Aguardando</SelectItem>
                  <SelectItem value="overdue">Em atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Notas internas</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccessSheet({ user, modules, onClose, onSaved }: { user: AdminUser | null; modules: AdminModule[]; onClose: () => void; onSaved: () => void }) {
  const [access, setAccess] = useState<string[]>([]);
  useEffect(() => { setAccess(user?.access_modules ?? []); }, [user]);
  if (!user) return null;
  const toggle = (slug: string) => {
    setAccess((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };
  const save = async () => {
    try {
      await callAdmin("update_user", { user_id: user.id, patch: { access_modules: access } });
      toast.success("Acessos atualizados");
      onSaved(); onClose();
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>Acessos manuais — {user.full_name ?? user.email}</SheetTitle></SheetHeader>
        <p className="text-xs text-muted-foreground mt-2 mb-4">Sobrepõe a regra do plano atual ({PLAN_LABEL[user.plan ?? "free"]}).</p>
        <div className="space-y-2">
          {modules.map((m) => (
            <label key={m.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
              <Switch checked={access.includes(m.slug)} onCheckedChange={() => toggle(m.slug)} />
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={save}>Salvar</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ModuleDialog({ module, onClose, onSaved }: { module: Partial<AdminModule> | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<AdminModule>>({});
  useEffect(() => { setForm(module ?? {}); }, [module]);
  if (!module) return null;
  const save = async () => {
    if (!form.slug || !form.name) { toast.error("Slug e nome são obrigatórios"); return; }
    try {
      await callAdmin("upsert_module", {
        module: {
          ...(module.id ? { id: module.id } : {}),
          slug: form.slug, name: form.name,
          description: form.description ?? "",
          min_plan: form.min_plan ?? "free",
          is_active: form.is_active ?? true,
        },
      });
      toast.success("Módulo salvo");
      onSaved(); onClose();
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Dialog open={!!module} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{module.id ? "Editar módulo" : "Novo módulo"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nome</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Slug</Label><Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex: ferramentas" /></div>
          <div><Label>Descrição</Label><Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Plano mínimo</Label>
              <Select value={form.min_plan ?? "free"} onValueChange={(v) => setForm({ ...form, min_plan: v as UserPlan })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p}>{PLAN_LABEL[p]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Ativo</Label>
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}