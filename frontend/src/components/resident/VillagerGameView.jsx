import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { SimpleRequestModal } from '../community/SimpleRequestModal';
import { RewardCelebrationModal } from './RewardCelebrationModal';
import { VillageMap } from '../map/VillageMap';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import {
  Trophy,
  Award,
  Sparkles,
  Coins,
  MapPin,
  AlertTriangle,
  Send,
  CheckCircle2,
  HardHat,
  Gamepad2,
  ChevronRight,
  Shield,
  Layers,
  Flame,
  Star,
  Compass,
} from 'lucide-react';

const VILLAGE_BOUNTIES = [
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
    title: 'Water Tap & Well Accessibility Audit',
    location: 'Far Hamlet (Node N5)',
    description: 'Verify if households have to walk more than 150m for safe drinking water during peak hours.',
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
    title: 'Monsoon Drainage Stagnation Check',
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
    title: 'Propose New Solar / Civic Amenity',
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

export function VillagerGameView() {
  const {
    activeVillage,
    village,
    boundary,
    baselineMetrics,
    reportedProblems,
    reportProblem,
    setAppMode,
    playerProfile,
    activeRewardModal,
    setActiveRewardModal,
    setSelectedMapPoint,
    setFocusedLocation,
  } = useVillage();

  const [activeTab, setActiveTab] = useState('bounties'); // 'bounties' | 'map' | 'hall_of_fame'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);

  const handleStartBounty = (bounty) => {
    setSelectedBounty(bounty);
    if (bounty.coords) {
      setSelectedMapPoint({ lat: bounty.coords[0], lon: bounty.coords[1] });
      setFocusedLocation(bounty.coords);
    }
    setIsReportModalOpen(true);
  };

  const xpPercent = Math.min(
    100,
    Math.round(((playerProfile?.xp || 0) / (playerProfile?.xpToNextLevel || 500)) * 100)
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#080c14] text-slate-100 font-sans flex flex-col">
      {/* Top Gamified Player HUD */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-[#0d1424] via-[#10192e] to-[#0d1424] px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Avatar & Level Progress */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b1220] rounded-[14px] flex items-center justify-center text-amber-400">
                  <Gamepad2 className="w-7 h-7" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] font-mono shadow-md">
                LVL {playerProfile?.level || 1}
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-white text-base tracking-wide">
                  {playerProfile?.name || 'Village Resident'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  {activeVillage.name} Guardian
                </span>
              </div>

              {/* XP Bar */}
              <div className="mt-1.5 flex items-center space-x-3">
                <div className="w-36 sm:w-48 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {playerProfile?.xp || 0} / {playerProfile?.xpToNextLevel || 500} XP
                </span>
              </div>
            </div>
          </div>

          {/* Player Currencies & Badges */}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            {/* Karma Coins */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-[#131d2e] border border-amber-500/30 text-amber-300 shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Village Karma</div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {playerProfile?.coins || 0} pts
                </div>
              </div>
            </div>

            {/* Badges Count */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-[#131d2e] border border-purple-500/30 text-purple-300 shadow-sm">
              <Award className="w-4 h-4 text-purple-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Badges Earned</div>
                <div className="text-sm font-black text-purple-300 font-mono">
                  {playerProfile?.badges?.length || 0}
                </div>
              </div>
            </div>

            {/* Quick Action: Report Issue */}
            <button
              onClick={() => {
                setSelectedBounty(null);
                setIsReportModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Report Issue (+XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="border-b border-slate-800/80 bg-[#0c121e]/80 px-4 sm:px-8 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('bounties')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bounties'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Village Quests & Bounties</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Drone Map</span>
            </button>

            <button
              onClick={() => setActiveTab('hall_of_fame')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hall_of_fame'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Community Impact Feed</span>
            </button>
          </div>

          <button
            onClick={() => setAppMode('planning')}
            className="hidden sm:flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono"
          >
            <span>Switch to Planning Suite</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        {activeTab === 'bounties' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <span>Active Village Citizen Quests</span>
                  <span className="text-xs font-mono font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Earn Rewards & Impact Real Planning
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Complete bounties by reporting real road, water, and drainage conditions. The Panchayat Planning Professional mode directly pulls your verified findings!
                </p>
              </div>
            </div>

            {/* Bounty Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VILLAGE_BOUNTIES.map((bounty) => (
                <div
                  key={bounty.id}
                  className="p-5 rounded-3xl bg-[#0f1726] border-2 border-slate-800/80 hover:border-amber-400/60 hover:bg-[#131d2e] transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#182338] border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                          {bounty.badgeIcon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {bounty.title}
                          </h4>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-0.5">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>{bounty.location}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        {bounty.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {bounty.description}
                    </p>
                  </div>

                  {/* Rewards Row & Start Button */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                        +{bounty.rewardXP} XP
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        +{bounty.rewardCoins} Karma
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartBounty(bounty)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Complete Quest</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Showcase */}
            <div className="p-5 rounded-3xl bg-[#0e1624] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Your Unlocked Citizen Badges</span>
              </h4>

              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                {playerProfile?.badges?.map((badge, idx) => (
                  <div
                    key={badge.id || idx}
                    className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-2xl bg-[#131d2e] border border-purple-500/30"
                  >
                    <span className="text-xl">{badge.icon || '🏅'}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{badge.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2D Drone Map View for Residents */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>
                Click any spot on the drone map to geotag an infrastructure issue or missing facility.
              </p>
              <span className="font-mono text-cyan-400">{activeVillage.name} Cadastral Grid</span>
            </div>

            <div className="h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <VillageMap
                village={village}
                boundary={boundary}
                baselineMetrics={baselineMetrics}
                reportedProblems={reportedProblems}
                height="100%"
                interactive={true}
                pickLocationMode="problem"
                onPickLocation={(coords) => {
                  setSelectedMapPoint(coords);
                  setIsReportModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Community Impact Feed */}
        {activeTab === 'hall_of_fame' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Community Issues & Planning Status</h3>
              <p className="text-xs text-slate-400">
                Track how citizen reports are picked up by the Panchayat planning team into active budget allocations.
              </p>
            </div>

            <div className="space-y-3">
              {reportedProblems.map((prob) => {
                const catObj =
                  PROBLEM_CATEGORIES.find((c) => c.id === prob.category) || PROBLEM_CATEGORIES[0];
                const isResolved = prob.status === 'resolved';

                return (
                  <div
                    key={prob.id}
                    className="p-4 rounded-2xl bg-[#0e1624] border border-slate-800 flex items-start space-x-3.5 shadow-md"
                  >
                    <div className="text-2xl flex-shrink-0 mt-0.5">{catObj.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white truncate">{prob.title}</h4>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isResolved ? '✓ Fixed' : 'Pending In Planning Queue'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                        {prob.description}
                      </p>

                      <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center space-x-3">
                        <span>Reported by: {prob.reportedBy}</span>
                        <span>·</span>
                        <span>{prob.createdAt}</span>
                        {prob.linkedIntervention && (
                          <>
                            <span>·</span>
                            <span className="text-cyan-400 font-bold">
                              Linked Plan: {prob.linkedIntervention.label} (₹{prob.linkedIntervention.cost_lakh}L)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gamified Report Modal */}
      <SimpleRequestModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedBounty(null);
        }}
        mode="problem"
        bountyContext={selectedBounty}
      />

      {/* Active Reward Celebration Modal */}
      <RewardCelebrationModal
        reward={activeRewardModal}
        onClose={() => setActiveRewardModal(null)}
      />
    </div>
  );
}
