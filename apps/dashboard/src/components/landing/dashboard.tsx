"use client";

import Iphone15Pro from "../magicui/iphone-15-pro";
import Safari from "../magicui/safari";

export function DashboardSection() {
  return (
    <section className="w-full h-fit grid justify-center items-center">
      <Iphone15Pro
        className="w-full h-[700px] md:hidden"
        src="https://via.assets.so/img.jpg?w=300&h=600&tc=white&bg=%2325255f&t=bloomlabs"
      />

      <Safari
        className="mx-40 h-full hidden md:block"
        url="oliver.bloomlabs.me/g/1285614396181184605"
        src="https://via.assets.so/img.jpg?w=1600&h=800&tc=white&bg=%2325255f&t=bloomlabs"
      />
    </section>
  );
}
