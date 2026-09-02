import React, { useState } from 'react';
import { Film, Star, Play, Calendar, Clock, User, Award, ExternalLink, Sparkles, X } from 'lucide-react';

export default function MediaEnrichmentCard({ enrichment, rawTitle, onOpenTrailer }) {
  if (!enrichment) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/20 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>{enrichment.title || rawTitle}</span>
              {enrichment.year && (
                <span className="text-xs font-mono text-slate-400">({enrichment.year})</span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>IMDb / TMDB Verified Metadata</span>
              {enrichment.contentRating && (
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                  {enrichment.contentRating}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating Score */}
        {enrichment.rating && (
          <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/30 self-start sm:self-auto">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <div>
              <div className="text-sm font-black text-amber-300 font-mono">
                {enrichment.rating} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
              </div>
              <div className="text-[10px] text-slate-500">{enrichment.votes} votes</div>
            </div>
          </div>
        )}
      </div>

      {/* Synopsis */}
      {enrichment.synopsis && (
        <p className="text-xs text-slate-300 leading-relaxed select-text">
          {enrichment.synopsis}
        </p>
      )}

      {/* Cast & Crew Pill Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {enrichment.director && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Director:</span>
              <span className="text-slate-200 font-semibold">{enrichment.director}</span>
            </div>
          </div>
        )}

        {enrichment.cast && enrichment.cast.length > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px]">Starring:</span>
              <span className="text-slate-200 font-semibold truncate block">
                {enrichment.cast.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trailer & IMDb links */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onOpenTrailer(enrichment.trailerKey || "dQw4w9WgXcQ")}
          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-amber-300" />
          <span>Watch Official HD Trailer</span>
        </button>

        {enrichment.imdbId && (
          <a
            href={`https://www.imdb.com/title/${enrichment.imdbId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>View on IMDb</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
