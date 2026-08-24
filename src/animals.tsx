export const ANIMALS = [
  { id: "fox", name: "Renard", emoji: "🦊" },
  { id: "panda", name: "Panda", emoji: "🐼" },
  { id: "sloth", name: "Paresseux", emoji: "🦥" },
  { id: "chick", name: "Poussin", emoji: "🐥" },
  { id: "pig", name: "Cochon", emoji: "🐷" },
  { id: "bunny", name: "Lapin", emoji: "🐰" },
  { id: "cat", name: "Chat", emoji: "🐱" },
  { id: "otter", name: "Loutre", emoji: "🦦" },
] as const;

export type AnimalId = (typeof ANIMALS)[number]["id"];

export function animalForDate(isoDate: string) {
  const day = Number(isoDate.replaceAll("-", ""));
  return ANIMALS[Math.abs(day) % ANIMALS.length];
}

type Props = {
  animal: AnimalId;
  size?: number;
};

export function KawaiiAnimal({ animal, size = 88 }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 120 120" };

  if (animal === "fox") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#f8c8d8" opacity="0.5" />
        <path d="M28 52 L18 18 L48 38 Z" fill="#f4a574" />
        <path d="M92 52 L102 18 L72 38 Z" fill="#f4a574" />
        <path d="M28 52 L18 18 L48 38 Z" fill="#ffe6ef" transform="scale(0.45) translate(28 12)" />
        <ellipse cx="60" cy="68" rx="34" ry="32" fill="#f4a574" />
        <ellipse cx="60" cy="78" rx="18" ry="14" fill="#fff6ea" />
        <circle cx="48" cy="64" r="6" fill="#3d2c2c" />
        <circle cx="72" cy="64" r="6" fill="#3d2c2c" />
        <circle cx="50" cy="62" r="2" fill="#fff" />
        <circle cx="74" cy="62" r="2" fill="#fff" />
        <ellipse cx="60" cy="76" rx="5" ry="4" fill="#f08a9d" />
        <path d="M55 82 Q60 88 65 82" fill="none" stroke="#c96b7a" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 58 Q30 54 28 48" fill="none" stroke="#e08a6a" strokeWidth="2" />
        <path d="M82 58 Q90 54 92 48" fill="none" stroke="#e08a6a" strokeWidth="2" />
      </svg>
    );
  }

  if (animal === "panda") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#c5d4f0" opacity="0.6" />
        <circle cx="32" cy="38" r="14" fill="#2d2a32" />
        <circle cx="88" cy="38" r="14" fill="#2d2a32" />
        <ellipse cx="60" cy="66" rx="36" ry="34" fill="#f7f7fb" />
        <ellipse cx="46" cy="64" rx="12" ry="10" fill="#2d2a32" />
        <ellipse cx="74" cy="64" rx="12" ry="10" fill="#2d2a32" />
        <circle cx="48" cy="64" r="5" fill="#3d2c2c" />
        <circle cx="72" cy="64" r="5" fill="#3d2c2c" />
        <circle cx="50" cy="62" r="2" fill="#fff" />
        <circle cx="74" cy="62" r="2" fill="#fff" />
        <ellipse cx="60" cy="76" rx="6" ry="4" fill="#2d2a32" />
        <path d="M54 84 Q60 90 66 84" fill="none" stroke="#f08a9d" strokeWidth="2" />
      </svg>
    );
  }

  if (animal === "sloth") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#e8d5b5" opacity="0.6" />
        <ellipse cx="60" cy="66" rx="36" ry="34" fill="#d4b48a" />
        <ellipse cx="60" cy="72" rx="24" ry="22" fill="#f3e2c8" />
        <path d="M38 60 Q46 68 42 76" fill="none" stroke="#8d6a45" strokeWidth="4" />
        <path d="M82 60 Q74 68 78 76" fill="none" stroke="#8d6a45" strokeWidth="4" />
        <circle cx="48" cy="68" r="5" fill="#3d2c2c" />
        <circle cx="72" cy="68" r="5" fill="#3d2c2c" />
        <path d="M56 80 Q60 78 64 80" fill="none" stroke="#c96b7a" strokeWidth="2" />
        <circle cx="38" cy="40" r="8" fill="#d4b48a" />
        <circle cx="82" cy="40" r="8" fill="#d4b48a" />
      </svg>
    );
  }

  if (animal === "chick") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#ffe9a8" opacity="0.6" />
        <circle cx="60" cy="64" r="34" fill="#ffe36b" />
        <circle cx="78" cy="38" r="10" fill="#ffe36b" />
        <circle cx="48" cy="62" r="6" fill="#3d2c2c" />
        <circle cx="72" cy="62" r="6" fill="#3d2c2c" />
        <circle cx="50" cy="60" r="2" fill="#fff" />
        <circle cx="74" cy="60" r="2" fill="#fff" />
        <path d="M60 70 L72 76 L60 82 Z" fill="#ff9f43" />
        <ellipse cx="44" cy="78" rx="8" ry="5" fill="#ffb4c8" opacity="0.8" />
        <ellipse cx="76" cy="78" rx="8" ry="5" fill="#ffb4c8" opacity="0.8" />
      </svg>
    );
  }

  if (animal === "pig") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#ffd0dc" opacity="0.6" />
        <ellipse cx="28" cy="48" rx="10" ry="14" fill="#ffb6c8" />
        <ellipse cx="92" cy="48" rx="10" ry="14" fill="#ffb6c8" />
        <ellipse cx="60" cy="66" rx="36" ry="32" fill="#ffc2d1" />
        <ellipse cx="60" cy="80" rx="14" ry="10" fill="#ff9eb5" />
        <circle cx="54" cy="80" r="3" fill="#e57a94" />
        <circle cx="66" cy="80" r="3" fill="#e57a94" />
        <circle cx="48" cy="62" r="6" fill="#3d2c2c" />
        <circle cx="72" cy="62" r="6" fill="#3d2c2c" />
        <circle cx="50" cy="60" r="2" fill="#fff" />
        <circle cx="74" cy="60" r="2" fill="#fff" />
      </svg>
    );
  }

  if (animal === "bunny") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#e4d4ff" opacity="0.6" />
        <ellipse cx="42" cy="28" rx="10" ry="24" fill="#f3e8ff" />
        <ellipse cx="78" cy="28" rx="10" ry="24" fill="#f3e8ff" />
        <ellipse cx="42" cy="30" rx="5" ry="16" fill="#ffc2d4" />
        <ellipse cx="78" cy="30" rx="5" ry="16" fill="#ffc2d4" />
        <ellipse cx="60" cy="70" rx="34" ry="30" fill="#f8f1ff" />
        <circle cx="48" cy="68" r="6" fill="#3d2c2c" />
        <circle cx="72" cy="68" r="6" fill="#3d2c2c" />
        <ellipse cx="60" cy="80" rx="5" ry="4" fill="#ff9eb5" />
        <path d="M54 86 Q60 92 66 86" fill="none" stroke="#e57a94" strokeWidth="2" />
      </svg>
    );
  }

  if (animal === "cat") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="#ffd9c2" opacity="0.6" />
        <path d="M28 58 L34 22 L54 48 Z" fill="#ffc89a" />
        <path d="M92 58 L86 22 L66 48 Z" fill="#ffc89a" />
        <ellipse cx="60" cy="68" rx="34" ry="30" fill="#ffc89a" />
        <circle cx="48" cy="66" r="6" fill="#3d2c2c" />
        <circle cx="72" cy="66" r="6" fill="#3d2c2c" />
        <ellipse cx="60" cy="78" rx="6" ry="4" fill="#f08a9d" />
        <path d="M32 74 H46" stroke="#e08a6a" strokeWidth="2" />
        <path d="M74 74 H88" stroke="#e08a6a" strokeWidth="2" />
        <path d="M54 86 Q60 90 66 86" fill="none" stroke="#c96b7a" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#bfe8e2" opacity="0.6" />
      <ellipse cx="60" cy="70" rx="34" ry="28" fill="#9fd8d0" />
      <ellipse cx="28" cy="78" rx="10" ry="16" fill="#7ec4ba" />
      <ellipse cx="92" cy="78" rx="10" ry="16" fill="#7ec4ba" />
      <circle cx="48" cy="66" r="6" fill="#3d2c2c" />
      <circle cx="72" cy="66" r="6" fill="#3d2c2c" />
      <ellipse cx="60" cy="78" rx="8" ry="5" fill="#f08a9d" />
      <path d="M52 86 Q60 94 68 86" fill="none" stroke="#c96b7a" strokeWidth="2" />
    </svg>
  );
}
