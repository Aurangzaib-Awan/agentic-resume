"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { ShellContext } from "./ShellContext";

export default function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // On mobile the closed drawer is only moved off-screen, so it must also leave the tab order.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  // On mobile the sidebar is a drawer, so its collapse button should close it
  // rather than switch to the icon-only desktop mode.
  const toggleCollapse = () => {
    if (window.matchMedia("(max-width: 760px)").matches) closeDrawer();
    else setCollapsed((prev) => !prev);
  };

  return (
    <ShellContext.Provider value={{ openDrawer, closeDrawer }}>
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} drawerOpen={drawerOpen} hidden={isMobile && !drawerOpen} />
      <div className={["drawer-backdrop", drawerOpen ? "open" : ""].join(" ").trim()} onClick={closeDrawer}></div>
      {children}
    </ShellContext.Provider>
  );
}
