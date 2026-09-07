import React, { useState } from 'react';
import {
  X,
  Sun,
  BatteryCharging,
  Fuel,
  TrendingUp,
  DollarSign,
  Leaf,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  RotateCcw,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';

export function SolarSDGModal({ isOpen, onClose }) {
  // Case Study Baseline Parameters (pre-filled with exact slide defaults)
  const [dailyKwh, setDailyKwh] = useState(50); // 50 kWh/day
  const [batteryStorageKwh, setBatteryStorageKwh] = useState(25); // 25 kWh nighttime storage
  const [dieselPerKwh, setDieselPerKwh] = useState(0.4); // 0.4 Liters / kWh
  const [dieselPricePerLiter, setDieselPricePerLiter] = useState(125); // ₹125 / Liter
  const [panelWattage, setPanelWattage] = useState(400); // 400W Monocrystalline
  const [peakSunHours, setPeakSunHours] = useState(5.0); // 5.0 Peak Sun Hours
  const [costPerPanel, setCostPerPanel] = useState(18000); // ₹18,000 per panel
  const [costPerKwhBattery, setCostPerKwhBattery] = useState(12000); // ₹12,000 per kWh
  const [bosCost, setBosCost] = useState(75000); // Balance of System (Inverter, Structure, Cabling)

  // GHG Emissions Factors (from Slides 3 & 4)
  const co2PerLiter = 2.6; // kg CO2 / Liter
  const ch4PerLiter = 0.003; // kg CH4 / Liter
  const n2oPerLiter = 0.001; // kg N2O / Liter
  const gwpCh4 = 25; // Global Warming Potential of Methane
  const gwpN2o = 298; // Global Warming Potential of Nitrous Oxide

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'step1' | 'step2' | 'step3' | 'step4' | 'cashflow'

  if (!isOpen) return null;

  // ==========================================
  // MATHEMATICAL CALCULATIONS (Pre-Made)
  // ==========================================

  // Step 1: Solar Panels Needed
  const panelDailyOutputKwh = (panelWattage * peakSunHours) / 1000; // e.g. 400 * 5 / 1000 = 2.0 kWh/panel/day
  const panelsNeeded = Math.ceil(dailyKwh / panelDailyOutputKwh); // 50 / 2.0 = 25 panels
  const totalSystemCapkWp = (panelsNeeded * panelWattage) / 1000; // 25 * 400W = 10 kWp

  // Step 2: Daily Diesel Cost
  const dailyDieselLiters = dailyKwh * dieselPerKwh; // 50 * 0.4 = 20 Liters / day
  const dailyDieselCost = dailyDieselLiters * dieselPricePerLiter; // 20 * 125 = ₹2,500 / day
  const annualDieselLiters = dailyDieselLiters * 365; // 7,300 Liters / year
  const annualDieselCost = dailyDieselCost * 365; // ₹9,12,500 / year

  // Step 3: Total System Cost & Payback
  const totalPanelsCost = panelsNeeded * costPerPanel; // 25 * 18,000 = ₹4,50,000
  const totalBatteryCost = batteryStorageKwh * costPerKwhBattery; // 25 * 12,000 = ₹3,00,000
  const pureEquipmentCost = totalPanelsCost + totalBatteryCost; // ₹7,50,000
  const totalTurnkeyCost = pureEquipmentCost + bosCost; // ₹8,25,000
  
  // Payback period in days
  const paybackDaysPure = Math.round(pureEquipmentCost / dailyDieselCost); // 750,000 / 2,500 = 300 days
  const paybackDaysTurnkey = Math.round(totalTurnkeyCost / dailyDieselCost); // 825,000 / 2,500 = 330 days
  const paybackMonths = (paybackDaysPure / 30.416).toFixed(1);

  // Step 4 & 5: Annual Emissions Avoided
  const annualCo2Kg = annualDieselLiters * co2PerLiter; // 7,300 * 2.6 = 18,980 kg
  const annualCh4Kg = annualDieselLiters * ch4PerLiter; // 7,300 * 0.003 = 21.90 kg
  const annualN2oKg = annualDieselLiters * n2oPerLiter; // 7,300 * 0.001 = 7.30 kg

  // Step 6: Total GHG Reduction in CO2e
  const co2eFromCh4 = annualCh4Kg * gwpCh4; // 21.90 * 25 = 547.50 kg CO2e
  const co2eFromN2o = annualN2oKg * gwpN2o; // 7.30 * 298 = 2,175.40 kg CO2e
  const totalCo2eKg = annualCo2Kg + co2eFromCh4 + co2eFromN2o; // 21,702.90 kg CO2e
  const totalCo2eTons = totalCo2eKg / 1000; // 21.70 Metric Tons CO2e

  // Reset to default
  const handleReset = () => {
    setDailyKwh(50);
    setBatteryStorageKwh(25);
    setDieselPerKwh(0.4);
    setDieselPricePerLiter(125);
    setPanelWattage(400);
    setPeakSunHours(5.0);
    setCostPerPanel(18000);
    setCostPerKwhBattery(12000);
    setBosCost(75000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0b1220] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-emerald-500/20 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-glow flex-shrink-0">
              <Sun className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  SDG 7 · Affordable & Clean Energy
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  SDG 13 · Climate Action
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-wide mt-1 flex items-center space-x-2">
                <span>Solar Microgrid & Decarbonization Hub</span>
                <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">
                  (Sundarbans / GramVerse Pilot Case Study)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono flex items-center space-x-1"
              title="Reset to Case Study Slide Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/30 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 bg-[#0e1626] flex items-center space-x-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'summary', label: '📊 Executive Answers', icon: Award },
            { id: 'step1', label: '1. Solar Panels Needed', icon: Sun },
            { id: 'step2', label: '2. Daily Diesel Cost', icon: Fuel },
            { id: 'step3', label: '3. Upfront Capex & Payback', icon: DollarSign },
            { id: 'step4', label: '4. Emissions & CO₂e (GHGs)', icon: Leaf },
            { id: 'cashflow', label: '📈 10-Year Cashflow', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: EXECUTIVE ANSWERS (All 6 Questions Answered Directly) */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-gradient-to-br from-slate-900 via-[#0e1728] to-[#122038] p-4 sm:p-5 rounded-2xl border border-cyan-500/20 shadow-inner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400 font-bold flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>PRE-MADE CASE STUDY SOLUTION SUMMARY</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Sundarbans (WB) Microgrid: Transition from Diesel to Solar + Battery
                  </h3>
                  <p className="text-xs text-slate-300">
                    Baseline: Village requires <strong>50 kWh/day</strong> with <strong>25 kWh nighttime storage</strong>. Diesel consumes <strong>0.4 L/kWh</strong> @ <strong>₹125/L</strong>.
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-center flex-shrink-0">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Break-Even Period</span>
                  <span className="text-2xl font-black text-emerald-300 font-mono">{paybackDaysPure} Days</span>
                  <span className="text-[10px] text-emerald-400/80 block">({paybackMonths} months)</span>
                </div>
              </div>

              {/* 6 Key Question Cards Matching Presentation Slides */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Q1: Panels Needed */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30 hover:border-amber-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 1</span>
                    <Sun className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    How many solar panels must the village purchase to meet its total daily energy requirement?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{panelsNeeded}</span>
                    <span className="text-xs font-mono text-amber-300">Panels (400W each)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Total System: {totalSystemCapkWp} kWp (50 kWh ÷ 2.0 kWh/panel)
                  </p>
                </div>

                {/* Q2: Daily Diesel Cost */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-rose-500/30 hover:border-rose-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-rose-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 2</span>
                    <Fuel className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    What is the current daily cost of running the diesel generator?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">₹{dailyDieselCost.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-mono text-rose-300">per day</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    20 Liters/day × ₹125/L = ₹{(annualDieselCost / 100000).toFixed(2)} Lakhs/year
                  </p>
                </div>

                {/* Q3: Upfront Cost & Payback */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-cyan-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 3</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    What is the total upfront cost of the system, and how many days to break even?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white font-mono">₹{(pureEquipmentCost / 100000).toFixed(2)}L</span>
                    <span className="text-sm font-mono font-bold text-cyan-300">{paybackDaysPure} Days</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Panels: ₹4.50L + Battery: ₹3.00L ÷ ₹2,500/day
                  </p>
                </div>

                {/* Q4: Annual CO2 Saved */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 4</span>
                    <Leaf className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    How much CO₂ (in kilograms) will the village save annually (365 days)?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{annualCo2Kg.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-mono text-emerald-300">kg CO₂ / yr</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    52 kg/day × 365 days = {(annualCo2Kg / 1000).toFixed(2)} Metric Tons
                  </p>
                </div>

                {/* Q5: CO2, CH4, N2O Avoided */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-purple-500/30 hover:border-purple-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-purple-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 5</span>
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    Kilograms of CO₂, CH₄, and N₂O prevented annually (365 days)?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-white font-bold">
                      <span>CO₂:</span> <span>{annualCo2Kg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>CH₄ (Methane):</span> <span>{annualCh4Kg.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>N₂O (Nitrous Oxide):</span> <span>{annualN2oKg.toFixed(2)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Q6: Total CO2e Equivalent */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-teal-500/30 hover:border-teal-400 transition-all shadow-md">
                  <div className="flex items-center justify-between text-teal-400 text-xs font-mono font-bold mb-2">
                    <span>QUESTION 6</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug min-h-[32px]">
                    Total annual greenhouse gas reduction converted to CO₂ equivalent (CO₂e)?
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white font-mono">{totalCo2eKg.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
                    <span className="text-xs font-mono text-teal-300">kg CO₂e / yr</span>
                  </div>
                  <p className="text-[11px] text-teal-400 mt-1 font-mono font-bold">
                    = {totalCo2eTons.toFixed(2)} Metric Tons CO₂e
                  </p>
                </div>

              </div>

              {/* Action Banner to Explore Steps */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-cyan-200">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    Click any step tab above or below to examine formulas, adjust variables, or view the 10-year budget reallocation.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('step1')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono transition-all flex items-center space-x-1.5 flex-shrink-0 shadow-glow"
                >
                  <span>Begin Step-by-Step Walkthrough</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STEP 1 (Solar Panels Calculation) */}
          {activeTab === 'step1' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
                  <Sun className="w-4 h-4" />
                  <span>STEP 1: CALCULATE SOLAR PANELS NEEDED</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Divide daily energy requirement by energy produced per panel
                </h3>
                <div className="p-3 bg-[#0a0f19] rounded-xl font-mono text-xs text-amber-300 border border-slate-800">
                  Formula: Number of Panels = Total Daily Energy Requirement (kWh) ÷ Daily Energy per Panel (kWh)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Configuration Parameters</span>
                  </h4>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Village Daily Electricity Requirement: <strong className="text-white">{dailyKwh} kWh / day</strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={dailyKwh}
                      onChange={(e) => setDailyKwh(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Solar Panel Rating: <strong className="text-white">{panelWattage}W Monocrystalline</strong>
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[250, 330, 400, 550].map((w) => (
                        <button
                          key={w}
                          onClick={() => setPanelWattage(w)}
                          className={`py-1.5 rounded-lg font-mono font-bold transition-all ${
                            panelWattage === w
                              ? 'bg-amber-500 text-slate-950 shadow-glow'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {w}W
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Peak Sun Hours (Sundarbans Average): <strong className="text-white">{peakSunHours} hrs / day</strong>
                    </label>
                    <input
                      type="range"
                      min="3.5"
                      max="6.5"
                      step="0.1"
                      value={peakSunHours}
                      onChange={(e) => setPeakSunHours(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>

                {/* Calculation Output */}
                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Calculation Breakdown</span>
                    <div className="space-y-2 mt-3 text-xs font-mono">
                      <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                        <span>1 Panel Daily Generation:</span>
                        <span className="font-bold text-white">
                          {panelWattage}W × {peakSunHours}h = {panelDailyOutputKwh.toFixed(2)} kWh/day
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                        <span>Total Required Panels:</span>
                        <span className="font-bold text-white">
                          {dailyKwh} kWh ÷ {panelDailyOutputKwh.toFixed(2)} kWh = {(dailyKwh / panelDailyOutputKwh).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                        <span>Rounding up for system losses:</span>
                        <span className="font-bold text-amber-400 text-base">{panelsNeeded} Panels</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-amber-300 uppercase block font-bold">Answer to Question 1</span>
                    <span className="text-3xl font-black text-white font-mono">{panelsNeeded} Solar Panels</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Array Capacity: {totalSystemCapkWp} kWp ground-mounted solar farm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP 2 (Daily Diesel Cost) */}
          {activeTab === 'step2' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-bold">
                  <Fuel className="w-4 h-4" />
                  <span>STEP 2: CALCULATE CURRENT DAILY DIESEL EXPENDITURE</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Find diesel liters used per day, then multiply by cost per liter
                </h3>
                <div className="p-3 bg-[#0a0f19] rounded-xl font-mono text-xs text-rose-300 border border-slate-800">
                  Formula: Liters/Day = Daily kWh × Consumption Rate (L/kWh) | Daily Cost = Liters/Day × ₹/Liter
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Generator Fuel Parameters</h4>
                  
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Generator Fuel Consumption Rate: <strong className="text-white">{dieselPerKwh} L / kWh</strong>
                    </label>
                    <input
                      type="range"
                      min="0.25"
                      max="0.60"
                      step="0.05"
                      value={dieselPerKwh}
                      onChange={(e) => setDieselPerKwh(Number(e.target.value))}
                      className="w-full accent-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Cost of Diesel Fuel: <strong className="text-white">₹{dieselPricePerLiter} / Liter</strong>
                    </label>
                    <input
                      type="range"
                      min="90"
                      max="160"
                      step="1"
                      value={dieselPricePerLiter}
                      onChange={(e) => setDieselPricePerLiter(Number(e.target.value))}
                      className="w-full accent-rose-400"
                    />
                  </div>
                </div>

                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                      <span>Daily Diesel Burned:</span>
                      <span className="font-bold text-white">{dailyKwh} kWh × {dieselPerKwh} L/kWh = {dailyDieselLiters} Liters/day</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                      <span>Daily Fuel Expenditure:</span>
                      <span className="font-bold text-rose-400 text-sm">{dailyDieselLiters} L × ₹{dieselPricePerLiter} = ₹{dailyDieselCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                      <span>Annual Fuel Budget (365 Days):</span>
                      <span className="font-bold text-white">₹{annualDieselCost.toLocaleString('en-IN')} (₹{(annualDieselCost / 100000).toFixed(2)} Lakhs)</span>
                    </div>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-rose-300 uppercase block font-bold">Answer to Question 2</span>
                    <span className="text-3xl font-black text-white font-mono">₹{dailyDieselCost.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      ₹{(annualDieselCost / 100000).toFixed(2)} Lakhs recurring annual drain currently wasted on diesel
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STEP 3 (Capex & Payback Period) */}
          {activeTab === 'step3' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>STEP 3: TOTAL SYSTEM COST & PAYBACK PERIOD</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Add cost of panels and battery, then divide by daily diesel savings
                </h3>
                <div className="p-3 bg-[#0a0f19] rounded-xl font-mono text-xs text-cyan-300 border border-slate-800">
                  Formula: Total Upfront Cost = Cost(Panels) + Cost(Battery) | Payback Days = Total Cost ÷ Daily Fuel Savings
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">System Component Pricing</h4>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Cost per Solar Panel: <strong className="text-white">₹{costPerPanel.toLocaleString()}</strong>
                    </label>
                    <input
                      type="range"
                      min="12000"
                      max="25000"
                      step="500"
                      value={costPerPanel}
                      onChange={(e) => setCostPerPanel(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Battery Storage Required: <strong className="text-white">{batteryStorageKwh} kWh</strong>
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      step="5"
                      value={batteryStorageKwh}
                      onChange={(e) => setBatteryStorageKwh(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Battery Cost per kWh (LFP/Tubular): <strong className="text-white">₹{costPerKwhBattery.toLocaleString()} / kWh</strong>
                    </label>
                    <input
                      type="range"
                      min="8000"
                      max="18000"
                      step="500"
                      value={costPerKwhBattery}
                      onChange={(e) => setCostPerKwhBattery(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="bg-[#0e1626] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                      <span>Solar Panels ({panelsNeeded} × ₹{costPerPanel.toLocaleString()}):</span>
                      <span className="font-bold text-white">₹{totalPanelsCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                      <span>Battery Storage ({batteryStorageKwh} kWh × ₹{costPerKwhBattery.toLocaleString()}):</span>
                      <span className="font-bold text-white">₹{totalBatteryCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-cyan-300 font-bold">
                      <span>Total Equipment Upfront Cost:</span>
                      <span>₹{pureEquipmentCost.toLocaleString()} (₹{(pureEquipmentCost / 100000).toFixed(2)}L)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                      <span>Daily Fuel Savings:</span>
                      <span>₹{dailyDieselCost.toLocaleString()} / day</span>
                    </div>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-cyan-300 uppercase block font-bold">Answer to Question 3</span>
                    <div className="flex items-baseline justify-center space-x-3 mt-1">
                      <span className="text-2xl font-black text-white font-mono">₹{(pureEquipmentCost / 100000).toFixed(2)} Lakhs</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-3xl font-black text-cyan-300 font-mono">{paybackDaysPure} Days</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Break-even achieved in only <strong>{paybackMonths} months</strong>!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STEP 4 (Emissions & Multi-Gas GWP) */}
          {activeTab === 'step4' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
                  <Leaf className="w-4 h-4" />
                  <span>STEP 4 & MULTI-GAS GHGs: CO₂, CH₄, N₂O & CO₂e CONVERSION</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Environmental Impact using Global Warming Potential (GWP)
                </h3>
                <div className="p-3 bg-[#0a0f19] rounded-xl font-mono text-xs text-emerald-300 border border-slate-800">
                  Global Warming Potentials: CO₂ = 1 | CH₄ (Methane) = 25× | N₂O (Nitrous Oxide) = 298× CO₂
                </div>
              </div>

              {/* Grid of GHG Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                {/* CO2 */}
                <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold text-white">Carbon Dioxide (CO₂)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800">GWP: 1</span>
                  </div>
                  <div className="text-slate-400">
                    Emission Rate: <strong>{co2PerLiter} kg / L</strong>
                  </div>
                  <div className="text-slate-400">
                    Daily Saved: <strong>{(dailyDieselLiters * co2PerLiter).toFixed(1)} kg / day</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-emerald-400 font-bold text-sm">
                    Annual: {annualCo2Kg.toLocaleString()} kg CO₂
                  </div>
                </div>

                {/* CH4 */}
                <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-amber-400">
                    <span className="font-bold">Methane (CH₄)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">GWP: 25×</span>
                  </div>
                  <div className="text-slate-400">
                    Emission Rate: <strong>{ch4PerLiter} kg / L</strong>
                  </div>
                  <div className="text-slate-400">
                    Annual Prevented: <strong>{annualCh4Kg.toFixed(2)} kg CH₄</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-amber-300 font-bold text-sm">
                    CO₂e = {co2eFromCh4.toFixed(1)} kg CO₂e
                  </div>
                </div>

                {/* N2O */}
                <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-rose-400">
                    <span className="font-bold">Nitrous Oxide (N₂O)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">GWP: 298×</span>
                  </div>
                  <div className="text-slate-400">
                    Emission Rate: <strong>{n2oPerLiter} kg / L</strong>
                  </div>
                  <div className="text-slate-400">
                    Annual Prevented: <strong>{annualN2oKg.toFixed(2)} kg N₂O</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-rose-300 font-bold text-sm">
                    CO₂e = {co2eFromN2o.toFixed(1)} kg CO₂e
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-cyan-950/40 border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-teal-400 font-bold uppercase">Answer to Questions 4, 5, and 6</span>
                  <h4 className="text-base font-bold text-white">
                    Total Annual Greenhouse Gas Reduction: {totalCo2eKg.toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg CO₂e
                  </h4>
                  <p className="text-xs text-slate-300">
                    Equivalent to preventing <strong>{totalCo2eTons.toFixed(2)} Metric Tons</strong> of warming gases annually — equivalent to planting <strong>1,033 mature trees</strong>!
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 font-mono block">
                    {totalCo2eTons.toFixed(2)} Tons
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">CO₂e eliminated / year</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 10-YEAR CASHFLOW COMPARISON */}
          {activeTab === 'cashflow' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-bold">
                  <BarChart3 className="w-4 h-4" />
                  <span>10-YEAR CUMULATIVE BUDGET REALLOCATION (DIESEL VS SOLAR)</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Redirect Ongoing Fuel Budget toward Village Education and Healthcare
                </h3>
                <p className="text-xs text-slate-300">
                  The diesel generator burns ₹9.13 Lakhs every single year with zero equity. The solar + battery microgrid breaks even in Year 1, creating massive recurring surplus.
                </p>
              </div>

              {/* 10 Year Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0e1626]">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-[#111c30] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Year</th>
                      <th className="p-3">Cumulative Diesel Cost</th>
                      <th className="p-3">Cumulative Solar Cost</th>
                      <th className="p-3">Cumulative Net Savings</th>
                      <th className="p-3">Village Impact Reallocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[1, 2, 3, 5, 7, 10].map((yr) => {
                      const cumDiesel = yr * annualDieselCost;
                      const cumSolar = pureEquipmentCost + (yr > 1 ? (yr - 1) * 20000 : 0); // small maintenance
                      const netSavings = cumDiesel - cumSolar;
                      return (
                        <tr key={yr} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white">Year {yr}</td>
                          <td className="p-3 text-rose-400">₹{(cumDiesel / 100000).toFixed(2)} L</td>
                          <td className="p-3 text-cyan-400">₹{(cumSolar / 100000).toFixed(2)} L</td>
                          <td className="p-3 font-bold text-emerald-400">
                            {netSavings >= 0 ? `+₹${(netSavings / 100000).toFixed(2)} L` : `-₹${(Math.abs(netSavings) / 100000).toFixed(2)} L`}
                          </td>
                          <td className="p-3 text-slate-300 text-[11px]">
                            {yr === 1 && 'System Paid Off in Month 10'}
                            {yr === 2 && 'Funds Primary School Smart Classes'}
                            {yr === 3 && 'Funds Village Health Clinic Equipment'}
                            {yr === 5 && 'Funds 3 Additional Drinking Water Borewells'}
                            {yr === 7 && 'Solar Microgrid Expansion to Hamlet B'}
                            {yr === 10 && '₹83.75L Redeployed to Rural Education & Health'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1422] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">
            GramVerse AI · SDG Case Study Module · Built for SIH1704 & Rural Renewable Transitions
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-glow"
          >
            Close & Return to 3D Twin
          </button>
        </div>

      </div>
    </div>
  );
}
