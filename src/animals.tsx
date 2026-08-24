export type AnimalShape =
  | "fox"
  | "bear"
  | "bee"
  | "panda"
  | "sloth"
  | "chick"
  | "pig"
  | "bunny"
  | "cat"
  | "otter"
  | "round"
  | "pointy"
  | "long-ears"
  | "spikes"
  | "bird"
  | "aquatic"
  | "frog"
  | "insect"
  | "unicorn"
  | "dino";

export type AnimalColors = {
  primary: string;
  secondary: string;
  accent: string;
  shadow: string;
  detail?: string;
};

export type AnimalDef = {
  id: string;
  name: string;
  emoji: string;
  shape: AnimalShape;
  colors: AnimalColors;
};

/** Templates animaux kawaii : couleurs pastels liées à chaque bestiole. */
export const ANIMALS = [
  // ★ Demandés / signature
  {
    id: "bear",
    name: "Ourson",
    emoji: "🧸",
    shape: "bear",
    colors: {
      primary: "#e0b98a",
      secondary: "#f5e6d3",
      accent: "#c9966a",
      shadow: "#e8d4b8",
      detail: "#f08a9d",
    },
  },
  {
    id: "fox",
    name: "Renard",
    emoji: "🦊",
    shape: "fox",
    colors: {
      primary: "#f4a574",
      secondary: "#fff6ea",
      accent: "#e08a6a",
      shadow: "#f8c8d8",
      detail: "#f08a9d",
    },
  },
  {
    id: "bee",
    name: "Abeille",
    emoji: "🐝",
    shape: "bee",
    colors: {
      primary: "#fff0b8",
      secondary: "#ffe9a8",
      accent: "#3d2c2c",
      shadow: "#fff3c4",
      detail: "#f08a9d",
    },
  },

  // Existants enrichis
  {
    id: "panda",
    name: "Panda",
    emoji: "🐼",
    shape: "panda",
    colors: {
      primary: "#f7f7fb",
      secondary: "#2d2a32",
      accent: "#2d2a32",
      shadow: "#c5d4f0",
      detail: "#f08a9d",
    },
  },
  {
    id: "sloth",
    name: "Paresseux",
    emoji: "🦥",
    shape: "sloth",
    colors: {
      primary: "#d4b48a",
      secondary: "#f3e2c8",
      accent: "#8d6a45",
      shadow: "#e8d5b5",
      detail: "#c96b7a",
    },
  },
  {
    id: "chick",
    name: "Poussin",
    emoji: "🐥",
    shape: "chick",
    colors: {
      primary: "#ffe36b",
      secondary: "#ff9f43",
      accent: "#ffb4c8",
      shadow: "#ffe9a8",
      detail: "#ff9f43",
    },
  },
  {
    id: "pig",
    name: "Cochon",
    emoji: "🐷",
    shape: "pig",
    colors: {
      primary: "#ffc2d1",
      secondary: "#ff9eb5",
      accent: "#e57a94",
      shadow: "#ffd0dc",
      detail: "#ffb6c8",
    },
  },
  {
    id: "bunny",
    name: "Lapin",
    emoji: "🐰",
    shape: "bunny",
    colors: {
      primary: "#f8f1ff",
      secondary: "#ffc2d4",
      accent: "#e57a94",
      shadow: "#e4d4ff",
      detail: "#ff9eb5",
    },
  },
  {
    id: "cat",
    name: "Chat",
    emoji: "🐱",
    shape: "cat",
    colors: {
      primary: "#ffc89a",
      secondary: "#f08a9d",
      accent: "#e08a6a",
      shadow: "#ffd9c2",
      detail: "#c96b7a",
    },
  },
  {
    id: "otter",
    name: "Loutre",
    emoji: "🦦",
    shape: "otter",
    colors: {
      primary: "#9fd8d0",
      secondary: "#7ec4ba",
      accent: "#f08a9d",
      shadow: "#bfe8e2",
      detail: "#c96b7a",
    },
  },

  // Petite ménagerie pastel
  {
    id: "puppy",
    name: "Chiot",
    emoji: "🐶",
    shape: "pointy",
    colors: {
      primary: "#e8c4a0",
      secondary: "#fff0e0",
      accent: "#c9956e",
      shadow: "#f0d8c0",
      detail: "#f08a9d",
    },
  },
  {
    id: "hamster",
    name: "Hamster",
    emoji: "🐹",
    shape: "round",
    colors: {
      primary: "#f5d9b8",
      secondary: "#ffe8d0",
      accent: "#e0a878",
      shadow: "#f8e4cc",
      detail: "#f08a9d",
    },
  },
  {
    id: "hedgehog",
    name: "Hérisson",
    emoji: "🦔",
    shape: "spikes",
    colors: {
      primary: "#c4a882",
      secondary: "#f0e0d0",
      accent: "#8a7058",
      shadow: "#d8c8b0",
      detail: "#f08a9d",
    },
  },
  {
    id: "koala",
    name: "Koala",
    emoji: "🐨",
    shape: "bear",
    colors: {
      primary: "#c8c4cc",
      secondary: "#ebe8f0",
      accent: "#8a8690",
      shadow: "#d8d4dc",
      detail: "#f08a9d",
    },
  },
  {
    id: "duckling",
    name: "Caneton",
    emoji: "🦆",
    shape: "bird",
    colors: {
      primary: "#ffe8a0",
      secondary: "#ffb85a",
      accent: "#f0c070",
      shadow: "#fff0c8",
      detail: "#ffb4c8",
    },
  },
  {
    id: "lamb",
    name: "Agneau",
    emoji: "🐑",
    shape: "round",
    colors: {
      primary: "#faf6f0",
      secondary: "#ffe8f0",
      accent: "#d4c8b8",
      shadow: "#f0e8e0",
      detail: "#f08a9d",
    },
  },
  {
    id: "fawn",
    name: "Faon",
    emoji: "🦌",
    shape: "pointy",
    colors: {
      primary: "#e8c8a8",
      secondary: "#fff0e4",
      accent: "#c8a080",
      shadow: "#f0dcc8",
      detail: "#f08a9d",
    },
  },
  {
    id: "raccoon",
    name: "Raton",
    emoji: "🦝",
    shape: "pointy",
    colors: {
      primary: "#b8b0c0",
      secondary: "#e8e4f0",
      accent: "#5a5468",
      shadow: "#d0ccd8",
      detail: "#f08a9d",
    },
  },
  {
    id: "squirrel",
    name: "Écureuil",
    emoji: "🐿️",
    shape: "pointy",
    colors: {
      primary: "#e8a878",
      secondary: "#ffe8d4",
      accent: "#c88050",
      shadow: "#f0c8a8",
      detail: "#f08a9d",
    },
  },
  {
    id: "mouse",
    name: "Souris",
    emoji: "🐭",
    shape: "round",
    colors: {
      primary: "#e0dce8",
      secondary: "#f4f0f8",
      accent: "#b0a8b8",
      shadow: "#e8e4f0",
      detail: "#f08a9d",
    },
  },
  {
    id: "frog",
    name: "Grenouille",
    emoji: "🐸",
    shape: "frog",
    colors: {
      primary: "#a8e0b0",
      secondary: "#d8f5dc",
      accent: "#70b878",
      shadow: "#c8ecd0",
      detail: "#f08a9d",
    },
  },
  {
    id: "turtle",
    name: "Tortue",
    emoji: "🐢",
    shape: "round",
    colors: {
      primary: "#a8c8a0",
      secondary: "#d4e8cc",
      accent: "#789870",
      shadow: "#c0d8b8",
      detail: "#f08a9d",
    },
  },
  {
    id: "penguin",
    name: "Pingouin",
    emoji: "🐧",
    shape: "bird",
    colors: {
      primary: "#e8f0f8",
      secondary: "#3d3a48",
      accent: "#ffb070",
      shadow: "#c8d8ec",
      detail: "#f08a9d",
    },
  },
  {
    id: "seal",
    name: "Phoque",
    emoji: "🦭",
    shape: "aquatic",
    colors: {
      primary: "#c0ccd8",
      secondary: "#e4ecf4",
      accent: "#8898a8",
      shadow: "#d0dce8",
      detail: "#f08a9d",
    },
  },
  {
    id: "whale",
    name: "Baleine",
    emoji: "🐋",
    shape: "aquatic",
    colors: {
      primary: "#a8c8e8",
      secondary: "#d8e8f8",
      accent: "#7898c0",
      shadow: "#c0d8f0",
      detail: "#f08a9d",
    },
  },
  {
    id: "dolphin",
    name: "Dauphin",
    emoji: "🐬",
    shape: "aquatic",
    colors: {
      primary: "#90d0d8",
      secondary: "#c8ecef",
      accent: "#68b0b8",
      shadow: "#b0e0e4",
      detail: "#f08a9d",
    },
  },
  {
    id: "flamingo",
    name: "Flamant",
    emoji: "🦩",
    shape: "bird",
    colors: {
      primary: "#ffb8c8",
      secondary: "#ffe0e8",
      accent: "#f08098",
      shadow: "#ffd0dc",
      detail: "#ff9eb5",
    },
  },
  {
    id: "owl",
    name: "Hibou",
    emoji: "🦉",
    shape: "bird",
    colors: {
      primary: "#d0c0e0",
      secondary: "#ece4f4",
      accent: "#9880b0",
      shadow: "#ddd0ec",
      detail: "#f08a9d",
    },
  },
  {
    id: "parrot",
    name: "Perroquet",
    emoji: "🦜",
    shape: "bird",
    colors: {
      primary: "#b8e878",
      secondary: "#e0f8b8",
      accent: "#ff9090",
      shadow: "#d0f0a0",
      detail: "#ffb4c8",
    },
  },
  {
    id: "ladybug",
    name: "Coccinelle",
    emoji: "🐞",
    shape: "insect",
    colors: {
      primary: "#ff9a9a",
      secondary: "#ffe0e0",
      accent: "#3d2c2c",
      shadow: "#ffc8c8",
      detail: "#f08a9d",
    },
  },
  {
    id: "butterfly",
    name: "Papillon",
    emoji: "🦋",
    shape: "insect",
    colors: {
      primary: "#c8b0f0",
      secondary: "#ffe0f0",
      accent: "#a888e0",
      shadow: "#ddd0f8",
      detail: "#f08a9d",
    },
  },
  {
    id: "unicorn",
    name: "Licorne",
    emoji: "🦄",
    shape: "unicorn",
    colors: {
      primary: "#ffe0f0",
      secondary: "#fff0f8",
      accent: "#e8b0ff",
      shadow: "#f0d8ff",
      detail: "#f08a9d",
    },
  },
  {
    id: "dino",
    name: "Dino",
    emoji: "🦕",
    shape: "dino",
    colors: {
      primary: "#b0e0c0",
      secondary: "#d8f0e0",
      accent: "#78b890",
      shadow: "#c8ead4",
      detail: "#f08a9d",
    },
  },
  {
    id: "axolotl",
    name: "Axolotl",
    emoji: "🦎",
    shape: "aquatic",
    colors: {
      primary: "#ffc0d0",
      secondary: "#ffe8f0",
      accent: "#f090a8",
      shadow: "#ffd4e0",
      detail: "#f08a9d",
    },
  },
  {
    id: "capybara",
    name: "Capybara",
    emoji: "🦫",
    shape: "round",
    colors: {
      primary: "#c8a078",
      secondary: "#e8d0b0",
      accent: "#987858",
      shadow: "#d8c0a0",
      detail: "#f08a9d",
    },
  },
  {
    id: "redpanda",
    name: "Panda roux",
    emoji: "🦊",
    shape: "fox",
    colors: {
      primary: "#f0a080",
      secondary: "#fff0e8",
      accent: "#d87858",
      shadow: "#f8c8b0",
      detail: "#f08a9d",
    },
  },
  {
    id: "giraffe",
    name: "Girafe",
    emoji: "🦒",
    shape: "pointy",
    colors: {
      primary: "#f0d090",
      secondary: "#fff4d8",
      accent: "#d0a860",
      shadow: "#f8e4b0",
      detail: "#f08a9d",
    },
  },
  {
    id: "elephant",
    name: "Éléphant",
    emoji: "🐘",
    shape: "round",
    colors: {
      primary: "#c0b8d0",
      secondary: "#e4e0f0",
      accent: "#9088a8",
      shadow: "#d4d0e0",
      detail: "#f08a9d",
    },
  },
  {
    id: "hippo",
    name: "Hippo",
    emoji: "🦛",
    shape: "round",
    colors: {
      primary: "#c8b0d0",
      secondary: "#e8dcf0",
      accent: "#a088b0",
      shadow: "#d8c8e0",
      detail: "#f08a9d",
    },
  },
  {
    id: "octopus",
    name: "Pieuvre",
    emoji: "🐙",
    shape: "aquatic",
    colors: {
      primary: "#d0b0e8",
      secondary: "#ece0f8",
      accent: "#b088d0",
      shadow: "#ddd0f0",
      detail: "#f08a9d",
    },
  },
  {
    id: "jellyfish",
    name: "Méduse",
    emoji: "🪼",
    shape: "aquatic",
    colors: {
      primary: "#f0c0e0",
      secondary: "#fce8f4",
      accent: "#e090c8",
      shadow: "#f4d4ec",
      detail: "#f08a9d",
    },
  },
  {
    id: "starfish",
    name: "Étoile de mer",
    emoji: "⭐",
    shape: "round",
    colors: {
      primary: "#ffc8a0",
      secondary: "#ffe8d4",
      accent: "#f0a070",
      shadow: "#ffd8bc",
      detail: "#f08a9d",
    },
  },
  {
    id: "crab",
    name: "Crabe",
    emoji: "🦀",
    shape: "insect",
    colors: {
      primary: "#ffb090",
      secondary: "#ffe0d0",
      accent: "#e88060",
      shadow: "#ffc8b0",
      detail: "#f08a9d",
    },
  },
  {
    id: "snail",
    name: "Escargot",
    emoji: "🐌",
    shape: "round",
    colors: {
      primary: "#c8e090",
      secondary: "#e8f4c0",
      accent: "#d0b070",
      shadow: "#d8ecc8",
      detail: "#f08a9d",
    },
  },
  {
    id: "dragonfly",
    name: "Libellule",
    emoji: "🪰",
    shape: "insect",
    colors: {
      primary: "#90e0d8",
      secondary: "#d0f4f0",
      accent: "#68c0b8",
      shadow: "#b8ece8",
      detail: "#f08a9d",
    },
  },
  {
    id: "sheep",
    name: "Mouton",
    emoji: "🐏",
    shape: "round",
    colors: {
      primary: "#f8f4ec",
      secondary: "#fff8f0",
      accent: "#d8c8a8",
      shadow: "#f0e8dc",
      detail: "#f08a9d",
    },
  },
  {
    id: "goat",
    name: "Chevreau",
    emoji: "🐐",
    shape: "pointy",
    colors: {
      primary: "#e0d0b8",
      secondary: "#f4ece0",
      accent: "#b8a088",
      shadow: "#e8dcc8",
      detail: "#f08a9d",
    },
  },
  {
    id: "calf",
    name: "Veau",
    emoji: "🐮",
    shape: "pointy",
    colors: {
      primary: "#e8d4b8",
      secondary: "#fff4e8",
      accent: "#3d2c2c",
      shadow: "#f0e0c8",
      detail: "#f08a9d",
    },
  },
  {
    id: "chickadee",
    name: "Mésange",
    emoji: "🐦",
    shape: "bird",
    colors: {
      primary: "#c8e0f0",
      secondary: "#ffe8a0",
      accent: "#3d2c2c",
      shadow: "#d8e8f4",
      detail: "#f08a9d",
    },
  },
  {
    id: "bunnybrown",
    name: "Lapinou",
    emoji: "🐇",
    shape: "long-ears",
    colors: {
      primary: "#e8c8a8",
      secondary: "#ffe0d0",
      accent: "#d0a888",
      shadow: "#f0d8c0",
      detail: "#f08a9d",
    },
  },
] as const satisfies readonly AnimalDef[];

export type AnimalId = (typeof ANIMALS)[number]["id"];

const BY_ID = Object.fromEntries(ANIMALS.map((a) => [a.id, a])) as Record<
  AnimalId,
  (typeof ANIMALS)[number]
>;

export function animalForDate(isoDate: string) {
  const day = Number(isoDate.replaceAll("-", ""));
  return ANIMALS[Math.abs(day) % ANIMALS.length];
}

export function getAnimal(id: string | null | undefined) {
  if (id && id in BY_ID) return BY_ID[id as AnimalId];
  return BY_ID.bear;
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function softAccent(hex: string, fallback: string): string {
  return luminance(hex) < 0.35 ? fallback : hex;
}

export type ThemeVars = Record<`--${string}`, string>;

/** CSS custom properties derived from a totem animal palette. */
export function themeFromAnimal(animal: (typeof ANIMALS)[number]): ThemeVars {
  const { primary, secondary, accent, shadow, detail = "#f08a9d" } = animal.colors;
  const soft = softAccent(accent, detail);
  const cream = mixHex(secondary, "#ffffff", 0.45);
  const blush = mixHex(primary, "#ffffff", 0.15);
  const lilac = mixHex(shadow, secondary, 0.35);
  const mint = mixHex(secondary, "#d4f5e9", 0.4);
  const peach = mixHex(primary, "#fff6f0", 0.35);
  const btnFrom = mixHex(primary, "#ffffff", 0.08);
  const btnTo = mixHex(soft, detail, 0.35);
  const [pr, pg, pb] = hexToRgb(primary);

  return {
    "--cream": cream,
    "--blush": blush,
    "--lilac": lilac,
    "--mint": mint,
    "--peach": peach,
    "--ink": "#4a3b45",
    "--muted": "#8a7380",
    "--card": "rgba(255, 255, 255, 0.78)",
    "--shadow": `0 18px 40px rgba(${pr}, ${pg}, ${pb}, 0.22)`,
    "--btn-from": btnFrom,
    "--btn-to": btnTo,
    "--btn-text": luminance(btnFrom) > 0.72 ? "#5a3148" : "#fff8f4",
    "--ring": mixHex(primary, soft, 0.25),
    "--ring-strong": soft,
    "--selected-from": mixHex(primary, "#ffffff", 0.35),
    "--selected-to": mixHex(shadow, "#ffffff", 0.25),
    "--today-ring": mixHex(soft, "#9ad9c6", 0.45),
    "--mascot-from": mixHex(primary, "#ffffff", 0.4),
    "--mascot-to": mixHex(shadow, "#ffffff", 0.35),
    "--chip-bg": mixHex(secondary, "#ffffff", 0.2),
    "--glass-tint": mixHex(primary, "#dff6ff", 0.55),
    "--glass-edge": mixHex(soft, "#9ad4ea", 0.4),
  };
}

type Props = {
  animal: AnimalId;
  size?: number;
};

function Face({
  eyeY = 64,
  blush = true,
  smile = true,
  nose,
  smileColor = "#c96b7a",
}: {
  eyeY?: number;
  blush?: boolean;
  smile?: boolean;
  nose?: string;
  smileColor?: string;
}) {
  return (
    <>
      <circle cx="48" cy={eyeY} r="6" fill="#3d2c2c" />
      <circle cx="72" cy={eyeY} r="6" fill="#3d2c2c" />
      <circle cx="50" cy={eyeY - 2} r="2" fill="#fff" />
      <circle cx="74" cy={eyeY - 2} r="2" fill="#fff" />
      {nose ? <ellipse cx="60" cy={eyeY + 12} rx="5" ry="4" fill={nose} /> : null}
      {blush ? (
        <>
          <ellipse cx="38" cy={eyeY + 14} rx="7" ry="4" fill="#ffb4c8" opacity="0.55" />
          <ellipse cx="82" cy={eyeY + 14} rx="7" ry="4" fill="#ffb4c8" opacity="0.55" />
        </>
      ) : null}
      {smile ? (
        <path
          d={`M54 ${eyeY + 22} Q60 ${eyeY + 28} 66 ${eyeY + 22}`}
          fill="none"
          stroke={smileColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
    </>
  );
}

function Shadow({ fill }: { fill: string }) {
  return <ellipse cx="60" cy="108" rx="28" ry="6" fill={fill} opacity="0.55" />;
}

export function KawaiiAnimal({ animal, size = 88 }: Props) {
  const def = BY_ID[animal] ?? BY_ID.otter;
  const c = def.colors;
  const common = { width: size, height: size, viewBox: "0 0 120 120" };
  const shape = def.shape;

  if (shape === "fox") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M28 52 L18 18 L48 38 Z" fill={c.primary} />
        <path d="M92 52 L102 18 L72 38 Z" fill={c.primary} />
        <path d="M28 52 L18 18 L48 38 Z" fill="#ffe6ef" transform="scale(0.45) translate(28 12)" />
        <ellipse cx="60" cy="68" rx="34" ry="32" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="18" ry="14" fill={c.secondary} />
        <Face eyeY={64} nose={c.detail ?? "#f08a9d"} smileColor="#c96b7a" />
        <path d="M38 58 Q30 54 28 48" fill="none" stroke={c.accent} strokeWidth="2" />
        <path d="M82 58 Q90 54 92 48" fill="none" stroke={c.accent} strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "bear") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <circle cx="32" cy="40" r="14" fill={c.primary} />
        <circle cx="88" cy="40" r="14" fill={c.primary} />
        <circle cx="32" cy="40" r="7" fill={c.secondary} />
        <circle cx="88" cy="40" r="7" fill={c.secondary} />
        <ellipse cx="60" cy="68" rx="36" ry="34" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="16" ry="12" fill={c.secondary} />
        <Face eyeY={64} nose={c.detail ?? "#f08a9d"} />
      </svg>
    );
  }

  if (shape === "bee") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="28" cy="58" rx="16" ry="22" fill="#e8f4ff" opacity="0.85" />
        <ellipse cx="92" cy="58" rx="16" ry="22" fill="#e8f4ff" opacity="0.85" />
        <ellipse cx="60" cy="66" rx="30" ry="28" fill={c.primary} />
        <rect x="30" y="54" width="60" height="8" rx="3" fill={c.accent} opacity="0.85" />
        <rect x="30" y="70" width="60" height="8" rx="3" fill={c.accent} opacity="0.85" />
        <circle cx="48" cy="32" r="3" fill={c.accent} />
        <circle cx="72" cy="32" r="3" fill={c.accent} />
        <path d="M48 32 Q44 18 40 14" fill="none" stroke={c.accent} strokeWidth="2" />
        <path d="M72 32 Q76 18 80 14" fill="none" stroke={c.accent} strokeWidth="2" />
        <Face eyeY={60} nose={c.detail} blush smileColor="#c96b7a" />
      </svg>
    );
  }

  if (shape === "panda") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <circle cx="32" cy="38" r="14" fill={c.secondary} />
        <circle cx="88" cy="38" r="14" fill={c.secondary} />
        <ellipse cx="60" cy="66" rx="36" ry="34" fill={c.primary} />
        <ellipse cx="46" cy="64" rx="12" ry="10" fill={c.secondary} />
        <ellipse cx="74" cy="64" rx="12" ry="10" fill={c.secondary} />
        <circle cx="48" cy="64" r="5" fill="#3d2c2c" />
        <circle cx="72" cy="64" r="5" fill="#3d2c2c" />
        <circle cx="50" cy="62" r="2" fill="#fff" />
        <circle cx="74" cy="62" r="2" fill="#fff" />
        <ellipse cx="60" cy="76" rx="6" ry="4" fill={c.accent} />
        <path d="M54 84 Q60 90 66 84" fill="none" stroke={c.detail ?? "#f08a9d"} strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "sloth") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="60" cy="66" rx="36" ry="34" fill={c.primary} />
        <ellipse cx="60" cy="72" rx="24" ry="22" fill={c.secondary} />
        <path d="M38 60 Q46 68 42 76" fill="none" stroke={c.accent} strokeWidth="4" />
        <path d="M82 60 Q74 68 78 76" fill="none" stroke={c.accent} strokeWidth="4" />
        <circle cx="48" cy="68" r="5" fill="#3d2c2c" />
        <circle cx="72" cy="68" r="5" fill="#3d2c2c" />
        <path d="M56 80 Q60 78 64 80" fill="none" stroke={c.detail ?? "#c96b7a"} strokeWidth="2" />
        <circle cx="38" cy="40" r="8" fill={c.primary} />
        <circle cx="82" cy="40" r="8" fill={c.primary} />
      </svg>
    );
  }

  if (shape === "chick") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <circle cx="60" cy="64" r="34" fill={c.primary} />
        <circle cx="78" cy="38" r="10" fill={c.primary} />
        <Face eyeY={62} blush={false} smile={false} />
        <path d="M60 70 L72 76 L60 82 Z" fill={c.secondary} />
        <ellipse cx="44" cy="78" rx="8" ry="5" fill={c.accent} opacity="0.8" />
        <ellipse cx="76" cy="78" rx="8" ry="5" fill={c.accent} opacity="0.8" />
      </svg>
    );
  }

  if (shape === "pig") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="28" cy="48" rx="10" ry="14" fill={c.detail ?? c.secondary} />
        <ellipse cx="92" cy="48" rx="10" ry="14" fill={c.detail ?? c.secondary} />
        <ellipse cx="60" cy="66" rx="36" ry="32" fill={c.primary} />
        <ellipse cx="60" cy="80" rx="14" ry="10" fill={c.secondary} />
        <circle cx="54" cy="80" r="3" fill={c.accent} />
        <circle cx="66" cy="80" r="3" fill={c.accent} />
        <Face eyeY={62} blush={false} smile={false} />
      </svg>
    );
  }

  if (shape === "bunny" || shape === "long-ears") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="42" cy="28" rx="10" ry="24" fill={c.primary} />
        <ellipse cx="78" cy="28" rx="10" ry="24" fill={c.primary} />
        <ellipse cx="42" cy="30" rx="5" ry="16" fill={c.secondary} />
        <ellipse cx="78" cy="30" rx="5" ry="16" fill={c.secondary} />
        <ellipse cx="60" cy="70" rx="34" ry="30" fill={c.primary} />
        <Face eyeY={68} nose={c.detail ?? "#ff9eb5"} smileColor={c.accent} />
      </svg>
    );
  }

  if (shape === "cat") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M28 58 L34 22 L54 48 Z" fill={c.primary} />
        <path d="M92 58 L86 22 L66 48 Z" fill={c.primary} />
        <ellipse cx="60" cy="68" rx="34" ry="30" fill={c.primary} />
        <Face eyeY={66} nose={c.secondary} smileColor={c.detail ?? "#c96b7a"} />
        <path d="M32 74 H46" stroke={c.accent} strokeWidth="2" />
        <path d="M74 74 H88" stroke={c.accent} strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "otter") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="60" cy="70" rx="34" ry="28" fill={c.primary} />
        <ellipse cx="28" cy="78" rx="10" ry="16" fill={c.secondary} />
        <ellipse cx="92" cy="78" rx="10" ry="16" fill={c.secondary} />
        <Face eyeY={66} nose={c.accent} smileColor={c.detail ?? "#c96b7a"} />
      </svg>
    );
  }

  if (shape === "spikes") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M40 48 L34 22 L50 42 Z" fill={c.accent} />
        <path d="M52 42 L50 16 L66 40 Z" fill={c.accent} />
        <path d="M68 42 L74 18 L82 44 Z" fill={c.accent} />
        <path d="M80 48 L92 26 L90 52 Z" fill={c.accent} />
        <ellipse cx="60" cy="70" rx="34" ry="30" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="18" ry="14" fill={c.secondary} />
        <Face eyeY={66} nose={c.detail} />
      </svg>
    );
  }

  if (shape === "bird") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="30" cy="72" rx="12" ry="8" fill={c.primary} opacity="0.85" />
        <ellipse cx="90" cy="72" rx="12" ry="8" fill={c.primary} opacity="0.85" />
        <ellipse cx="60" cy="66" rx="32" ry="30" fill={c.primary} />
        <circle cx="72" cy="40" r="8" fill={c.primary} />
        <path d="M60 72 L74 78 L60 84 Z" fill={c.secondary} />
        <Face eyeY={62} blush smile={false} />
      </svg>
    );
  }

  if (shape === "aquatic") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="96" cy="70" rx="12" ry="16" fill={c.secondary} />
        <ellipse cx="60" cy="68" rx="34" ry="28" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="16" ry="10" fill={c.secondary} />
        <Face eyeY={64} nose={c.detail} />
      </svg>
    );
  }

  if (shape === "frog") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <circle cx="40" cy="42" r="12" fill={c.primary} />
        <circle cx="80" cy="42" r="12" fill={c.primary} />
        <circle cx="40" cy="42" r="5" fill="#3d2c2c" />
        <circle cx="80" cy="42" r="5" fill="#3d2c2c" />
        <circle cx="42" cy="40" r="2" fill="#fff" />
        <circle cx="82" cy="40" r="2" fill="#fff" />
        <ellipse cx="60" cy="72" rx="36" ry="28" fill={c.primary} />
        <ellipse cx="60" cy="80" rx="18" ry="12" fill={c.secondary} />
        <path d="M52 88 Q60 94 68 88" fill="none" stroke={c.detail ?? "#c96b7a"} strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "insect") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <ellipse cx="24" cy="60" rx="18" ry="24" fill={c.secondary} opacity="0.9" />
        <ellipse cx="96" cy="60" rx="18" ry="24" fill={c.secondary} opacity="0.9" />
        <ellipse cx="60" cy="68" rx="28" ry="26" fill={c.primary} />
        <circle cx="48" cy="28" r="2.5" fill={c.accent} />
        <circle cx="72" cy="28" r="2.5" fill={c.accent} />
        <path d="M48 28 Q42 16 38 12" fill="none" stroke={c.accent} strokeWidth="2" />
        <path d="M72 28 Q78 16 82 12" fill="none" stroke={c.accent} strokeWidth="2" />
        <Face eyeY={62} nose={c.detail} />
      </svg>
    );
  }

  if (shape === "unicorn") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M56 48 L60 12 L64 48 Z" fill={c.accent} />
        <path d="M28 58 L34 22 L54 48 Z" fill={c.primary} />
        <path d="M92 58 L86 22 L66 48 Z" fill={c.primary} />
        <ellipse cx="60" cy="70" rx="34" ry="30" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="14" ry="10" fill={c.secondary} />
        <Face eyeY={66} nose={c.detail} />
      </svg>
    );
  }

  if (shape === "dino") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M48 40 L54 18 L62 40 Z" fill={c.accent} />
        <path d="M62 38 L70 16 L76 42 Z" fill={c.accent} />
        <ellipse cx="60" cy="70" rx="34" ry="30" fill={c.primary} />
        <ellipse cx="96" cy="78" rx="10" ry="14" fill={c.secondary} />
        <Face eyeY={64} nose={c.detail} />
      </svg>
    );
  }

  if (shape === "pointy") {
    return (
      <svg {...common} aria-hidden="true">
        <Shadow fill={c.shadow} />
        <path d="M30 56 L36 24 L54 48 Z" fill={c.primary} />
        <path d="M90 56 L84 24 L66 48 Z" fill={c.primary} />
        <ellipse cx="60" cy="68" rx="34" ry="30" fill={c.primary} />
        <ellipse cx="60" cy="78" rx="16" ry="12" fill={c.secondary} />
        <Face eyeY={64} nose={c.detail} />
      </svg>
    );
  }

  // round (default)
  return (
    <svg {...common} aria-hidden="true">
      <Shadow fill={c.shadow} />
      <circle cx="34" cy="42" r="12" fill={c.primary} />
      <circle cx="86" cy="42" r="12" fill={c.primary} />
      <ellipse cx="60" cy="68" rx="36" ry="32" fill={c.primary} />
      <ellipse cx="60" cy="78" rx="16" ry="12" fill={c.secondary} />
      <Face eyeY={64} nose={c.detail} />
    </svg>
  );
}
