import React from 'react';
import { Film, Tv, Layers, Video, Clapperboard, Disc } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Items', icon: Disc },
  { id: 'Movies', label: 'Movies', icon: Film },
  { id: 'TV Episodes', label: 'TV Episodes', icon: Tv },
  { id: 'TV Packs', label: 'TV Packs', icon: Layers },
  { id: 'CAMs', label: 'CAMs / Screeners', icon: Video },
  { id: 'Split Scenes', label: 'Split Scenes', icon: Clapperboard }
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-cyan-100 dark:bg-cyan-500/15 border-cyan-400 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300 shadow-sm shadow-cyan-500/10 font-semibold'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
