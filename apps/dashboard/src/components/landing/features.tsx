"use client";

import { LockClosedIcon } from "@radix-ui/react-icons";
import {
  Bell,
  Globe,
  Layers2,
  Layers3,
  Mic,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
const features = [
  {
    title: "Room Management",
    description:
      "Effortlessly manage multiple chat rooms across different servers, keeping your conversations organized and accessible.",
    icon: <Users className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Smart Notifications",
    description:
      "Receive intelligent notifications that keep you informed without overwhelming you.",
    icon: <Bell className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Enhanced Security",
    description:
      "Advanced security features to keep your chats safe and private.",
    icon: <Shield className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Quick Actions",
    description:
      "Perform common tasks with lightning speed using our intuitive quick actions.",
    icon: <Zap className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Dynamic Voice Channels",
    description:
      "Create private voice channels that automatically adjust to a user's needs.",
    icon: <Mic className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Customizable Permissions",
    description:
      "Set custom permissions for users and roles to control access to features and channels.",
    icon: <Layers2 className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Advanced Moderation Tools",
    description:
      "Keep your server safe and friendly with advanced moderation tools and features.",
    icon: <LockClosedIcon className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Customizable Interfaces",
    description:
      "Tailor the interface to your needs with our flexible customization options.",
    icon: <Layers3 className="h-12 w-12 mb-4 text-white" />,
  },
  {
    title: "Global Reach",
    description:
      "Connect with users worldwide, breaking down language barriers with built-in translation.",
    icon: <Globe className="h-12 w-12 mb-4 text-white" />,
  },
];

export function Features() {
  useEffect(() => {
    const cardsContainer = document.getElementById("cards") as HTMLElement;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(
        ".card"
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
  }, []);

  return (
    <section className="grid justify-center items-center h-fit">
      <div
        className="grid grid-rows-3 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:mx-36 lg:mx-24 md:mx-16 mx-8 2xl:mx-40"
        id="cards"
      >
        {features.map((feature) => (
          <Feature key={`feature-${feature.title}`} {...feature} />
        ))}
      </div>
    </section>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-content">
        {icon}
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}
