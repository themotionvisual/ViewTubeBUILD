import React from "react";
import { Sidebar } from "../components/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden font-sans">
    <Sidebar />
    <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-8 relative pb-96">
      {children}
    </main>
  </div>
);
