import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../context/useBrain';

interface PostActionReflectionProps {
  toolId: string;
}

export const PostActionReflection: React.FC<PostActionReflectionProps> = ({ toolId }) => {
  const { emitSignal } = useBrain();
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating && !notes.trim()) return;

    try {
      await emitSignal(toolId, 'USER_FEEDBACK', {
        rating,
        notes: notes.trim(),
      });
      setIsSubmitted(true);
    } catch (e) {
      console.error("Failed to emit feedback signal", e);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full h-[140px] bg-[#ccff00] border-[4px] border-black rounded-2xl flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_black] animate-in fade-in zoom-in duration-300">
        <CheckCircle2 size={40} className="text-black mb-2" strokeWidth={3} />
        <h3 className="font-[1000] uppercase text-xl tracking-tighter text-black">Feedback Logged</h3>
        <p className="text-xs font-bold text-black/60 uppercase tracking-widest mt-1">Brain Sync Updated</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[140px] bg-white border-[4px] border-black rounded-2xl flex shadow-[6px_6px_0px_0px_black] overflow-hidden">
      {/* Left side: Rating */}
      <div className="w-[120px] bg-gray-100 border-r-[4px] border-black flex flex-col items-center justify-center gap-4 p-2 shrink-0">
        <span className="text-[10px] font-black uppercase text-black/40 tracking-widest text-center leading-tight">Rate<br/>Generation</span>
        <div className="flex gap-2">
          <button
            onClick={() => setRating('up')}
            className={`w-10 h-10 border-[3px] border-black rounded-xl flex items-center justify-center transition-all ${
              rating === 'up'
                ? 'bg-[#00CCFF] shadow-[2px_2px_0px_0px_black] translate-y-[-2px]'
                : 'bg-white hover:bg-gray-50 opacity-50 hover:opacity-100'
            }`}
          >
            <ThumbsUp size={16} className="text-black" />
          </button>
          <button
            onClick={() => setRating('down')}
            className={`w-10 h-10 border-[3px] border-black rounded-xl flex items-center justify-center transition-all ${
              rating === 'down'
                ? 'bg-[#FF3399] shadow-[2px_2px_0px_0px_black] translate-y-[-2px]'
                : 'bg-white hover:bg-gray-50 opacity-50 hover:opacity-100'
            }`}
          >
            <ThumbsDown size={16} className="text-black" />
          </button>
        </div>
      </div>

      {/* Right side: Notes & Submit */}
      <div className="flex-1 flex bg-white relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context... (e.g. 'Too aggressive', 'Perfect tone', 'Make it shorter next time')"
          className="w-full h-full p-4 pr-[80px] resize-none outline-none font-bold text-sm bg-transparent placeholder-black/30"
        />
        
        {/* Submit Button */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={handleSubmit}
            disabled={!rating && !notes.trim()}
            className="w-12 h-12 bg-black border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
          >
            <Send size={18} className="text-[#ccff00] ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
