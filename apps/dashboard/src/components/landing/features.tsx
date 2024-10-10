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
import { MagicCard, MagicCards } from "../magicui/cards";
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
  return (
    <MagicCards parentId="features">
      {features.map((feature, idx) => (
        <Feature
          key={`feature-${feature.title}`}
          {...feature}
          isLastElement={idx === features.length - 1}
        />
      ))}
    </MagicCards>
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
  isLastElement: boolean;
}) {
  return (
    <MagicCard>
      <div className="flex flex-col w-full h-full">
        {icon}
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </MagicCard>
  );
}
