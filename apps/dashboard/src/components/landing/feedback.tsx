"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Feedback, useFeedback } from "~/hooks/useFeedback";
import { cn } from "~/lib/utils";
import Marquee from "../ui/marquee";

const MINREVIEWS = 12;

const Wrapper = ({ children }: { children?: React.ReactNode }) => (
  <figure
    className={cn(
      "relative min-h-24 w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
      "bg-gradient-to-r from-gray-800/50 to-gray-900/50 transition-all duration-300 hover:scale-x-105"
    )}
  >
    {children}
  </figure>
);

const ReviewCard = ({ review }: { review: Feedback | null }) => {
  if (!review) {
    return (
      <Link href="/feedback" passHref>
        <Wrapper>
          <div className="flex flex-row items-center gap-2">
            <img
              className="rounded-full"
              width="32"
              height="32"
              alt=""
              src="/assets/images/icons/bloomlabs.png"
            />
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium text-white">
                Bloomlabs
              </figcaption>
            </div>
          </div>
          <blockquote className="mt-2 text-sm truncate max-w-full">
            Submit your review today!
          </blockquote>
        </Wrapper>
      </Link>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={review.user.avatar}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {review.user.username}
          </figcaption>
        </div>
      </div>
      <blockquote className="mt-2 text-sm truncate max-w-full">
        {review.content}
      </blockquote>
    </Wrapper>
  );
};

export function FeedbackMarquee() {
  const [firstRow, setFirstRow] = useState<(Feedback | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [secondRow, setSecondRow] = useState<(Feedback | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const { data, isLoading } = useFeedback();

  useEffect(() => {
    if (!data) return;
    const feedback: (Feedback | null)[] = [...data];

    if (feedback.length < MINREVIEWS) {
      const diff = MINREVIEWS - data.length;
      for (let i = 0; i < diff; i++) {
        feedback.push(null);
      }
    }

    const firstRow = feedback.slice(0, feedback.length / 2);
    const secondRow = feedback.slice(feedback.length / 2);

    setFirstRow(firstRow);
    setSecondRow(secondRow);
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-fit w-full flex-col items-center justify-center overflow-x-hidden rounded-lg bg-background">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review, idx) => (
          <ReviewCard
            key={`review-${review?.id}-left-${idx}`}
            review={review}
          />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review, idx) => (
          <ReviewCard
            key={`review-${review?.id}-right-${idx}`}
            review={review}
          />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background" />
    </div>
  );
}
