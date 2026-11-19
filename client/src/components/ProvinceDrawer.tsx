import React, { useState } from 'react';
import { Province, Nation, Region, ConstructionItem } from '../types';
import { X, Hammer, Coins, TrendingUp, Shield, Users, Landmark, Wheat, Pickaxe, BookOpen, Anchor, Castle, Swords, CheckCircle2, AlertCircle, Waves, Ship } from 'lucide-react';

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

  // SEA PROVINCE VIEW
  if (province.isSea) {
    return (
      <aside aria-label="Seegebiet Details" className="fixed top-14 right-3 bottom-12 w-88 sm:w-96 z-40 imperial-panel rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="imperial-header p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Waves size={18} />
            </div>
            <div>
              <h2 className="font-royal font-bold text-cyan-300 text-sm md:text-base leading-none">
                {province.name || `Seegebiet #${province.id}`}
              </h2>
              <span className="text-[11px] text-slate-300 font-parchment italic mt-0.5 block">
                Internationale Schifffahrtsroute
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans-ui">
          <div className="p-3 rounded imperial-card border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400 font-royal font-bold text-xs uppercase mb-1">
              <Ship size={14} /> Schifffahrt & Seeherrschaft
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Dieses Gewässer verbindet wichtige europäische Handelshäfen. Kriegsschiffe können hier Seehandelsrouten sichern, Blockaden errichten oder Truppentransporte eskortieren.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
              <span className="font-bold text-emerald-400 font-mono mt-0.5 block">Offene See</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Seegefahr</span>
              <span className="font-bold text-amber-300 font-mono mt-0.5 block">Gering</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // LAND PROVINCE VIEW
  const isOwner = playerNation && province.owner === playerNation.tag;
  const ownerNation = province.owner && nations[province.owner] ? nations[province.owner] : null;
  const regionData = province.region && regions[province.region] ? regions[province.region] : null;
  const regionController = regionData?.controller && nations[regionData.controller] ? nations[regionData.controller] : null;

  // Active queue item for this province
  const activeBuild = constructionQueue.find(q => q.pid === province.id);

  // 17th Century Historical Buildings
  const BUILDINGS_INFO = [
    { key: 'farm', name: 'Gutshof & Fruchtkammer', icon: <Wheat size={15} className="text-amber-400" />, costBase: 120, daysBase: 60, desc: 'Steigert Kornertrag und Bevölkerungswachstum (+10%)' },
    { key: 'market', name: 'Kaufmannsmarkt & Zollhaus', icon: <Coins size={15} className="text-yellow-400" />, costBase: 160, daysBase: 75, desc: 'Erhöht Steuereinnahmen und Warenumschlag (+15%)' },
    { key: 'manufactory', name: 'Gewerbe & Werkmanufaktur', icon: <Pickaxe size={15} className="text-emerald-400" />, costBase: 280, daysBase: 90, desc: 'Produziert Tuch, Eisenwaren und Handelswaren' },
    { key: 'administration', name: 'Amts- & Rentkammer', icon: <Landmark size={15} className="text-indigo-400" />, costBase: 200, daysBase: 80, desc: 'Senkt Korruption und sichert die landesherrlichen Steuern' },
    { key: 'university', name: 'Gelehrtenakademie', icon: <BookOpen size={15} className="text-sky-400" />, costBase: 380, daysBase: 120, desc: 'Fördert Staatsphilosophie, Militärtheorie und Technik' },
    { key: 'barracks', name: 'Zeughaus & Garnison', icon: <Swords size={15} className="text-rose-400" />, costBase: 220, daysBase: 70, desc: 'Beschleunigt die Rekrutierung von Tercios und Musketieren' },
    { key: 'fortress', name: 'Bastion & Sternschanze', icon: <Shield size={15} className="text-slate-300" />, costBase: 340, daysBase: 100, desc: 'Widersteht langwierigen Belagerungen und Artilleriefeuer' },
    { key: 'port', name: 'Kriegs- & Handelshafen', icon: <Anchor size={15} className="text-cyan-400" />, costBase: 260, daysBase: 90, desc: 'Ermöglicht Bau von Galeonen und Seehandel' },
    { key: 'castle', name: 'Fürstliche Residenz', icon: <Castle size={15} className="text-purple-400" />, costBase: 500, daysBase: 150, desc: 'Steigert dynastisches Ansehen und Herrschaftsanspruch' }
  ];

  // 1618 Thirty Years' War Historical Military Units
  const MILITARY_UNITS_1618 = [
    {
      type: 'pike_and_shot',
      name: 'Pikeniere & Musketiere (Tercios)',
      icon: <Swords size={16} className="text-amber-400" />,
      cost: 150,
      manpower: 1000,
      days: 30,
      stats: 'Infantrie · Pikenwall & Luntenschlossfeuer · Hoch diszipliniert'
    },
    {
      type: 'cuirassier',
      name: 'Kürassiere (Schwere Reiterei)',
      icon: <Shield size={16} className="text-sky-400" />,
      cost: 250,
      manpower: 500,
      days: 45,
      stats: 'Kavallerie · Dreiviertelharnisch, Pistolen & Pallasch · Mächtiger Ansturm'
    },
    {
      type: 'harquebusier',
      name: 'Arkebusierreiter & Dragoner',
      icon: <Users size={16} className="text-emerald-400" />,
      cost: 180,
      manpower: 600,
      days: 35,
      stats: 'Leichte Kavallerie · Berittene Schützen für Flanken & Aufklärung'
    },
    {
      type: 'field_artillery',
      name: 'Kartaunen & Feldschlangen',
      icon: <Hammer size={16} className="text-rose-400" />,
      cost: 320,
      manpower: 250,
      days: 60,
      stats: 'Artillerie · Bronzekanonen zur Zermürbung von Schanzen & Karrees'
    }
  ];

  // 17th Century Subsidies
  const SUBSIDIES_INFO = [
    {
      key: 'grain',
      name: 'Kornkammervorrat & Getreidestütze',
      icon: <Wheat size={16} className="text-amber-400" />,
      cost: 20,
      effect: '+15% Bevölkerungswachstum & Schutz vor Hungersnöten'
    },
    {
      key: 'guilds',
      name: 'Gewerbe- & Zunftförderung',
      icon: <Pickaxe size={16} className="text-emerald-400" />,
      cost: 35,
      effect: '+20% Manufakturertrag & Produktion von Luxusgütern'
    },
    {
      key: 'trade',
      name: 'Handelsgilden & Messeprivilegien',
      icon: <Coins size={16} className="text-yellow-400" />,
      cost: 25,
      effect: '+25% lokales Handelsvolumen & Zollerträge'
    },
    {
      key: 'garrison',
      name: 'Garnisonsbesoldung & Wachtdienst',
      icon: <Shield size={16} className="text-rose-400" />,
      cost: 30,
      effect: '+25% Festungsverteidigung & Erhalt der öffentlichen Ordnung'
    }
  ];

  return (
    <aside aria-label="Provinzdetails" className="fixed top-14 right-3 bottom-12 w-88 sm:w-96 z-40 imperial-panel rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="imperial-header p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {ownerNation?.flag && (
            <img
              src={ownerNation.flag}
              alt="Flagge"
              className="w-7 h-4.5 object-cover rounded shadow border border-amber-400/50"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          )}
          <div>
            <h2 className="font-royal font-bold text-amber-300 text-sm md:text-base leading-none">
              {province.name}
            </h2>
            <span className="text-[11px] text-slate-300 font-parchment italic mt-0.5 block">
              {ownerNation ? ownerNation.name : 'Neutrales Territorium'} · {regionData ? regionData.name : 'Region'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
          title="Schließen"
        >
          <X size={16} />
        </button>
      </div>

      {/* Regional Bonus Banner */}
      {regionData && (
        <div className={`px-3 py-1 text-[11px] flex items-center justify-between border-b ${
          regionController?.tag === playerNation?.tag
            ? 'bg-amber-950/50 border-amber-500/30 text-amber-300 font-semibold'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <span>Region {regionData.name}</span>
          <span className="font-mono text-[10px]">
            {regionController
              ? `100% Kontrolle ★ Boni aktiv`
              : `${regionData.controlBreakdown?.[playerNation?.tag || ''] || 0}% Eigene Kontrolle`}
          </span>
        </div>
      )}

      {/* Province Overview Stats Grid */}
      <div className="p-3 bg-slate-950/80 border-b border-amber-500/20 grid grid-cols-3 gap-2 text-center text-xs font-sans-ui">
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 shadow-inner">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Users size={11} /> Bevölkerung
          </div>
          <div className="font-bold text-slate-100 font-mono text-xs mt-0.5">
            {province.population.toLocaleString('de-DE')}
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 shadow-inner">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Shield size={11} /> Festung
          </div>
          <div className="font-bold text-rose-300 font-mono text-xs mt-0.5">
            +{province.defense}%
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 shadow-inner">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Coins size={11} /> Handelsgut
          </div>
          <div className="font-bold text-amber-300 capitalize text-xs mt-0.5 truncate">
            {province.resource || 'Getreide'}
          </div>
        </div>
      </div>

      {/* Active Construction Alert */}
      {activeBuild && (
        <div className="px-3 py-2 bg-amber-950/60 border-b border-amber-500/40 text-xs">
          <div className="flex items-center justify-between text-amber-200 font-royal font-bold">
            <span className="flex items-center gap-1.5">
              <Hammer size={13} className="text-amber-400 animate-spin-slow" />
              Bau: {activeBuild.buildingType} (Stufe {activeBuild.targetLevel})
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              {activeBuild.progressDays} / {activeBuild.totalDays} Tage
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-amber-500/30">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (activeBuild.progressDays / activeBuild.totalDays) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-amber-500/30 bg-slate-950 text-xs font-royal">
        {[
          { id: 'buildings', name: 'Bauwerke', icon: <Hammer size={12} /> },
          { id: 'subsidies', name: 'Subventionen', icon: <TrendingUp size={12} /> },
          { id: 'military', name: 'Rekrutierung (1618)', icon: <Swords size={12} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition text-[11px] ${
              activeTab === tab.id
                ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
        {/* BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div className="space-y-2">
            {!isOwner && (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>Diese Provinz gehört einem fremden Herrscherhaus. Ausbau ist nur in eigenen Ländern möglich.</span>
              </div>
            )}

            {BUILDINGS_INFO.map((b) => {
              const currentLvl = (province.buildings && province.buildings[b.key]) || 0;
              const cost = Math.round(b.costBase * (1 + currentLvl * 0.45));
              const days = Math.round(b.daysBase * (1 + currentLvl * 0.3));
              const isUnderBuild = activeBuild?.buildingType === b.key;
              const canAfford = playerNation ? playerNation.treasury >= cost : false;

              return (
                <div
                  key={b.key}
                  className="p-2.5 rounded imperial-card flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-slate-950 border border-amber-500/30 shrink-0 mt-0.5">
                      {b.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-royal font-bold text-slate-100 text-xs">
                          {b.name}
                        </span>
                        {currentLvl > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 font-mono">
                            Stufe {currentLvl}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans-ui mt-0.5">
                        {b.desc}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="shrink-0">
                      {isUnderBuild ? (
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                          Im Bau...
                        </span>
                      ) : (
                        <button
                          onClick={() => onStartBuild(province.id, b.key)}
                          disabled={!canAfford || !!activeBuild}
                          className="px-2.5 py-1 rounded imperial-btn text-[11px] font-bold disabled:opacity-40 disabled:hover:scale-100"
                          title={!canAfford ? 'Nicht genügend Goldtaler im Staatsschatz' : `${cost} ₳, ${days} Tage`}
                        >
                          {currentLvl > 0 ? 'Ausbauen' : 'Bauen'} ({cost} ₳)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUBSIDIES TAB (Fully Interactive!) */}
        {activeTab === 'subsidies' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-parchment italic px-1">
              Investiere landesherrliche Mittel, um die Provinzwirtschaft zu stärken. Subventionen werden monatlich aus dem Staatsschatz bezahlt.
            </p>

            {SUBSIDIES_INFO.map((sub) => {
              const isSubsidized = province.subsidies && province.subsidies[sub.key];

              return (
                <div
                  key={sub.key}
                  className={`p-2.5 rounded imperial-card flex items-center justify-between gap-3 text-xs transition ${
                    isSubsidized ? 'border-amber-400/50 bg-amber-950/20 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-slate-950 border border-amber-500/30 shrink-0 mt-0.5">
                      {sub.icon}
                    </div>
                    <div>
                      <div className="font-royal font-bold text-slate-100 text-xs">
                        {sub.name}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans-ui mt-0.5">
                        {sub.effect}
                      </p>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block mt-1">
                        Kosten: {sub.cost} ₳ / Monat
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => onToggleSubsidy(province.id, sub.key)}
                      className={`px-3 py-1.5 rounded text-xs font-royal font-bold transition shadow ${
                        isSubsidized
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                          : 'imperial-btn text-slate-300 hover:text-amber-200'
                      }`}
                    >
                      {isSubsidized ? 'Aktiviert ✓' : 'Aktivieren'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MILITARY TAB (1618 Thirty Years' War Historical Units) */}
        {activeTab === 'military' && (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded bg-slate-950/80 border border-amber-500/30">
              <span className="font-royal font-bold text-amber-300 text-xs block mb-1">
                Kriegswesen im Dreißigjährigen Krieg (1618)
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans-ui">
                Söldnerregimenter und Landsknechte prägen die Schlachtfelder Europas. Rekrutierte Verbände sammeln sich in dieser Provinz.
              </p>
            </div>

            {MILITARY_UNITS_1618.map((unit) => {
              const canAfford = playerNation ? playerNation.treasury >= unit.cost : false;

              return (
                <div
                  key={unit.type}
                  className="p-2.5 rounded imperial-card flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-slate-950 border border-amber-500/30 text-amber-400">
                        {unit.icon}
                      </div>
                      <div>
                        <span className="font-royal font-bold text-slate-100 text-xs">
                          {unit.name}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans-ui">
                          Stärke: {unit.manpower.toLocaleString('de-DE')} Mann · Aushebung: {unit.days} Tage
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => onRecruitUnit(province.id, unit.type)}
                        disabled={!canAfford}
                        className="px-3 py-1 rounded imperial-btn text-xs font-bold shrink-0 disabled:opacity-40"
                        title={!canAfford ? 'Nicht genügend Goldtaler' : 'Regiment aufstellen'}
                      >
                        Aufstellen ({unit.cost} ₳)
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 italic bg-slate-950/60 p-1.5 rounded border border-slate-800">
                    {unit.stats}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
