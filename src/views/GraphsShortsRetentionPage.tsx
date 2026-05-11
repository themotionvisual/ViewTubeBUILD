import React from "react"
import { Link } from "react-router-dom"

const GraphsShortsRetentionPage: React.FC = () => {
 return (
  <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-8">
   <header className="bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
     <h1 className="text-3xl font-[900] uppercase tracking-tighter leading-none">
      SHORTS RETENTION <span className="text-[#FF7497]">MODULE</span>
     </h1>
     <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">
      Moved to Performance Hub
     </p>
    </div>
    <div className="flex items-center gap-3">
     <Link
      to="/graphs"
      className="h-11 px-4 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-wider border-[4px] border-black inline-flex items-center">
      Back To Graphs
     </Link>
     <Link
      to="/performance"
      className="h-11 px-5 bg-[#CCFF00] text-black rounded-xl text-[12px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors inline-flex items-center">
      Go to Performance Hub
     </Link>
    </div>
   </header>

   <div className="flex flex-col items-center justify-center p-20 text-center bg-white border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_black]">
    <h2 className="text-4xl font-[900] uppercase tracking-tighter mb-4">
      MODULE RELOCATED
    </h2>
    <p className="text-lg font-bold uppercase tracking-widest opacity-60 max-w-2xl">
      The Shorts Retention charts and visualizations have been permanently moved to the Performance Hub to consolidate all analytics into a unified dashboard experience.
    </p>
    <Link
      to="/performance"
      className="mt-8 h-14 px-8 bg-black text-white rounded-xl text-[14px] font-black uppercase tracking-wider border-[4px] border-black hover:bg-[#FFDD00] hover:text-black transition-colors inline-flex items-center">
      Open Performance Hub
    </Link>
   </div>
  </div>
 )
}

export default GraphsShortsRetentionPage
