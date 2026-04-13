export const toolboxSystem = {
  shellRow: 'flex flex-col lg:flex-row gap-8 animate-fade-in p-2',
  inputColumn: 'w-full lg:w-1/3 space-y-6',
  label: 'text-[10px] font-black uppercase tracking-widest text-black/50 ml-1',
  inputBase:
    'w-full p-4 border-[4px] border-black rounded-xl font-bold text-sm outline-none transition-colors shadow-[4px_4px_0px_0px_black]',
  resultPanel:
    'flex-1 bg-white border-[4px] border-black rounded-[24px] shadow-[8px_8px_0px_0px_black] p-8 overflow-y-auto max-h-[600px] custom-scrollbar relative',
  copyButton:
    'absolute top-6 right-6 bg-black text-white p-2 rounded-xl border-2 border-black hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_black] z-10',
};

export const toolboxActionButton = (bgClass: string, textClass = 'text-black') =>
  `w-full ${bgClass} ${textClass} border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2`;
