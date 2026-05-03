import { ROUTES } from "@/constant/routes";
import { Bike } from "lucide-react";
import { Link } from "react-router-dom";


interface Props {
    title: string;
    description: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function AuthCard({ title, description, children, footer }: Props) {
    return (
        <div className="min-h-screen bg-linear-to-br from-[hsl(var(--background))] via-[hsl(138, 60%, 94%)] to-[hsl(var(--background))] flex items-center justify-center p-4">

            {/* background blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[hsl(var(--primary)/0.06)] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[hsl(var(--accent)/0.06)] rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

            <div
                className="w-full max-w-md relative">

                {/* logo */}
                <Link
                    to={ROUTES.HOME}
                    className="flex items-center justify-center gap-2 text-[hsl(var(--primary))] font-bold text-2xl mb-8 font-['Plus_Jakarta_Sans'] hover:opacity-80 transition-opacity">
                    <Bike size={28} />
                    VeloRent
                </Link>

                {/* card */}
                <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-xl overflow-hidden">

                    {/* card header */}
                    <div className="px-8 pt-8 pb-6 border-b border-[hsl(var(--border))]">
                        <h1 className="text-2xl font-extrabold text-[hsl(var(--foreground))] font-['Plus_Jakarta_Sans']">{title}</h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                            {description}
                        </p>
                    </div>

                    {/* card body */}
                    <div className="px-8 py-7">
                        {children}
                    </div>

                    {/* card footer */}
                    {footer && (
                        <div className="px-8 py-4 bg-[hsl(var(--muted)/0.5)] border-t border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--muted-foreground))]">
                            {footer}
                        </div>
                    )}
                </div>

                {/* Eco tagline */}
                <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
                    🌿 Ride green, live clean — VeloRent
                </p>
            </div>
        </div>
    )
}