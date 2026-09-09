import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import {
  X,
  Trophy,
  Award,
  Sparkles,
  Coins,
  MapPin,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Target,
} from 'lucide-react';

export const VILLAGE_BOUNTIES = [
  {
    id: 'bounty-road',
    category: 'road',
    title: 'Scout Damaged Road Corridor',
    location: 'East Corridor (Road E5)',
    description: 'Inspect potholes, waterlogging or unpaved mud tracks causing commute delays for students.',
    rewardXP: 180,
    rewardCoins: 60,
    badgeName: 'Road Sentinel',
    badgeIcon: '🛣️',
    coords: [30.3665, 76.3792],
    urgency: 'high',
  },
  {
    id: 'bounty-water',
    category: 'water',
    title: 'Water Tap & Well Audit',
    location: 'Far Hamlet (Node N5)',
    description: 'Verify if households walk more than 150m for safe drinking water during peak hours.',
    rewardXP: 200,
    rewardCoins: 75,
    badgeName: 'Hydro Sentinel',
    badgeIcon: '💧',
    coords: [30.3662, 76.3812],
    urgency: 'high',
  },
  {
    id: 'bounty-drainage',
    category: 'drainage',
    title: 'Monsoon Drainage Check',
    location: 'Zone A Village Core',
    description: 'Pinpoint open ditches or stormwater blockages that cause overflow near residential houses.',
    rewardXP: 160,
    rewardCoins: 55,
    badgeName: 'Drainage Warden',
    badgeIcon: '🌊',
    coords: [30.3708, 76.3755],
    urgency: 'medium',
  },
  {
    id: 'bounty-civic',
    category: 'other',
    title: 'Propose New Civic Amenity',
    location: 'Open Panchayat Ground',
    description: 'Suggest where the village needs a new solar microgrid, child health center or community well.',
    rewardXP: 140,
    rewardCoins: 50,
    badgeName: 'Civic Visionary',
    badgeIcon: '☀️',
    coords: [30.3685, 76.3745],
    urgency: 'low',
  },
];

export function CitizenQuestDrawer({ isOpen, onClose, onStartBounty }) {
  const {
    playerProfile,
    reportedProblems,
    activeVillage,
  } = useVillage();

  const [activeTab, setActiveTab] = useState('bounties'); // 'bounties' | 'impact' | 'badges'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-[480px] bg-[#0a0f19]/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 font-sans select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-[#0d1424] to-[#0a0f19]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white flex items-center space-x-2">
              <span>Citizen Quest Board</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Lvl {playerProfile?.level || 1}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Complete quests in the 3D twin to earn XP & Karma!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-slate-800 bg-[#0d1424]/60 flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('bounties')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bounties'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Active Quests</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'badges'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Badges ({playerProfile?.badges?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'impact'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Impact Feed</span>
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* TAB 1: BOUNTIES */}
        {activeTab === 'bounties' && (
          <div className="space-y-3">
            {VILLAGE_BOUNTIES.map((bounty) => (
              <div
                key={bounty.id}
                className="p-4 rounded-2xl bg-[#0e1624] border border-slate-800 hover:border-amber-500/50 hover:bg-[#131d2e] transition-all space-y-3 shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                      {bounty.badgeIcon}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {bounty.title}
                      </h4>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{bounty.location}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {bounty.urgency}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {bounty.description}
                </p>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      +{bounty.rewardXP} XP
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      +{bounty.rewardCoins} Karma
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onStartBounty(bounty);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                  >
                    <span>Inspect in 3D</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: BADGES */}
        {activeTab === 'badges' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Achievements earned by surveying and reporting real village conditions:
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {playerProfile?.badges?.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-[#0e1624] border border-purple-500/30 shadow-sm"
                >
                  <span className="text-3xl p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    {badge.icon}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-white">{badge.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: IMPACT FEED */}
        {activeTab === 'impact' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Status of reported issues submitted to the Panchayat Planning Suite:
            </div>
            {reportedProblems.map((prob) => {
              const catObj =
                PROBLEM_CATEGORIES.find((c) => c.id === prob.category) || PROBLEM_CATEGORIES[0];
              const isResolved = prob.status === 'resolved';

              return (
                <div
                  key={prob.id}
                  className="p-3.5 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{catObj.icon}</span>
                      <div>
                        <h5 className="font-bold text-xs text-white">{prob.title}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prob.reportedBy} · {prob.createdAt}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isResolved ? '✓ Fixed' : 'In Planning'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {prob.description}
                  </p>

                  {prob.linkedIntervention && (
                    <div className="text-[10px] text-cyan-400 font-mono font-bold pt-1 border-t border-slate-800/80">
                      Linked Plan: {prob.linkedIntervention.label} (₹{prob.linkedIntervention.cost_lakh}L)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
