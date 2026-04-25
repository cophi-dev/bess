const pipelineSteps = [
  {
    label: "Bestand",
    value: "2.6 GW / 3.9 GWh",
    note: "Heute sichtbar im Markt",
    emphasis: "solid",
  },
  {
    label: "Gesichertere Pipeline",
    value: ">=5 GW",
    note: "Gemeldete Projekte bis 2030",
    emphasis: "planned",
  },
  {
    label: "Anschlussdruck",
    value: "80 GW+",
    note: "Zusagen und Netzpriorisierung",
    emphasis: "pressure",
  },
];

const stackLayers = [
  { label: "FCR", share: "28%", detail: "Leistung reserviert" },
  { label: "aFRR", share: "24%", detail: "Aktivierung moeglich" },
  { label: "Arbitrage", share: "32%", detail: "Preisfenster nutzen" },
  { label: "Engpass", share: "16%", detail: "Netzsignal beachten" },
];

type MatrixCell = {
  title: string;
  label: string;
  text: string;
  tone: string;
};

type GridUsefulnessMatrixProps = {
  kicker?: string;
  title?: string;
  description?: string;
  source?: string;
  verticalAxisLabel?: string;
  horizontalAxisLabel?: string;
  cells?: MatrixCell[];
};

const matrixCells: MatrixCell[] = [
  {
    title: "Markt stark, Netz passend",
    label: "Priorisieren",
    text: "Preislogik und Standortwirkung zeigen in dieselbe Richtung.",
    tone: "bg-primary text-white",
  },
  {
    title: "Markt stark, Netz kritisch",
    label: "Pruefen",
    text: "Guter Spread kann Redispatch oder Engpaesse verstaerken.",
    tone: "bg-accent/25 text-primary",
  },
  {
    title: "Markt schwach, Netz passend",
    label: "Optionalitaet",
    text: "Systemnutzen kann ueber Anschluss, Produkt oder Vertrag entstehen.",
    tone: "bg-highlight/25 text-primary",
  },
  {
    title: "Markt schwach, Netz kritisch",
    label: "Zurueckstellen",
    text: "Weder Ertragssignal noch Standortlogik tragen den Case.",
    tone: "bg-background-alt text-text-secondary",
  },
];

function SourceNote({ children }: { children: string }) {
  return (
    <p className="mt-4 text-xs leading-relaxed text-text-secondary">
      Eigene Darstellung nach {children}.
    </p>
  );
}

export function PipelineRealityVisual() {
  return (
    <figure className="rounded-card border border-primary/10 bg-surface p-6 shadow-card md:p-8">
      <figcaption>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Marktbild
        </p>
        <h3 className="mt-2 text-3xl">Grossbatterien wachsen - aber nicht jede Anfrage wird gebaut</h3>
        <p className="mt-3 max-w-3xl text-text-secondary">
          Deutschland sieht bereits relevante Speicherleistung, eine wachsende
          Projektpipeline und hohen Anschlussdruck. Fuer die Bewertung zaehlt
          deshalb nicht nur die groesste Zahl, sondern der Reifegrad dahinter.
        </p>
      </figcaption>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {pipelineSteps.map((step, index) => (
          <div key={step.label} className="relative rounded-card bg-background-alt p-5">
            {index > 0 && (
              <span
                aria-hidden="true"
                className="absolute -left-3 top-1/2 hidden h-px w-3 bg-primary/25 md:block"
              />
            )}
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
              {step.label}
            </p>
            <p
              className={`mt-2 text-2xl ${
                step.emphasis === "solid"
                  ? "text-primary"
                  : step.emphasis === "caveat"
                    ? "text-error"
                    : "text-text"
              }`}
            >
              {step.value}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-text-secondary">
        Caveat: sehr hohe Anfragevolumina koennen Mehrfachanfragen, fruehe
        Projektideen und noch unsichere Realisierung enthalten. BESS Kompass
        behandelt sie daher als Signal fuer Anschluss- und Steuerungsbedarf,
        nicht als Ausbauprognose.
      </p>
    </figure>
  );
}

export function RevenueStackVisual() {
  return (
    <figure className="rounded-card border border-accent/25 bg-background-alt p-6 md:p-7">
      <figcaption>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Visual: Revenue Stacking
        </p>
        <h3 className="mt-2 text-2xl">Ein Speicher, mehrere Nutzungsansprueche</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Der Stack ist keine Addition ohne Grenzen. Jede Reservierung reduziert
          die freie Leistung fuer andere Produkte.
        </p>
      </figcaption>

      <div className="mt-6 overflow-hidden rounded-card border border-primary/10 bg-surface">
        <div className="flex h-14 w-full">
          {stackLayers.map((layer) => (
            <div
              key={layer.label}
              className="flex items-center justify-center border-r border-white/70 bg-primary text-xs font-semibold text-white last:border-r-0"
              style={{ width: layer.share }}
            >
              {layer.label}
            </div>
          ))}
        </div>
        <div className="grid gap-px bg-primary/10 md:grid-cols-4">
          {stackLayers.map((layer) => (
            <div key={layer.label} className="bg-surface p-4">
              <p className="text-lg text-primary">{layer.label}</p>
              <p className="mt-1 text-sm text-text-secondary">{layer.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 rounded-card bg-surface p-4 text-sm text-text-secondary">
        Lesart: Der Balken ist keine Prognose, sondern eine Merkhilfe. Die
        reale Aufteilung haengt von Praequalifikation, Vertrag, Marktpreisen,
        SoC-Strategie und Netzrestriktionen ab.
      </p>
      <SourceNote>NREL Grid-Scale Battery Storage FAQ und TenneT / Frontier Kurzpapier; Stand April 2026</SourceNote>
    </figure>
  );
}

export function GridUsefulnessMatrix({
  kicker = "Visual: Marktwert vs. Netzwirkung",
  title = "Netzdienlichkeit ist eine Lagefrage",
  description = "Ein hoher Spread reicht nicht. Entscheidend ist, ob der Fahrplan zur lokalen Netzsituation passt.",
  source = "TenneT Quo Vadis 3 sowie TenneT / Frontier Systemkostenperspektive; Stand April 2026",
  verticalAxisLabel = "Netzwirkung",
  horizontalAxisLabel = "Marktattraktivitaet",
  cells = matrixCells,
}: GridUsefulnessMatrixProps = {}) {
  return (
    <figure className="rounded-card border border-primary/10 bg-surface p-6 shadow-card md:p-7">
      <figcaption>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {kicker}
        </p>
        <h3 className="mt-2 text-2xl">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      </figcaption>

      <div className="mt-6 grid gap-3 md:grid-cols-[auto_1fr] md:items-stretch">
        <div className="hidden items-center justify-center md:flex">
          <p className="-rotate-90 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
            {verticalAxisLabel}
          </p>
        </div>
        <div>
          <div className="grid gap-3 md:grid-cols-2">
            {cells.map((cell) => (
              <div key={cell.title} className={`rounded-card p-5 ${cell.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
                  {cell.label}
                </p>
                <h4 className="mt-2 text-xl">{cell.title}</h4>
                <p className="mt-2 text-sm leading-relaxed opacity-85">{cell.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
            {horizontalAxisLabel}
          </p>
        </div>
      </div>

      <SourceNote>{source}</SourceNote>
    </figure>
  );
}
