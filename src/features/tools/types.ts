export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PracticeConfigBase {
  active: boolean;
  startTime: string; // "07:00"
  endTime: string;   // "07:15"
  days: WeekDay[];   // 0..6 (Sun..Sat)
}

export interface PrayerData extends PracticeConfigBase {
  text: string;
  fromHeart: boolean;
  customSuggestions: { id: string; title: string; text: string }[];
}

export interface AffirmationsData extends PracticeConfigBase {
  items: { id: string; text: string }[];
}

export interface GratitudeData extends PracticeConfigBase {
  items: { id: string; text: string }[];
}

export interface MediaFile {
  name: string;
  type: string;
  dataUrl: string; // base64
}

export interface PhysicalActivity {
  id: string;
  icon: string;
  name: string;
  durationMin: number;
  video?: MediaFile;
  audio?: MediaFile;
}

export interface PhysicalData extends PracticeConfigBase {
  activities: PhysicalActivity[];
}

export type MeditationType = "Guiada" | "Silenciosa" | "Respiração" | "Mantra";
export interface MeditationItem {
  id: string;
  name: string;
  durationMin: number;
  type: MeditationType;
  video?: MediaFile;
  audio?: MediaFile;
}
export interface MeditationData extends PracticeConfigBase {
  items: MeditationItem[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  startedAt?: string;
  finishedAt?: string;
  audio?: MediaFile;
  video?: MediaFile;
}
export interface ReadingData extends PracticeConfigBase {
  current?: Book;
  queue: Book[];
  history: Book[];
}

export interface VisualizationItem {
  id: string;
  title: string;
  description: string;
  images: MediaFile[];
  video?: MediaFile;
  audio?: MediaFile;
}
export interface VisualizationData extends PracticeConfigBase {
  items: VisualizationItem[];
}

export interface DiaryAnswers {
  mood?: number;
  challenge?: string;
  achievement?: string;
  different?: string;
  beautiful?: string;
  learned?: string;
}
export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  text: string;
  answers: DiaryAnswers;
}
export interface DiaryData extends PracticeConfigBase {}

/** Prática simples da noite (higiene do sono): orientação + checklist. */
export interface SleepStepData extends PracticeConfigBase {
  notes?: string;
  checked?: string[];
}

export interface SleepWindow {
  bedtime: string;  // "22:30"
  wakeTime: string; // "06:00"
}

export type RoutineCategory =
  | "Espiritual" | "Mental" | "Físico" | "Intelectual" | "Profissional" | "Alimentação" | "Descanso" | "Pessoal";

export interface RoutineActivity {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category: RoutineCategory;
  notes?: string;
  repeat: "daily" | "weekly" | "once";
  days?: WeekDay[];
  practiceId?: string; // when linked to a practice
}

export type PracticeId =
  | "oracao" | "afirmacao" | "gratidao" | "atividade"
  | "meditacao" | "leitura" | "visualizacao" | "diario"
  | "telas" | "cafeina" | "relaxamento" | "gratidao_noite"
  | "respiracao_sono" | "ambiente_sono";

export type PracticePeriod = "manha" | "noite";

export interface PracticeMeta {
  id: PracticeId;
  icon: string;
  label: string;
  color: string;
  period: PracticePeriod;
}