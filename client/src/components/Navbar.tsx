import { Link, useRoute } from "wouter";
import { Bot, Sparkles, LogIn, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/hooks/use-auth";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [isActive] = useRoute(href);
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 text-sm font-medium transition-colors",
        isActive ? "text-primary" : "text-slate-600 hover:text-slate-900"
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
                <Bot size={24} strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                Agent<span className="text-primary">Directory</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <NavLink href="/agents">Browse Agents</NavLink>
              {isAuthenticated && <NavLink href="/history">My History</NavLink>}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/custom"
              className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none"
            >
              <Sparkles size={15} className="text-accent group-hover:animate-pulse" />
              <span>Custom Agent</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-slate-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:block">Exit</span>
                </button>
              </div>
            ) : (
              <a
                href="/api/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200"
                data-testid="button-login"
              >
                <LogIn size={15} />
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
