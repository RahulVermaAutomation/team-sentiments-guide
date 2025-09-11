import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WellnessScreenProps {
  children: React.ReactNode;
  className?: string;
}

export const WellnessScreen = ({ children, className }: WellnessScreenProps) => {
  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center p-4",
      "screen-transition",
      className
    )}>
      <div className="w-full max-w-md">
        <div className="wellness-card">
          {children}
        </div>
      </div>
    </div>
  );
};

interface WellnessHeaderProps {
  emoji: string;
  title: string;
  description: string;
}

export const WellnessHeader = ({ emoji, title, description }: WellnessHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="text-4xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

interface WellnessActionsProps {
  children: React.ReactNode;
}

export const WellnessActions = ({ children }: WellnessActionsProps) => {
  return (
    <div className="flex flex-col gap-3 mt-8">
      {children}
    </div>
  );
};