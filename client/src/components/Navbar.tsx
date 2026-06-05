import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Bot, Sparkles, LogOut, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "./ThemeToggle";
import { parseAgentsQuery } from "@/lib/catalog-filters";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function CatalogNavLink({
  tab,
  children,
}: {
  tab: "free" | "team";
  children: React.ReactNode;
}) {
  const [pathname] = useLocation();
  const search = useSearch();
  const isAgents = pathname === "/agents" || pathname.startsWith("/agents/");
  const currentTab = isAgents ? parseAgentsQuery(search).tab : null;
  const isActive = pathname === "/agents" && currentTab === tab;

  return (
    <Link
      href={tab === "team" ? "/agents?tab=team" : "/agents?tab=free"}
      className={cn(
        "relative px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-primary"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
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
  const [pathname] = useLocation();
  const search = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onCustomPage = pathname === "/custom" || pathname.startsWith("/custom/");
  const onAgentsPage = pathname === "/agents";
  const agentsTab = onAgentsPage ? parseAgentsQuery(search).tab : null;

  const showCatalogLink = !onAgentsPage || agentsTab !== "free";
  const showTeamLink = !onAgentsPage || agentsTab !== "team";
  const showCustomCta = !onCustomPage;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-slate-700/50 glass-panel dark:glass-panel-dark bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer" onClick={closeMobile}>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <Bot size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-slate-100">
              Каталог<span className="text-primary">Агентов</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {showCatalogLink && (
              <CatalogNavLink tab="free">Каталог</CatalogNavLink>
            )}
            {showTeamLink && (
              <CatalogNavLink tab="team">Наши решения</CatalogNavLink>
            )}
            {isAuthenticated && pathname === "/history" && (
              <span className="relative px-4 py-2 text-sm font-medium text-primary">
                История
              </span>
            )}
            {isAuthenticated && pathname !== "/history" && (
              <Link
                href="/history"
                className="relative px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                История
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />

            {/* Desktop CTA */}
            {showCustomCta && (
              <Link
                href="/custom"
                className="hidden md:inline-flex group relative items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-slate-900 dark:bg-primary rounded-full hover:bg-slate-800 dark:hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none"
              >
                <Sparkles size={15} className="text-accent group-hover:animate-pulse" />
                Заказать кастомного агента
              </Link>
            )}

            {/* Auth (desktop) */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User size={16} className="text-slate-500 dark:text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut size={14} />
                  <span>Выйти</span>
                </button>
              </div>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Меню"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {showCatalogLink && (
                <Link href="/agents?tab=free" onClick={closeMobile}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Каталог
                </Link>
              )}
              {showTeamLink && (
                <Link href="/agents?tab=team" onClick={closeMobile}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Наши решения
                </Link>
              )}
              {isAuthenticated && (
                <Link href="/history" onClick={closeMobile}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  История
                </Link>
              )}
              {showCustomCta && (
                <Link href="/custom" onClick={closeMobile}
                  className="mt-2 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-primary rounded-xl hover:bg-slate-800 dark:hover:bg-primary/90 transition-colors">
                  <Sparkles size={15} className="text-accent" />
                  Заказать кастомного агента
                </Link>
              )}
              {isAuthenticated && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User size={16} className="text-slate-500" />
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </span>
                  </div>
                  <button onClick={() => { logout(); closeMobile(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <LogOut size={14} />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
