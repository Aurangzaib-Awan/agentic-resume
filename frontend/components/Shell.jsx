"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { ShellContext } from "./ShellContext";

export default function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} drawerOpen={drawerOpen} />
      <div className={["drawer-backdrop", drawerOpen ? "open" : ""].join(" ").trim()} onClick={closeDrawer}></div>
      {children}
    </ShellContext.Provider>
  );
}
