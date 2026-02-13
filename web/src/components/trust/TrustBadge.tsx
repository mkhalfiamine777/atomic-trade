
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
    score: number;
    className?: string;
    showLabel?: boolean;
}

export const TrustBadge = ({ score, className, showLabel = false }: TrustBadgeProps) => {
    let icon = null;
    let label = "";
    let colorClass = "";

    if (score >= 80) {
        icon = <ShieldCheck className="w-4 h-4" />;
        label = "Trusted";
        colorClass = "text-yellow-500 fill-yellow-500/10";
    } else if (score >= 50) {
        icon = <Shield className="w-4 h-4" />;
        label = "Standard";
        colorClass = "text-blue-500 fill-blue-500/10";
    } else {
        // Optional: Hide badge for low scores or show caution
        icon = <ShieldAlert className="w-4 h-4" />;
        label = "New";
        colorClass = "text-gray-400";
    }

    if (!icon) return null;

    return (
        <div className={cn("flex items-center gap-1", colorClass, className)} title={`Trust Score: ${score}`}>
            {icon}
            {showLabel && <span className="text-xs font-medium">{label}</span>}
        </div>
    );
};
