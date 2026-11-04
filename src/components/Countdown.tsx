"use client";

import { useEffect, useState } from "react";

export default function Countdown({ targetDate }: { targetDate: Date | string }) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const items = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]"
        >
          <div className="text-2xl sm:text-3xl font-bold tabular-nums">
            {String(item.value).padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm text-white/70 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
