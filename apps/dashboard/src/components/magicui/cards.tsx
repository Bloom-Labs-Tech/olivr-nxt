"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "~/lib/utils";

type MagicCardsProps = {
  children: ReactNode;
  parentId: string;
  className?: string;
  style?: React.CSSProperties;
};

export function MagicCards({ style, children, parentId }: MagicCardsProps) {
  useEffect(() => {
    const cardsContainer = document.querySelector(
      `#${parentId} > #cards`
    ) as HTMLElement;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(
        `#${parentId} > #cards > .card`
      ) as NodeListOf<HTMLElement>;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        const x = e.clientX - (rect.left ?? 0);
        const y = e.clientY - (rect.top ?? 0);

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };

    cardsContainer?.addEventListener("mousemove", handleMouseMove);

    return () => {
      cardsContainer?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [parentId]);

  return (
    <section
      className="grid justify-center items-center h-fit w-full"
      id={parentId}
    >
      <div id="cards" style={style}>
        {children}
      </div>
    </section>
  );
}

type MagicCardProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function MagicCard({ children, className, style }: MagicCardProps) {
  return (
    <div className={cn("card", className)} style={style}>
      <div className="card-content">{children}</div>
    </div>
  );
}
