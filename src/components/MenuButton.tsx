"use client";

type Props = {
  onClick: () => void;
};

export function MenuButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-pink-400 hover:text-pink-400"
      aria-label="Open menu"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="transition-transform group-hover:scale-110"
      >
        <path
          d="M3.33333 5H16.6667M3.33333 10H16.6667M3.33333 15H16.6667"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
