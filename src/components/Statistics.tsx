import React from 'react';
import { LogEntry } from '../types';
import { TrendingUp, Award, Zap, AlertCircle, Heart } from 'lucide-react';

interface StatisticsProps {
  entries: LogEntry[];
}

export default function Statistics({ entries }: StatisticsProps) {
  if (entries.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12 bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-6">
        <Heart size={44} className="text-[#804A4A] mx-auto mb-3 opacity-60" />
        <h3 className="text-[#3D3D3D] font-bold text-lg mb-1">Noch keine Statistiken verfügbar</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Sobald du Situationen im Logbuch abspeicherst, analysiert die App deine psychosomatischen Muster und zeigt dir wertvolle Zusammenhänge an.
        </p>
      </div>
    );
  }

  // Count Feelings Frequencies
  const gefuehlCounts: { [key: string]: number } = {};
  const koerperCounts: { [key: string]: number } = {};
  
  // Count correlations: e.g. "Gefühl X" -> "Körperliche Reaktion Y" -> count
  const correlationCounts: { [key: string]: { [key: string]: number } } = {};

  entries.forEach(entry => {
    const gefuehle = entry.gefuehle || [];
    const koerper = entry.koerper || [];

    gefuehle.forEach(g => {
      gefuehlCounts[g] = (gefuehlCounts[g] || 0) + 1;

      if (!correlationCounts[g]) {
        correlationCounts[g] = {};
      }
      koerper.forEach(k => {
        correlationCounts[g][k] = (correlationCounts[g][k] || 0) + 1;
      });
    });

    koerper.forEach(k => {
      koerperCounts[k] = (koerperCounts[k] || 0) + 1;
    });
  });

  // Sort feelings
  const sortedGefuehle = Object.entries(gefuehlCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Sort body symptoms
  const sortedKoerper = Object.entries(koerperCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Find top psychosomatic correlation
  let topCorrelation = { gefuehl: '', koerper: '', count: 0 };
  Object.entries(correlationCounts).forEach(([g, bodyMap]) => {
    Object.entries(bodyMap).forEach(([k, count]) => {
      if (count > topCorrelation.count) {
        topCorrelation = { gefuehl: g, koerper: k, count };
      }
    });
  });

  const maxGefuehlCount = sortedGefuehle[0]?.[1] || 1;
  const maxKoerperCount = sortedKoerper[0]?.[1] || 1;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Total card */}
        <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#728264]/10 text-[#728264] rounded-2xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Erfasste Einträge</span>
            <h4 className="text-2xl font-black text-[#3D3D3D]">{entries.length}</h4>
            <p className="text-[10px] text-gray-500">Wertvolle Schritte zur Selbstreflexion</p>
          </div>
        </div>

        {/* Dynamic streak/insight card */}
        <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#804A4A]/10 text-[#804A4A] rounded-2xl shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Häufigstes Gefühl</span>
            <h4 className="text-lg font-black text-[#3D3D3D] truncate max-w-[200px]">
              {sortedGefuehle[0]?.[0] || 'Keine Daten'}
            </h4>
            <p className="text-[10px] text-gray-500">
              {sortedGefuehle[0] 
                ? `${sortedGefuehle[0][1]} Mal erfasst` 
                : 'Trage Situationen ein, um Analysen zu starten'}
            </p>
          </div>
        </div>

      </div>

      {/* Psychosomatic Correlation Box */}
      {topCorrelation.count > 0 && (
        <div className="bg-[#E3DEC6] rounded-2xl border border-[#D1CBBB] p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="shrink-0 text-[#804A4A] mt-0.5">
              <Zap size={20} className="fill-[#804A4A]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#3D3D3D] mb-1">Psychosomatische Verknüpfung</h4>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                Deine Einträge weisen auf ein regelmäßiges Verhaltens- und Körpermuster hin:
                Wenn du <span className="font-bold text-[#804A4A]">{topCorrelation.gefuehl}</span> fühlst, 
                reagiert dein Körper besonders häufig mit <span className="font-bold text-[#728264]">{topCorrelation.koerper}</span> (insgesamt <span className="font-bold">{topCorrelation.count} Mal</span> beobachtet).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Frequency analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Feelings breakdown */}
        <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm space-y-4">
          <div className="border-b border-[#D1CBBB]/40 pb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-[#728264]" />
            <h4 className="font-bold text-sm text-[#3D3D3D]">Top 5 Gefühle</h4>
          </div>

          <div className="space-y-3">
            {sortedGefuehle.map(([gefuehl, count]) => {
              const pct = Math.round((count / maxGefuehlCount) * 100);
              return (
                <div key={gefuehl} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#3D3D3D]">
                    <span className="truncate max-w-[180px]">{gefuehl}</span>
                    <span>{count}x</span>
                  </div>
                  <div className="h-2 w-full bg-[#FCFAF5] rounded-full overflow-hidden border border-[#D1CBBB]/30">
                    <div 
                      className="h-full bg-[#728264] rounded-full" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bodily breakdown */}
        <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm space-y-4">
          <div className="border-b border-[#D1CBBB]/40 pb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-[#804A4A]" />
            <h4 className="font-bold text-sm text-[#3D3D3D]">Top 5 Körperl. Reaktionen</h4>
          </div>

          <div className="space-y-3">
            {sortedKoerper.map(([koerper, count]) => {
              const pct = Math.round((count / maxKoerperCount) * 100);
              return (
                <div key={koerper} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#3D3D3D]">
                    <span className="truncate max-w-[180px]">{koerper}</span>
                    <span>{count}x</span>
                  </div>
                  <div className="h-2 w-full bg-[#FCFAF5] rounded-full overflow-hidden border border-[#D1CBBB]/30">
                    <div 
                      className="h-full bg-[#804A4A] rounded-full" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Context info banner */}
      <div className="bg-[#FCFAF5] rounded-xl border border-[#D1CBBB]/50 p-4 text-xs text-gray-500 leading-relaxed text-center">
        💡 Kognitive Verhaltenstherapie nutzt solche Logs, um automatische Gedankenmuster aufzudecken. Betrachte deine Daten wertfrei und besprich deine Verknüpfungen bei Bedarf mit deinem Therapeuten.
      </div>

    </div>
  );
}
