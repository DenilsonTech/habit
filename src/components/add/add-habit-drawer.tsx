"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  PencilEdit01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { EscolherStep } from "@/components/add/escolher-step";
import { DetalhesStep } from "@/components/add/detalhes-step";
import { HorarioStep } from "@/components/add/horario-step";
import { getStoredDeviceId } from "@/lib/device";
import { useCreateHabit } from "@/lib/queries";
import { Loader } from "@/components/loader";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

// `trigger` opcional: quando fornecido, substitui o botão ＋ default (ex.: o
// empty state da home usa um botão "Criar hábito" para abrir o mesmo fluxo).
export function AddHabitDrawer({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Formulário (mock — sem persistência até ajustarmos o modelo de dados).
  const [category, setCategory] = useState("saude");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icon, setIcon] = useState("");
  const [tamanho, setTamanho] = useState("L");
  const [tipo, setTipo] = useState("simples");
  const [etapas, setEtapas] = useState(2);
  const [minutos, setMinutos] = useState(10);
  const [dias, setDias] = useState<string[]>([
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
  ]);
  const [lembrete, setLembrete] = useState(true);
  const [horarios, setHorarios] = useState<string[]>(["13:00"]);

  const [deviceId, setDeviceId] = useState("");
  useEffect(() => setDeviceId(getStoredDeviceId() ?? ""), []);
  const createHabit = useCreateHabit(deviceId);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function reset() {
    setStep(0);
    setDirection(1);
    setCategory("saude");
    setNome("");
    setDescricao("");
    setIcon("");
    setTamanho("L");
    setTipo("simples");
    setEtapas(2);
    setMinutos(10);
    setDias(["seg", "ter", "qua", "qui", "sex"]);
    setLembrete(true);
    setHorarios(["13:00"]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) window.setTimeout(reset, 250);
  }

  function escolherSugestao(nomeSugestao: string) {
    setNome(nomeSugestao);
    goTo(1);
  }

  // "Criar personalizada" = a mesma tela de detalhes, mas com tudo vazio.
  function criarPersonalizada() {
    setNome("");
    setDescricao("");
    setIcon("");
    setTamanho("L");
    setTipo("simples");
    setEtapas(2);
    setMinutos(10);
    goTo(1);
  }

  function criar() {
    createHabit.mutate(
      { nome: nome.trim(), descricao, icon, tipo, dias, lembrete, horarios },
      { onSuccess: () => setOpen(false) },
    );
  }

  const title = step === 2 ? "Definir horário" : "Novo hábito";

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="Adicionar"
            className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={26} strokeWidth={2} />
          </button>
        )}
      </DrawerTrigger>

      <DrawerContent className="h-[92dvh] max-h-[92dvh]! bg-background">
        <DrawerDescription className="sr-only">
          Criar um novo hábito
        </DrawerDescription>

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative flex items-center justify-center px-5 pt-3 pb-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label="Voltar"
                className="absolute left-5 flex size-8 items-center justify-center rounded-full bg-secondary text-foreground"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
              </button>
            )}
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerClose
              aria-label="Fechar"
              className="absolute right-5 flex size-8 items-center justify-center rounded-full bg-secondary text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
            </DrawerClose>
          </div>

          {/* Passos (scrolláveis) + ação primária flutuante */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto px-5 pt-1 pb-28"
              >
                {step === 0 && (
                  <EscolherStep
                    category={category}
                    onCategory={setCategory}
                    onEscolher={escolherSugestao}
                  />
                )}
                {step === 1 && (
                  <DetalhesStep
                    nome={nome}
                    onNome={setNome}
                    descricao={descricao}
                    onDescricao={setDescricao}
                    icon={icon}
                    onIcon={setIcon}
                    tamanho={tamanho}
                    onTamanho={setTamanho}
                    tipo={tipo}
                    onTipo={setTipo}
                    etapas={etapas}
                    onEtapas={setEtapas}
                    minutos={minutos}
                    onMinutos={setMinutos}
                  />
                )}
                {step === 2 && (
                  <HorarioStep
                    dias={dias}
                    onDias={setDias}
                    lembrete={lembrete}
                    onLembrete={setLembrete}
                    horarios={horarios}
                    onHorarios={setHorarios}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Ação primária flutuante */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-5">
              {step === 0 && (
                <Button
                  onClick={criarPersonalizada}
                  className="pointer-events-auto h-14 gap-2 rounded-full px-8 text-base font-semibold shadow-lg"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={2} />
                  Criar personalizada
                </Button>
              )}
              {step === 1 && (
                <Button
                  onClick={() => goTo(2)}
                  disabled={!nome.trim()}
                  className="pointer-events-auto h-14 rounded-full px-12 text-base font-semibold shadow-lg"
                >
                  Continuar
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={criar}
                  disabled={createHabit.isPending}
                  className="pointer-events-auto h-14 rounded-full px-12 text-base font-semibold shadow-lg"
                >
                  {createHabit.isPending ? <Loader size={30} /> : "Criar hábito"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
