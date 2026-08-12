"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type PollingRefresherProps = {
  intervalMs: number;
};

export default function PollingRefresher({
  intervalMs,
}: PollingRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}