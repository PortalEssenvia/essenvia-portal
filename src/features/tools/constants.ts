import type { PracticeMeta, PracticeId } from "./types";

export const PRACTICES: PracticeMeta[] = [
  { id: "oracao", icon: "🙏", label: "Oração", color: "verde-profundo" },
  { id: "afirmacao", icon: "✨", label: "Afirmação Positiva", color: "dourado" },
  { id: "gratidao", icon: "🙌", label: "Gratidão", color: "verde-medio" },
  { id: "atividade", icon: "🏃", label: "Atividade Física", color: "verde-medio" },
  { id: "meditacao", icon: "🧘", label: "Meditação", color: "verde-profundo" },
  { id: "leitura", icon: "📚", label: "Leitura", color: "dourado" },
  { id: "visualizacao", icon: "🌟", label: "Visualizações", color: "dourado" },
  { id: "diario", icon: "📓", label: "Diário", color: "verde-profundo" },
];

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

export const todayKey = () => new Date().toISOString().slice(0, 10);

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