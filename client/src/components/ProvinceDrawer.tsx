import React, { useState } from 'react';
import { Province, Nation, Region, ConstructionItem } from '../types';
import { X, Hammer, Coins, TrendingUp, Shield, Users, Landmark, Wheat, Pickaxe, BookOpen, Anchor, Train, Castle, Swords } from 'lucide-react';

interface ProvinceDrawerProps {
  province: Province | null;
  playerNation: Nation | null;
  nations: Record<string, Nation>;
  regions: Record<string, Region>;
  constructionQueue: ConstructionItem[];
  onClose: () => void;
  onStartBuild: (pid: number, buildingType: string) => void;
  onToggleSubsidy: (pid: number, subsidyType: string) => void;
  onRecruitUnit: (pid: number, unitType: string) => void;
}

export const ProvinceDrawer: React.FC<ProvinceDrawerProps> = ({
  province,
  playerNation,
  nations,
  regions,
  constructionQueue,
  onClose,
  onStartBuild,
  onToggleSubsidy,
  onRecruitUnit
}) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'subsidies' | 'military'>('buildings');

  if (!province) return null;

  const isOwner = playerNation && province.owner === playerNation.tag;
  const ownerNation = province.owner && nations[province.owner] ? nations[province.owner] : null;
  const regionData = province.region && regions[province.region] ? regions[province.region] : null;
  const regionController = regionData?.controller && nations[regionData.controller] ? nations[regionData.controller] : null;

  // Active queue item for this province
  const activeBuild = constructionQueue.find(q => q.pid === province.id);

  const BUILDINGS_INFO = [
    { key: 'farm', name: 'Bauernhof', icon: <Wheat size={16} className="text-amber-400" />, costBase: 100, daysBase: 60, desc: 'Erhöht Nahrung und Bevölkerungswachstum' },
    { key: 'market', name: 'Marktplatz', icon: <Coins size={16} className="text-yellow-400" />, costBase: 150, daysBase: 75, desc: 'Erhöht Steuern und Handelsvolumen (+12%/Stufe)' },
    { key: 'manufactory', name: 'Manufaktur', icon: <Pickaxe size={16} className="text-emerald-400" />, costBase: 250, daysBase: 90, desc: 'Produziert Industriegüter und Fertigwaren' },
    { key: 'university', name: 'Universität', icon: <BookOpen size={16} className="text-sky-400" />, costBase: 350, daysBase: 120, desc: 'Generiert monatliche Forschungspunkte' },
    { key: 'administration', name: 'Verwaltungsgebäude', icon: <Landmark size={16} className="text-indigo-400" />, costBase: 180, daysBase: 80, desc: 'Verbessert Steuereffizienz und senkt Korruption' },
    { key: 'barracks', name: 'Kaserne', icon: <Swords size={16} className="text-rose-400" />, costBase: 200, daysBase: 70, desc: 'Erhöht Rekrutierungsgeschwindigkeit und Mannstärke' },
    { key: 'fortress', name: 'Festung', icon: <Shield size={16} className="text-slate-300" />, costBase: 300, daysBase: 100, desc: 'Verstärkt die Verteidigung massiv gegen Belagerungen' },
    { key: 'port', name: 'Seehafen', icon: <Anchor size={16} className="text-cyan-400" />, costBase: 250, daysBase: 90, desc: 'Ermöglicht Seehandel und Kriegsschiffsbau' },
    { key: 'railway', name: 'Eisenbahn', icon: <Train size={16} className="text-orange-400" />, costBase: 400, daysBase: 120, desc: 'Schnellste Truppenverlegung & Nachschubtransport' },
    { key: 'castle', name: 'Schloss & Residenz', icon: <Castle size={16} className="text-purple-400" />, costBase: 500, daysBase: 150, desc: 'Steigert Prestige und dynastischen Einfluss' }
  ];

  return (
    <div className="fixed top-16 right-0 bottom-8 w-96 z-40 pax-panel shadow-2xl flex flex-col border-l border-amber-500/30 overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="pax-header p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {ownerNation?.flag && (
            <img src={ownerNation.flag} alt="flag" className="w-7 h-4 object-cover rounded border border-amber-400/40 shadow" />
          )}
          <div>
            <h2 className="font-royal font-bold text-amber-300 text-base leading-none">{province.name}</h2>
            <span className="text-[11px] text-slate-300">
              {ownerNation ? ownerNation.name : 'Neutral'} · {regionData ? regionData.name : 'Region'}
            </span>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <X size={16} />
        </button>
      </div>

      {/* Regional Bonus Banner */}
      {regionData && (
        <div className={`px-3 py-1.5 text-xs flex items-center justify-between border-b ${
          regionController?.tag === playerNation?.tag
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <span className="font-semibold">Region {regionData.name}:</span>
          <span>
            {regionController
              ? `100% Kontrolle (${regionController.name}) ★ Boni Aktiv!`
              : `${regionData.controlBreakdown[playerNation?.tag || ''] || 0}% Preußische Kontrolle`}
          </span>
        </div>
      )}

      {/* Province Overview Stats */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Users size={11} /> Bevölkerung
          </div>
          <div className="font-bold text-slate-100">{province.population.toLocaleString('de-DE')}</div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <TrendingUp size={11} /> Zufriedenheit
          </div>
          <div className="font-bold text-emerald-400">{province.satisfaction}%</div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Shield size={11} /> Verteidigung
          </div>
          <div className="font-bold text-rose-300">+{province.defense}%</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 text-xs">
        {[
          { id: 'buildings', name: 'Gebäude & Ausbau' },
          { id: 'subsidies', name: 'Subventionen' },
          { id: 'military', name: 'Rekrutierung' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-semibold transition ${
              activeTab === t.id
                ? 'text-amber-300 border-b-2 border-amber-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div>
            {activeBuild && (
              <div className="mb-3 p-2.5 rounded bg-amber-950/40 border border-amber-500/40 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Hammer size={13} className="animate-spin text-amber-400" />
                    Ausbau: {activeBuild.buildingType} (Stufe {activeBuild.targetLevel})
                  </span>
                  <span className="text-amber-400 font-mono">
                    {activeBuild.totalDays - activeBuild.progressDays} Tage
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(activeBuild.progressDays / activeBuild.totalDays) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              {BUILDINGS_INFO.map(b => {
                const currentLevel = (province.buildings as any)[b.key] || 0;
                const cost = b.costBase * (currentLevel + 1);
                const isMax = currentLevel >= 4;

                return (
                  <div key={b.key} className="p-2 rounded bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-slate-800 border border-slate-700">
                        {b.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                          {b.name}
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-amber-300 font-mono">
                            Stufe {currentLevel}/4
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{b.desc}</div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        disabled={isMax || !!activeBuild || (playerNation?.treasury || 0) < cost}
                        onClick={() => onStartBuild(province.id, b.key)}
                        className={`text-xs py-1 px-2.5 rounded font-medium transition ${
                          isMax
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : (playerNation?.treasury || 0) < cost
                            ? 'bg-rose-950/40 text-rose-400 border border-rose-800 cursor-not-allowed'
                            : 'pax-btn text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                        }`}
                      >
                        {isMax ? 'Max' : `${cost} ₳`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBSIDIES TAB */}
        {activeTab === 'subsidies' && (
          <div className="space-y-2.5 text-xs">
            <p className="text-[11px] text-slate-400 mb-2">
              Subventioniert Wirtschaftssektoren direkt aus dem Staatshaushalt, um Wachstum und Innovation gezielt anzukurbeln.
            </p>

            {[
              { key: 'agriculture', name: 'Landwirtschaftssubvention', cost: 1.5, effect: '+35% Ernteertrag & beschleunigtes Bevölkerungswachstum' },
              { key: 'industry', name: 'Industriesubvention', cost: 2.5, effect: '+40% Manufakturausstoß und höhere Steuereffizienz' },
              { key: 'university', name: 'Forschungsstiftung', cost: 3.0, effect: '+50% Wissenschaftspunkte für die Akademie der Wissenschaften' },
              { key: 'infrastructure', name: 'Wegebau & Kanalzuschuss', cost: 2.0, effect: '+30% Handelsdurchsatz & schnellere Truppenversorgung' }
            ].map(sub => {
              const active = (province.subsidies as any)[sub.key];
              return (
                <div key={sub.key} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="pr-2">
                    <div className="font-semibold text-slate-100">{sub.name}</div>
                    <div className="text-[10px] text-emerald-400">{sub.effect}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">Kosten: {sub.cost} Taler/Monat</div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => onToggleSubsidy(province.id, sub.key)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                        active
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'pax-btn text-slate-400 hover:text-white'
                      }`}
                    >
                      {active ? 'Aktiv' : 'Fördern'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MILITARY RECRUITMENT TAB */}
        {activeTab === 'military' && (
          <div className="space-y-2.5 text-xs">
            <p className="text-[11px] text-slate-400 mb-2">
              Rekrutiert Truppen des 18. Jahrhunderts für die Garnison dieser Provinz:
            </p>

            {[
              { key: 'infantry', name: 'Linieninfanterie (1000 Mann)', cost: 120, time: '45 Tage', desc: 'Zuverlässiges Salvenfeuer in Linienformation' },
              { key: 'cavalry', name: 'Husaren & Kavallerie (500 Reiter)', cost: 200, time: '40 Tage', desc: 'Schnelle Aufklärung, Flankenangriff und Verfolgung' },
              { key: 'artillery', name: 'Feldartillerie (12 Kanonen)', cost: 300, time: '60 Tage', desc: 'Verheerende Kanonaden gegen feindliche Linien' }
            ].map(unit => (
              <div key={unit.key} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100">{unit.name}</div>
                  <div className="text-[10px] text-slate-400">{unit.desc}</div>
                  <div className="text-[10px] text-amber-300 font-mono mt-0.5">Kosten: {unit.cost} ₳ · Ausbildungszeit: {unit.time}</div>
                </div>

                {isOwner && (
                  <button
                    disabled={(playerNation?.treasury || 0) < unit.cost}
                    onClick={() => onRecruitUnit(province.id, unit.key)}
                    className="pax-btn text-xs text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                  >
                    Rekrutieren
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
