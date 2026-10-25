import { useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PausableMarquee({ children, label }: { children: ReactNode; label: string }) {
  const [paused, setPaused] = useState(false);
  const action = `${paused ? "Reprendre" : "Mettre en pause"} ${label}`;
  return (
    <div className="marquee-region relative flex items-center gap-3" data-paused={paused}>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="marquee-track flex w-max gap-12 whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-12">{children}</div>
          <div aria-hidden="true" className="marquee-duplicate flex shrink-0 items-center gap-12">{children}</div>
        </div>
      </div>
      <Button type="button" size="icon" variant="ghost" onClick={() => setPaused((v) => !v)} aria-label={action} aria-pressed={paused} title={action} className="mr-3 shrink-0">
        {paused ? <Play /> : <Pause />}
      </Button>
    </div>
  );
}