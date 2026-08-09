import { Inbox, MessageSquare, MapPin, Coins, Banknote } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  messagesquare: MessageSquare,
  mappin: MapPin,
  coins: Coins,
  banknote: Banknote,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const resolvedIcon =
    typeof icon === "string" ? ICON_MAP[icon.toLowerCase()] : undefined;
  const FallbackIcon = resolvedIcon ?? Inbox;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-sand/30 dark:bg-nile-light/30 flex items-center justify-center">
        {typeof icon === "string" ? (
          <FallbackIcon className="w-6 h-6 text-muted-foreground" />
        ) : (
          icon || <Inbox className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-sm font-medium text-fg-foreground dark:text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
