/**
 * MainLayout
 *
 * Public website shell that wraps all public-facing pages.
 * Composes TopBar → Header → Main Content → Footer.
 * Provides consistent page structure and scroll restoration.
 */

import Footer from "../components/navigation/Footer";
import Header from "../components/navigation/Header";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

export default function MainLayout() {
  const { pathname } = useLocation();

  /** Scroll to top on route change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* Main navigation */}
      <Header />

      {/* Page content — rendered by nested routes */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
}
