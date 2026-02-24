import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
    title,
    value,
    icon,
    color = "blue",
    percentage = null,
    trend = null
}) {
    const styles = {
        blue: {
            ring: "ring-blue-500/20",
            iconBg: "bg-blue-50 text-blue-600",
            text: "text-blue-600",
            bar: "bg-blue-500"
        },
        green: {
            ring: "ring-emerald-500/20",
            iconBg: "bg-emerald-50 text-emerald-600",
            text: "text-emerald-600",
            bar: "bg-emerald-500"
        },
        red: {
            ring: "ring-red-500/20",
            iconBg: "bg-red-50 text-red-600",
            text: "text-red-600",
            bar: "bg-red-500"
        },
        gray: {
            ring: "ring-slate-400/20",
            iconBg: "bg-slate-100 text-slate-600",
            text: "text-slate-500",
            bar: "bg-slate-500"
        }
    };

    const style = styles[color];

    return (
        <div
            className={`
        relative group bg-white/80 backdrop-blur-xl
        p-6 rounded-2xl shadow-sm
        ring-1 ${style.ring}
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
      `}
        >
            {/* ICON */}
            <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${style.iconBg}`}>
                {icon}
            </div>

            {/* TITLE + VALUE */}
            <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                    {title}
                </p>

                <div className="flex items-end gap-3 mt-1">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </span>

                    {trend !== null && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${style.text}`}>
                            {trend >= 0 ? (
                                <ArrowUpRight size={14} />
                            ) : (
                                <ArrowDownRight size={14} />
                            )}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>

            {/* PROGRESS BAR */}
            {percentage !== null && (
                <div className="mt-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${style.bar} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1">
                        {percentage}% of total
                    </div>
                </div>
            )}

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
        </div>
    );
}