import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  DropletIcon,
  Fire02Icon,
  GlassWaterIcon,
  Medal01Icon,
  Target01Icon,
} from "@hugeicons/core-free-icons";

type IconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

// Estatísticas do device usadas para avaliar as conquistas (calculadas no
// servidor — ver badge-eval.ts). Puro/sem prisma para poder ser importado no
// cliente (a página de Conquistas renderiza o catálogo).
export interface BadgeStats {
  totalConclusoes: number; // nº de logs concluídos (todos os hábitos/dias)
  diaStreak: number; // dias seguidos ativos
  aguaDias: number; // dias com a meta de água batida
  habitosCriados: number; // hábitos criados (exclui a água default)
}

export interface BadgeDef {
  chave: string;
  nome: string;
  descricao: string;
  icon: IconType;
  desbloqueado: (s: BadgeStats) => boolean;
}

// Catálogo (ordem = ordem na página). Um único acento verde: sem tiers de cor.
export const BADGES: BadgeDef[] = [
  {
    chave: "primeiro-passo",
    nome: "Primeiro passo",
    descricao: "Concluíste o teu primeiro hábito.",
    icon: CheckmarkCircle02Icon,
    desbloqueado: (s) => s.totalConclusoes >= 1,
  },
  {
    chave: "construtor",
    nome: "Construtor",
    descricao: "Criaste o teu primeiro hábito.",
    icon: Target01Icon,
    desbloqueado: (s) => s.habitosCriados >= 1,
  },
  {
    chave: "hidratado",
    nome: "Hidratado",
    descricao: "Bateste a meta de água num dia.",
    icon: GlassWaterIcon,
    desbloqueado: (s) => s.aguaDias >= 1,
  },
  {
    chave: "streak-3",
    nome: "Em chama",
    descricao: "3 dias seguidos ativo.",
    icon: Fire02Icon,
    desbloqueado: (s) => s.diaStreak >= 3,
  },
  {
    chave: "streak-7",
    nome: "Uma semana!",
    descricao: "7 dias seguidos ativo.",
    icon: Fire02Icon,
    desbloqueado: (s) => s.diaStreak >= 7,
  },
  {
    chave: "agua-7",
    nome: "Bem hidratado",
    descricao: "7 dias a bater a meta de água.",
    icon: DropletIcon,
    desbloqueado: (s) => s.aguaDias >= 7,
  },
  {
    chave: "conclusoes-50",
    nome: "Consistente",
    descricao: "50 conclusões no total.",
    icon: Medal01Icon,
    desbloqueado: (s) => s.totalConclusoes >= 50,
  },
  {
    chave: "streak-30",
    nome: "Imparável",
    descricao: "30 dias seguidos ativo.",
    icon: Medal01Icon,
    desbloqueado: (s) => s.diaStreak >= 30,
  },
  {
    chave: "conclusoes-250",
    nome: "Veterano",
    descricao: "250 conclusões no total.",
    icon: Medal01Icon,
    desbloqueado: (s) => s.totalConclusoes >= 250,
  },
];

export function badgeByChave(chave: string): BadgeDef | undefined {
  return BADGES.find((b) => b.chave === chave);
}
