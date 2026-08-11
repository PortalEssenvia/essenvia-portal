import type { PracticeMeta, PracticeId, SleepWindow } from "./types";

export const PRACTICES: PracticeMeta[] = [
  // ☀️ Manhã
  { id: "oracao", icon: "🙏", label: "Oração", color: "verde-profundo", period: "manha" },
  { id: "afirmacao", icon: "✨", label: "Afirmação Positiva", color: "dourado", period: "manha" },
  { id: "gratidao", icon: "🙌", label: "Gratidão", color: "verde-medio", period: "manha" },
  { id: "meditacao", icon: "🧘", label: "Meditação", color: "verde-profundo", period: "manha" },
  { id: "visualizacao", icon: "🌟", label: "Visualizações", color: "dourado", period: "manha" },
  { id: "atividade", icon: "🏃", label: "Atividade Física", color: "verde-medio", period: "manha" },
  // 🌙 Noite (higiene do sono)
  { id: "cafeina", icon: "☕", label: "Sem cafeína e álcool", color: "verde-medio", period: "noite" },
  { id: "telas", icon: "🌙", label: "Desligar telas", color: "verde-profundo", period: "noite" },
  { id: "relaxamento", icon: "🛁", label: "Ritual de relaxamento", color: "verde-medio", period: "noite" },
  { id: "diario", icon: "📓", label: "Diário", color: "verde-profundo", period: "noite" },
  { id: "gratidao_noite", icon: "🙏", label: "Gratidão da noite", color: "dourado", period: "noite" },
  { id: "leitura", icon: "📚", label: "Leitura", color: "dourado", period: "noite" },
  { id: "respiracao_sono", icon: "🧘", label: "Respiração para dormir", color: "verde-profundo", period: "noite" },
  { id: "ambiente_sono", icon: "🛏️", label: "Ambiente do sono", color: "verde-medio", period: "noite" },
];

export const MORNING_PRACTICES = PRACTICES.filter((p) => p.period === "manha");
export const NIGHT_PRACTICES = PRACTICES.filter((p) => p.period === "noite");

/** Janela de sono padrão. */
export const SLEEP_DEFAULTS: SleepWindow = { bedtime: "22:30", wakeTime: "06:00" };

/** Soma minutos a um horário "HH:MM" (com volta em 24h). */
export const addMinutes = (hhmm: string, delta: number): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = ((h * 60 + m + delta) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Horas de sono entre dormir e acordar. */
export const sleepHours = ({ bedtime, wakeTime }: SleepWindow): number => {
  const diff = (minutesOf(wakeTime) - minutesOf(bedtime) + 1440) % 1440;
  return Math.round((diff / 60) * 10) / 10;
};

/** Offsets em minutos APÓS acordar (início, fim). */
export const MORNING_OFFSETS: Record<string, [number, number]> = {
  oracao: [0, 10],
  afirmacao: [10, 20],
  gratidao: [20, 30],
  meditacao: [30, 50],
  visualizacao: [50, 60],
  atividade: [60, 110],
};

/** Offsets em minutos ANTES de dormir (início, fim). */
export const NIGHT_OFFSETS: Record<string, [number, number]> = {
  cafeina: [360, 350],
  telas: [90, 80],
  relaxamento: [60, 50],
  diario: [50, 40],
  gratidao_noite: [40, 35],
  leitura: [35, 15],
  respiracao_sono: [15, 10],
  ambiente_sono: [10, 5],
};

/** Horários sugeridos de uma prática a partir da janela de sono. */
export const scheduleFor = (id: string, sleep: SleepWindow): { startTime: string; endTime: string } => {
  const m = MORNING_OFFSETS[id];
  if (m) return { startTime: addMinutes(sleep.wakeTime, m[0]), endTime: addMinutes(sleep.wakeTime, m[1]) };
  const n = NIGHT_OFFSETS[id];
  if (n) return { startTime: addMinutes(sleep.bedtime, -n[0]), endTime: addMinutes(sleep.bedtime, -n[1]) };
  return { startTime: "07:00", endTime: "07:15" };
};

/** Orientações de higiene do sono para as práticas noturnas. */
export const NIGHT_GUIDES: Record<string, { intro: string; steps: string[] }> = {
  cafeina: {
    intro: "Cafeína pode permanecer no corpo por até 8 horas e o álcool fragmenta o sono profundo. Encerre o consumo cedo.",
    steps: [
      "Última dose de café, chá preto, mate ou energético no início da tarde",
      "Evitar álcool nas horas que antecedem o sono",
      "Jantar leve, sem refeições pesadas perto de dormir",
      "Reduzir líquidos na última hora para não acordar de madrugada",
    ],
  },
  telas: {
    intro: "A luz azul atrasa a melatonina. Desconectar antes de dormir acelera o adormecer.",
    steps: [
      "Guardar celular, TV e computador",
      "Ativar modo noturno nos aparelhos que ficarem ligados",
      "Deixar o celular fora do quarto ou em modo não perturbe",
      "Reduzir a iluminação da casa (luz amarela e baixa)",
    ],
  },
  relaxamento: {
    intro: "Um ritual repetido todas as noites ensina o corpo a reconhecer a hora de desacelerar.",
    steps: [
      "Banho morno",
      "Alongamento leve por 5 minutos",
      "Preparar o que precisa para amanhã",
      "Música calma ou silêncio",
    ],
  },
  gratidao_noite: {
    intro: "Fechar o dia reconhecendo o que foi bom reduz a ruminação mental na cama.",
    steps: [
      "Listar 3 coisas boas de hoje",
      "Reconhecer uma pessoa que ajudou",
      "Agradecer por algo simples do dia",
    ],
  },
  respiracao_sono: {
    intro: "Respiração lenta ativa o sistema parassimpático e prepara o corpo para dormir.",
    steps: [
      "Respiração 4-7-8 por 4 ciclos",
      "Relaxar o corpo dos pés à cabeça",
      "Soltar a mandíbula e os ombros",
      "Deixar os pensamentos passarem sem julgar",
    ],
  },
  ambiente_sono: {
    intro: "Escuro, silencioso e fresco: o quarto ideal para um sono profundo.",
    steps: [
      "Quarto escuro (cortina/máscara)",
      "Temperatura agradável (18–22 °C)",
      "Silêncio ou ruído branco",
      "Cama só para dormir e descansar",
      "Despertador definido no horário de acordar",
    ],
  },
};

export const WEEK_DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
] as const;

export const STORAGE_KEYS = {
  practicesConfig: "essenvia_practices_config",
  daily: (date: string) => `essenvia_daily_${date}`,
  diary: (date: string) => `essenvia_diary_${date}`,
  routine: "essenvia_routine",
  streak: "essenvia_streak",
  reading: "essenvia_reading",
  visualizations: "essenvia_visualizations",
  affirmations: "essenvia_affirmations",
  gratitudeList: "essenvia_gratitude_list",
  prayers: "essenvia_prayers",
} as const;

/**
 * FIX 01 — Retorna a data de hoje no fuso horário LOCAL do usuário (YYYY-MM-DD).
 * O problema original usava `new Date().toISOString().slice(0, 10)` que sempre
 * retorna a data em UTC. No Brasil (UTC-3), isso causava a data errada até as 03h da manhã.
 */
export const todayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Retorna uma data no formato YYYY-MM-DD no fuso horário LOCAL.
 * Substitui o padrão `date.toISOString().slice(0, 10)` em todo o projeto.
 */
export const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const PRACTICE_IDS: PracticeId[] = PRACTICES.map((p) => p.id);

export const PRAYER_SUGGESTIONS = [
  { id: "pai-nosso", title: "Pai Nosso", text: "Pai Nosso, que estais no céu, santificado seja o Vosso nome. Venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje. Perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido. E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém." },
  { id: "manha", title: "Oração da Manhã", text: "Senhor, obrigado por mais um dia. Guia meus passos, ilumina minha mente e protege minha família. Que eu seja instrumento do bem hoje." },
  { id: "paz", title: "Oração pela Paz Interior", text: "Que eu encontre paz em meu coração. Que eu tenha força para o que preciso mudar e serenidade para aceitar o que não posso mudar." },
  { id: "gratidao", title: "Oração de Gratidão", text: "Sou grato por cada respiração, por cada oportunidade e por todos que caminham comigo." },
];

export const AFFIRMATION_SUGGESTIONS = [
  "Eu sou capaz de superar qualquer desafio.",
  "Eu mereço amor, paz e abundância.",
  "Cada dia eu me torno uma versão melhor de mim.",
  "Eu tenho força, foco e determinação.",
  "Sou grato pela vida que tenho e pela que estou construindo.",
  "Minha mente é clara, meu coração é forte.",
  "Eu atraio o que penso e sinto com intenção.",
  "Sou livre de padrões que não me servem mais.",
];

export const GRATITUDE_SUGGESTIONS = [
  "Pela saúde que tenho.",
  "Pela família que me apoia.",
  "Por ter um lar e comida na mesa.",
  "Pelas amizades verdadeiras.",
  "Por cada aprendizado, inclusive os difíceis.",
  "Pela capacidade de recomeçar.",
  "Por este novo dia e suas possibilidades.",
  "Pelo meu crescimento espiritual e emocional.",
];

export const ACTIVITY_SUGGESTIONS = [
  { icon: "🚶", name: "Caminhada", durationMin: 30 },
  { icon: "🏃", name: "Corrida leve", durationMin: 20 },
  { icon: "🧘", name: "Yoga matinal", durationMin: 20 },
  { icon: "🏋️", name: "Musculação", durationMin: 45 },
  { icon: "🚴", name: "Ciclismo", durationMin: 30 },
  { icon: "🤸", name: "Alongamento", durationMin: 15 },
  { icon: "⚽", name: "Esporte coletivo", durationMin: 60 },
  { icon: "🏊", name: "Natação", durationMin: 30 },
];

export const ACTIVITY_ICONS = ["🏃", "🚴", "🏊", "🧘", "🏋️", "🤸", "⚽", "🎾", "🚶", "🏐", "🏀", "🥊"];

export const MEDITATION_SUGGESTIONS = [
  { name: "Respiração 4-7-8", durationMin: 5, type: "Respiração" as const, desc: "Inspire 4s, segure 7s, expire 8s. Repita 4 vezes." },
  { name: "Body Scan", durationMin: 10, type: "Guiada" as const, desc: "Percorra mentalmente cada parte do corpo, relaxando progressivamente." },
  { name: "Meditação da gratidão", durationMin: 10, type: "Guiada" as const, desc: "" },
  { name: "Foco na chama", durationMin: 5, type: "Silenciosa" as const, desc: "" },
  { name: "Guiada para ansiedade", durationMin: 15, type: "Guiada" as const, desc: "" },
  { name: "Para dormir", durationMin: 20, type: "Guiada" as const, desc: "" },
];

export const READING_SUGGESTIONS = [
  { title: "O Poder do Hábito", author: "Charles Duhigg" },
  { title: "Mindset", author: "Carol Dweck" },
  { title: "Os 7 Hábitos das Pessoas Altamente Eficazes", author: "Stephen Covey" },
  { title: "A Sutil Arte de Ligar o F*da-se", author: "Mark Manson" },
  { title: "Awaken the Giant Within", author: "Tony Robbins" },
  { title: "Ikigai", author: "Héctor García" },
];

export const VISUALIZATION_SUGGESTIONS = [
  "Visualize sua saúde perfeita: corpo forte, energia alta, mente clara.",
  "Imagine sua vida financeira abundante e próspera.",
  "Visualize seus relacionamentos cheios de amor e harmonia.",
  "Imagine-se alcançando seu maior objetivo hoje.",
  "Visualize sua paz interior — um lugar calmo e seguro dentro de você.",
];

export const DIARY_QUESTIONS = [
  { key: "mood", label: "Como eu me sinto agora, de 1 a 10?", type: "slider" as const },
  { key: "challenge", label: "Qual foi o maior desafio de hoje?", type: "text" as const },
  { key: "achievement", label: "Qual foi minha maior conquista do dia?", type: "text" as const },
  { key: "different", label: "O que eu poderia ter feito diferente?", type: "text" as const },
  { key: "beautiful", label: "Qual foi o momento mais bonito do dia?", type: "text" as const },
  { key: "learned", label: "O que aprendi hoje?", type: "text" as const },
];

export const ROUTINE_CATEGORIES = [
  { value: "Espiritual", icon: "🙏" },
  { value: "Mental", icon: "🧘" },
  { value: "Físico", icon: "💪" },
  { value: "Intelectual", icon: "📚" },
  { value: "Profissional", icon: "💼" },
  { value: "Alimentação", icon: "🍽️" },
  { value: "Descanso", icon: "😴" },
  { value: "Pessoal", icon: "🌱" },
] as const;

export const ROUTINE_TEMPLATES: Record<string, { name: string; activities: Omit<import("./types").RoutineActivity, "id">[] }> = {
  matinal: {
    name: "Rotina Matinal Essencial",
    activities: [
      { name: "Oração", startTime: "06:00", endTime: "06:15", category: "Espiritual", repeat: "daily", practiceId: "oracao" },
      { name: "Meditação", startTime: "06:15", endTime: "06:35", category: "Mental", repeat: "daily", practiceId: "meditacao" },
      { name: "Afirmações", startTime: "06:35", endTime: "06:45", category: "Mental", repeat: "daily", practiceId: "afirmacao" },
      { name: "Gratidão", startTime: "06:45", endTime: "06:55", category: "Espiritual", repeat: "daily", practiceId: "gratidao" },
      { name: "Visualização", startTime: "06:55", endTime: "07:10", category: "Mental", repeat: "daily", practiceId: "visualizacao" },
      { name: "Leitura", startTime: "07:10", endTime: "07:40", category: "Intelectual", repeat: "daily", practiceId: "leitura" },
      { name: "Atividade Física", startTime: "07:40", endTime: "08:30", category: "Físico", repeat: "daily", practiceId: "atividade" },
      { name: "Diário", startTime: "08:30", endTime: "08:45", category: "Pessoal", repeat: "daily", practiceId: "diario" },
    ],
  },
  performance: {
    name: "Rotina de Alta Performance",
    activities: [
      { name: "Despertar consciente", startTime: "05:30", endTime: "05:45", category: "Pessoal", repeat: "daily" },
      { name: "Oração", startTime: "05:45", endTime: "06:00", category: "Espiritual", repeat: "daily", practiceId: "oracao" },
      { name: "Meditação", startTime: "06:00", endTime: "06:20", category: "Mental", repeat: "daily", practiceId: "meditacao" },
      { name: "Atividade Física", startTime: "06:20", endTime: "07:20", category: "Físico", repeat: "daily", practiceId: "atividade" },
      { name: "Café da manhã", startTime: "07:30", endTime: "08:00", category: "Alimentação", repeat: "daily" },
      { name: "Bloco de trabalho focado", startTime: "08:30", endTime: "12:00", category: "Profissional", repeat: "daily" },
      { name: "Almoço", startTime: "12:00", endTime: "13:00", category: "Alimentação", repeat: "daily" },
      { name: "Bloco de trabalho", startTime: "13:30", endTime: "18:00", category: "Profissional", repeat: "daily" },
      { name: "Leitura", startTime: "20:00", endTime: "20:40", category: "Intelectual", repeat: "daily", practiceId: "leitura" },
      { name: "Diário & Gratidão", startTime: "21:30", endTime: "22:00", category: "Pessoal", repeat: "daily", practiceId: "diario" },
    ],
  },
  minima: {
    name: "Rotina Mínima Viável",
    activities: [
      { name: "Oração", startTime: "07:00", endTime: "07:05", category: "Espiritual", repeat: "daily", practiceId: "oracao" },
      { name: "Afirmações", startTime: "07:05", endTime: "07:10", category: "Mental", repeat: "daily", practiceId: "afirmacao" },
      { name: "Gratidão", startTime: "07:10", endTime: "07:15", category: "Espiritual", repeat: "daily", practiceId: "gratidao" },
      { name: "Meditação curta", startTime: "07:15", endTime: "07:25", category: "Mental", repeat: "daily", practiceId: "meditacao" },
      { name: "Diário", startTime: "07:25", endTime: "07:30", category: "Pessoal", repeat: "daily", practiceId: "diario" },
    ],
  },
};
