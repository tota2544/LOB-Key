import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ============================================
// 🔑 TEACHER VERSION - ANSWER KEY
// All correct answers are displayed
// ============================================

// Constants
const PROJECT_LENGTH = 15840;
const MOB_DAYS = 14;
const MOB_COST = 25000;
const DEFAULT_BUFFER = 5;
const INDIRECT_RATE = 0.30;
const PROFIT_RATE = 0.05;
const TARGET_DAYS = 55;
const TARGET_COST = 550000;

const CREWS = {
  exc: { rate: 220, cost: 1600, name: 'Excavation' },
  pipe: { rate: 180, cost: 2500, name: 'Pipe Laying' },
  back: { rate: 250, cost: 2300, name: 'Backfill' },
};

const EQUIPMENT = {
  exc: [
    { name: 'Small Excavator', rate: 165, cost: 900 },
    { name: 'Standard Excavator', rate: 220, cost: 1200 },
    { name: 'Large Excavator', rate: 330, cost: 1800 },
  ],
  pipe: [
    { name: 'Standard Crane', rate: 180, cost: 1800 },
    { name: 'Heavy Crane', rate: 270, cost: 2800 },
  ],
  back: [
    { name: 'Small Backfill Set', rate: 180, cost: 1400 },
    { name: 'Standard Backfill Set', rate: 250, cost: 1800 },
    { name: 'Large Backfill Set', rate: 375, cost: 2600 },
  ],
};

export default function LOBGameTeacher() {
  const [round, setRound] = useState(0);
  const [name, setName] = useState('Teacher');
  const [r3Buffer, setR3Buffer] = useState(5);
  const [r4Eq, setR4Eq] = useState({ exc: 1, pipe: 0, back: 1 });
  const [r5Config, setR5Config] = useState({
    exc: { small: 0, standard: 1, large: 0 },
    pipe: { standard: 1, heavy: 0 },
    back: { small: 0, standard: 1, large: 0 },
  });
  const [r5Buffer, setR5Buffer] = useState(5);
  const [results, setResults] = useState({});

  // Correct durations
  const dur = useMemo(() => ({
    exc: Math.ceil(PROJECT_LENGTH / CREWS.exc.rate),
    pipe: Math.ceil(PROJECT_LENGTH / CREWS.pipe.rate),
    back: Math.ceil(PROJECT_LENGTH / CREWS.back.rate),
  }), []);

  // R1 correct schedule (2-day buffer between starts)
  const r1 = useMemo(() => {
    const excS = MOB_DAYS + 1, excE = excS + dur.exc - 1;
    const pipeS = excS + 2, pipeE = pipeS + dur.pipe - 1;
    const backS = pipeS + 2, backE = backS + dur.back - 1;
    return { excS, excE, pipeS, pipeE, backS, backE, end: Math.max(excE, pipeE, backE) };
  }, [dur]);

  // R2 correct schedule (LOB with 5-day buffer)
  const r2 = useMemo(() => {
    const excS = MOB_DAYS + 1, excE = excS + dur.exc - 1;
    const pipeS = excS + DEFAULT_BUFFER, pipeE = pipeS + dur.pipe - 1;
    const backS = pipeE + DEFAULT_BUFFER - dur.back + 1, backE = backS + dur.back - 1;
    return { excS, excE, pipeS, pipeE, backS, backE, end: Math.max(excE, pipeE, backE) };
  }, [dur]);

  // R2 correct budget
  const r2Cost = useMemo(() => {
    const excC = dur.exc * CREWS.exc.cost;
    const pipeC = dur.pipe * CREWS.pipe.cost;
    const backC = dur.back * CREWS.back.cost;
    const direct = MOB_COST + excC + pipeC + backC;
    const indirect = Math.round(direct * INDIRECT_RATE);
    const subtotal = direct + indirect;
    const profit = Math.round(subtotal * PROFIT_RATE);
    return { direct, indirect, subtotal, profit, total: subtotal + profit, excC, pipeC, backC };
  }, [dur]);

  // R3 schedule (variable buffer)
  const r3 = useMemo(() => {
    const excS = MOB_DAYS + 1, excE = excS + dur.exc - 1;
    const pipeS = excS + r3Buffer, pipeE = pipeS + dur.pipe - 1;
    const backS = pipeE + r3Buffer - dur.back + 1, backE = backS + dur.back - 1;
    return { excS, excE, pipeS, pipeE, backS, backE, end: Math.max(excE, pipeE, backE) };
  }, [dur, r3Buffer]);

  // R4 schedule
  const r4 = useMemo(() => {
    const exc = EQUIPMENT.exc[r4Eq.exc];
    const pipe = EQUIPMENT.pipe[r4Eq.pipe];
    const back = EQUIPMENT.back[r4Eq.back];
    const excDur = Math.ceil(PROJECT_LENGTH / exc.rate);
    const pipeDur = Math.ceil(PROJECT_LENGTH / pipe.rate);
    const backDur = Math.ceil(PROJECT_LENGTH / back.rate);
    const excS = MOB_DAYS + 1, excE = excS + excDur - 1;
    let pipeS = pipe.rate < exc.rate ? excS + DEFAULT_BUFFER : excE + DEFAULT_BUFFER - pipeDur + 1;
    const pipeE = pipeS + pipeDur - 1;
    let backS = back.rate < pipe.rate ? pipeS + DEFAULT_BUFFER : pipeE + DEFAULT_BUFFER - backDur + 1;
    const backE = backS + backDur - 1;
    return {
      excS, excE, excDur, excRate: exc.rate, excCost: exc.cost, excName: exc.name,
      pipeS, pipeE, pipeDur, pipeRate: pipe.rate, pipeCost: pipe.cost, pipeName: pipe.name,
      backS, backE, backDur, backRate: back.rate, backCost: back.cost, backName: back.name,
      end: Math.max(excE, pipeE, backE),
    };
  }, [r4Eq]);

  // R5 calculations
  const r5Calc = useMemo(() => {
    const excRate = r5Config.exc.small * EQUIPMENT.exc[0].rate + r5Config.exc.standard * EQUIPMENT.exc[1].rate + r5Config.exc.large * EQUIPMENT.exc[2].rate || 1;
    const excCost = r5Config.exc.small * EQUIPMENT.exc[0].cost + r5Config.exc.standard * EQUIPMENT.exc[1].cost + r5Config.exc.large * EQUIPMENT.exc[2].cost;
    const excCount = r5Config.exc.small + r5Config.exc.standard + r5Config.exc.large;
    const pipeRate = r5Config.pipe.standard * EQUIPMENT.pipe[0].rate + r5Config.pipe.heavy * EQUIPMENT.pipe[1].rate || 1;
    const pipeCost = r5Config.pipe.standard * EQUIPMENT.pipe[0].cost + r5Config.pipe.heavy * EQUIPMENT.pipe[1].cost;
    const pipeCount = r5Config.pipe.standard + r5Config.pipe.heavy;
    const backRate = r5Config.back.small * EQUIPMENT.back[0].rate + r5Config.back.standard * EQUIPMENT.back[1].rate + r5Config.back.large * EQUIPMENT.back[2].rate || 1;
    const backCost = r5Config.back.small * EQUIPMENT.back[0].cost + r5Config.back.standard * EQUIPMENT.back[1].cost + r5Config.back.large * EQUIPMENT.back[2].cost;
    const backCount = r5Config.back.small + r5Config.back.standard + r5Config.back.large;
    return {
      exc: { rate: excRate, cost: excCost, count: excCount },
      pipe: { rate: pipeRate, cost: pipeCost, count: pipeCount },
      back: { rate: backRate, cost: backCost, count: backCount },
    };
  }, [r5Config]);

  const r5 = useMemo(() => {
    const excDur = Math.ceil(PROJECT_LENGTH / r5Calc.exc.rate);
    const pipeDur = Math.ceil(PROJECT_LENGTH / r5Calc.pipe.rate);
    const backDur = Math.ceil(PROJECT_LENGTH / r5Calc.back.rate);
    const excS = MOB_DAYS + 1, excE = excS + excDur - 1;
    let pipeS = r5Calc.pipe.rate < r5Calc.exc.rate ? excS + r5Buffer : excE + r5Buffer - pipeDur + 1;
    const pipeE = pipeS + pipeDur - 1;
    let backS = r5Calc.back.rate < r5Calc.pipe.rate ? pipeS + r5Buffer : pipeE + r5Buffer - backDur + 1;
    const backE = backS + backDur - 1;
    return {
      excS, excE, excDur, excRate: r5Calc.exc.rate, excCost: r5Calc.exc.cost,
      pipeS, pipeE, pipeDur, pipeRate: r5Calc.pipe.rate, pipeCost: r5Calc.pipe.cost,
      backS, backE, backDur, backRate: r5Calc.back.rate, backCost: r5Calc.back.cost,
      end: Math.max(excE, pipeE, backE),
    };
  }, [r5Calc, r5Buffer]);

  const calcCost = (sch, useCustomCost = false) => {
    const excC = sch.excDur * (useCustomCost ? sch.excCost : CREWS.exc.cost);
    const pipeC = sch.pipeDur * (useCustomCost ? sch.pipeCost : CREWS.pipe.cost);
    const backC = sch.backDur * (useCustomCost ? sch.backCost : CREWS.back.cost);
    const direct = MOB_COST + excC + pipeC + backC;
    const indirect = Math.round(direct * INDIRECT_RATE);
    const subtotal = direct + indirect;
    const profit = Math.round(subtotal * PROFIT_RATE);
    return { direct, indirect, subtotal, profit, total: subtotal + profit, excC, pipeC, backC };
  };

  const r4Cost = useMemo(() => calcCost(r4, true), [r4]);
  const r5Cost = useMemo(() => calcCost(r5, true), [r5]);

  const genLOB = (schedules) => {
    const data = [];
    let maxDay = Math.max(...schedules.map(s => s.end || 0)) + 10;
    for (let d = 0; d <= maxDay; d += 2) {
      const pt = { day: d };
      schedules.forEach((s, i) => {
        ['exc', 'pipe', 'back'].forEach(type => {
          const start = s[`${type}S`], end = s[`${type}E`];
          if (start && end) {
            if (d >= start && d <= end) pt[`${type}${i}`] = ((d - start) / (end - start)) * PROJECT_LENGTH;
            else if (d > end) pt[`${type}${i}`] = PROJECT_LENGTH;
            else pt[`${type}${i}`] = 0;
          }
        });
      });
      data.push(pt);
    }
    return data;
  };

  const nextRound = () => {
    const res = { round };
    if (round === 1) { res.end = r1.end; }
    if (round === 2) { res.end = r2.end; res.cost = r2Cost.total; }
    if (round === 3) { res.end = r3.end; res.cost = r2Cost.total; res.buffer = r3Buffer; }
    if (round === 4) { res.end = r4.end; res.cost = r4Cost.total; }
    if (round === 5) { res.end = r5.end; res.cost = r5Cost.total; res.buffer = r5Buffer; res.pass = r5.end <= TARGET_DAYS && r5Cost.total <= TARGET_COST; }
    setResults(p => ({ ...p, [round]: res }));
    setRound(round + 1);
  };

  // Answer box style
  const AnswerBox = ({ value, label }) => (
    <div className="bg-green-100 border-2 border-green-500 px-3 py-1 rounded text-center font-bold text-green-800">
      {label && <span className="text-xs text-green-600 block">{label}</span>}
      {value}
    </div>
  );

  // ========== INTRO SCREEN ==========
  if (round === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center text-white mb-6">
            <h1 className="text-4xl font-bold">🔑 LOB GAME - TEACHER ANSWER KEY</h1>
            <p className="text-green-200">All correct answers are displayed</p>
          </div>

          <div className="bg-white rounded-xl p-5">
            <h2 className="text-xl font-bold text-green-900 border-b pb-2 mb-4">📋 PROJECT OVERVIEW</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-gray-500">Project</div>
                <div className="font-bold">College Station Water Pipeline</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-gray-500">Total Length</div>
                <div className="font-bold text-xl">{PROJECT_LENGTH.toLocaleString()} ft</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-gray-500">Mobilization</div>
                <div className="font-bold text-xl">{MOB_DAYS} days</div>
                <div className="text-xs text-gray-400">${MOB_COST.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-gray-500">Default Buffer</div>
                <div className="font-bold text-xl">{DEFAULT_BUFFER} days</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5">
            <h2 className="text-xl font-bold text-green-900 border-b pb-2 mb-4">👷 CREW DEFINITIONS</h2>
            <table className="w-full text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left">Crew</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2 text-right">Daily Cost</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right bg-yellow-100">Duration (Answer)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50 border-b">
                  <td className="px-3 py-2 font-bold text-blue-700">Crew A</td>
                  <td className="px-3 py-2">Excavation</td>
                  <td className="px-3 py-2 text-right">${CREWS.exc.cost.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{CREWS.exc.rate} ft/day</td>
                  <td className="px-3 py-2 text-right"><AnswerBox value={`${dur.exc} days`} /></td>
                </tr>
                <tr className="bg-green-50 border-b">
                  <td className="px-3 py-2 font-bold text-green-700">Crew B</td>
                  <td className="px-3 py-2">Pipe Laying</td>
                  <td className="px-3 py-2 text-right">${CREWS.pipe.cost.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{CREWS.pipe.rate} ft/day</td>
                  <td className="px-3 py-2 text-right"><AnswerBox value={`${dur.pipe} days`} /></td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="px-3 py-2 font-bold text-orange-700">Crew C</td>
                  <td className="px-3 py-2">Backfill</td>
                  <td className="px-3 py-2 text-right">${CREWS.back.cost.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{CREWS.back.rate} ft/day</td>
                  <td className="px-3 py-2 text-right"><AnswerBox value={`${dur.back} days`} /></td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
              <strong>Formula:</strong> Duration = {PROJECT_LENGTH.toLocaleString()} ÷ Rate (round up)
            </div>
          </div>

          <div className="bg-white rounded-xl p-5">
            <button
              onClick={() => setRound(1)}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700"
            >
              View Answer Key →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== SUMMARY SCREEN ==========
  if (round === 6) {
    const pass = results[5]?.pass;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-6xl">🔑</div>
            <h1 className="text-3xl font-bold text-green-900">Answer Key Complete</h1>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
            🔄 Start Over
          </button>
        </div>
      </div>
    );
  }

  // ========== GAME ROUNDS ==========
  const titles = { 1: 'Gantt Chart', 2: 'LOB Analysis', 3: 'Buffer Analysis', 4: 'Rate Analysis', 5: 'Optimization' };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-900 text-white py-2 px-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="font-bold text-yellow-300">🔑 TEACHER ANSWER KEY</span>
          <span className="font-bold">Round {round}: {titles[round]}</span>
          <div className="text-sm">🎯 ≤{TARGET_DAYS}d | 💰 ≤${TARGET_COST/1000}K</div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-2 flex gap-1">
          {[1,2,3,4,5].map(r => (
            <div key={r} className={`flex-1 h-2 rounded ${r < round ? 'bg-green-500' : r === round ? 'bg-green-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        
        {/* ===== ROUND 1: Answer Key ===== */}
        {round === 1 && (
          <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold">📋 Round 1: Gantt Chart - ANSWER KEY</h3>
              <p className="text-sm text-gray-600">Formula: Duration = {PROJECT_LENGTH.toLocaleString()} ft ÷ Rate (round up)</p>
              <p className="text-sm text-gray-600">Use 2-day buffer between activity starts</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">✅ Correct Schedule</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 border">Phase</th>
                    <th className="px-2 py-2 border">Rate</th>
                    <th className="px-2 py-2 border bg-yellow-100">Duration ✓</th>
                    <th className="px-2 py-2 border bg-yellow-100">Start ✓</th>
                    <th className="px-2 py-2 border bg-yellow-100">End ✓</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="px-2 py-2 border">Mobilization</td>
                    <td className="px-2 py-2 border text-center">-</td>
                    <td className="px-2 py-2 border text-center">{MOB_DAYS}</td>
                    <td className="px-2 py-2 border text-center">1</td>
                    <td className="px-2 py-2 border text-center">{MOB_DAYS}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border text-blue-700 font-medium">Excavation (A)</td>
                    <td className="px-2 py-2 border text-center">{CREWS.exc.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.exc} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.excS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.excE} /></td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border text-green-700 font-medium">Pipe Laying (B)</td>
                    <td className="px-2 py-2 border text-center">{CREWS.pipe.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.pipe} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.pipeS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.pipeE} /></td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border text-orange-700 font-medium">Backfill (C)</td>
                    <td className="px-2 py-2 border text-center">{CREWS.back.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.back} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.backS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r1.backE} /></td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 p-3 bg-green-100 rounded text-center">
                <strong>Project End: <span className="text-2xl text-green-700">{r1.end} days</span></strong>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">📊 Gantt Chart</h3>
              <div className="mb-2 text-xs text-gray-500 ml-24">Duration (day)</div>
              <div className="space-y-2">
                {[
                  { name: 'Mobilization', s: 1, e: MOB_DAYS, c: 'bg-gray-400' },
                  { name: 'Excavation', s: r1.excS, e: r1.excE, c: 'bg-blue-500' },
                  { name: 'Pipe Laying', s: r1.pipeS, e: r1.pipeE, c: 'bg-green-500' },
                  { name: 'Backfill', s: r1.backS, e: r1.backE, c: 'bg-orange-500' },
                ].map((bar, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-24 text-xs text-right pr-2">{bar.name}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded relative">
                      <div
                        className={`absolute h-full ${bar.c} rounded text-white text-xs flex items-center justify-center`}
                        style={{ left: `${(bar.s / 120) * 100}%`, width: `${((bar.e - bar.s + 1) / 120) * 100}%` }}
                      >
                        {bar.s}-{bar.e}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 ml-24 mt-1">Duration (day)</div>
            </div>

            <button onClick={nextRound} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
              Next → Round 2
            </button>
          </>
        )}

        {/* ===== ROUND 2: Answer Key ===== */}
        {round === 2 && (
          <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold">📋 Round 2: LOB Analysis - ANSWER KEY</h3>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">Buffer Formulas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <strong>Simple Buffer</strong> (slower follows faster):<br/>
                  Start = Prev Start + Buffer<br/>
                  <span className="text-blue-700">Pipe: {r2.excS} + {DEFAULT_BUFFER} = {r2.pipeS}</span>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <strong>Delayed Buffer</strong> (faster follows slower):<br/>
                  Start = Prev End + Buffer - Duration + 1<br/>
                  <span className="text-orange-700">Back: {r2.pipeE} + {DEFAULT_BUFFER} - {dur.back} + 1 = {r2.backS}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">✅ Correct R2 Schedule ({DEFAULT_BUFFER}-day buffer)</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 border">Phase</th>
                    <th className="px-2 py-2 border">Rate</th>
                    <th className="px-2 py-2 border">Duration</th>
                    <th className="px-2 py-2 border bg-yellow-100">Start ✓</th>
                    <th className="px-2 py-2 border bg-yellow-100">End ✓</th>
                    <th className="px-2 py-2 border">Buffer Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-blue-700">
                    <td className="px-2 py-2 border font-medium">Excavation</td>
                    <td className="px-2 py-2 border text-center">{CREWS.exc.rate}</td>
                    <td className="px-2 py-2 border text-center">{dur.exc}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.excS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.excE} /></td>
                    <td className="px-2 py-2 border text-center">-</td>
                  </tr>
                  <tr className="text-green-700">
                    <td className="px-2 py-2 border font-medium">Pipe Laying</td>
                    <td className="px-2 py-2 border text-center">{CREWS.pipe.rate}</td>
                    <td className="px-2 py-2 border text-center">{dur.pipe}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.pipeS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.pipeE} /></td>
                    <td className="px-2 py-2 border text-center text-blue-600">Simple</td>
                  </tr>
                  <tr className="text-orange-700">
                    <td className="px-2 py-2 border font-medium">Backfill</td>
                    <td className="px-2 py-2 border text-center">{CREWS.back.rate}</td>
                    <td className="px-2 py-2 border text-center">{dur.back}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.backS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r2.backE} /></td>
                    <td className="px-2 py-2 border text-center text-orange-600">Delayed</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 p-3 bg-green-100 rounded text-center">
                <strong>Project End: <span className="text-2xl text-green-700">{r2.end} days</span></strong>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">LOB Chart</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={genLOB([r2])} margin={{ bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Duration (day)', position: 'bottom', offset: 0 }} />
                  <YAxis domain={[0, PROJECT_LENGTH]} tickFormatter={v => `${(v/1000).toFixed(0)}k`} label={{ value: 'Distance (ft)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="linear" dataKey="exc0" stroke="#2563eb" strokeWidth={2} name="Excavation" dot={false} />
                  <Line type="linear" dataKey="pipe0" stroke="#16a34a" strokeWidth={2} name="Pipe Laying" dot={false} />
                  <Line type="linear" dataKey="back0" stroke="#ea580c" strokeWidth={2} name="Backfill" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">✅ Correct Budget Calculation</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2">Direct Costs</h4>
                  <table className="w-full border">
                    <tbody>
                      <tr>
                        <td className="px-2 py-1 border">Mobilization</td>
                        <td className="px-2 py-1 border text-right">${MOB_COST.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border">Excavation ({dur.exc}d × ${CREWS.exc.cost})</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.excC.toLocaleString()}`} /></td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border">Pipe Laying ({dur.pipe}d × ${CREWS.pipe.cost})</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.pipeC.toLocaleString()}`} /></td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border">Backfill ({dur.back}d × ${CREWS.back.cost})</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.backC.toLocaleString()}`} /></td>
                      </tr>
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-2 py-1 border">Direct Total</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.direct.toLocaleString()}`} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Total Cost</h4>
                  <table className="w-full border">
                    <tbody>
                      <tr>
                        <td className="px-2 py-1 border">Direct Cost</td>
                        <td className="px-2 py-1 border text-right">${r2Cost.direct.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border">Indirect ({INDIRECT_RATE*100}%)</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.indirect.toLocaleString()}`} /></td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border">Profit ({PROFIT_RATE*100}%)</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.profit.toLocaleString()}`} /></td>
                      </tr>
                      <tr className="bg-green-100 font-bold text-lg">
                        <td className="px-2 py-1 border">TOTAL</td>
                        <td className="px-2 py-1 border text-right"><AnswerBox value={`$${r2Cost.total.toLocaleString()}`} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <button onClick={nextRound} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
              Next → Round 3
            </button>
          </>
        )}

        {/* ===== ROUND 3: Answer Key ===== */}
        {round === 3 && (
          <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold">📋 Round 3: Buffer Analysis - ANSWER KEY</h3>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">Buffer Slider (for demonstration)</h3>
              <div className="flex items-center gap-4">
                <span>Buffer:</span>
                <input type="range" min="1" max="15" value={r3Buffer} onChange={e => setR3Buffer(+e.target.value)} className="flex-1" />
                <span className="text-2xl font-bold text-green-600 w-12">{r3Buffer}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">✅ Correct R3 Schedule (Buffer = {r3Buffer} days)</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 border">Phase</th>
                    <th className="px-2 py-2 border">Rate</th>
                    <th className="px-2 py-2 border bg-yellow-100">Duration ✓</th>
                    <th className="px-2 py-2 border bg-yellow-100">Start ✓</th>
                    <th className="px-2 py-2 border bg-yellow-100">End ✓</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-blue-700">
                    <td className="px-2 py-2 border font-medium">Excavation</td>
                    <td className="px-2 py-2 border text-center">{CREWS.exc.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.exc} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.excS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.excE} /></td>
                  </tr>
                  <tr className="text-green-700">
                    <td className="px-2 py-2 border font-medium">Pipe Laying</td>
                    <td className="px-2 py-2 border text-center">{CREWS.pipe.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.pipe} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.pipeS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.pipeE} /></td>
                  </tr>
                  <tr className="text-orange-700">
                    <td className="px-2 py-2 border font-medium">Backfill</td>
                    <td className="px-2 py-2 border text-center">{CREWS.back.rate}</td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={dur.back} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.backS} /></td>
                    <td className="px-2 py-2 border text-center"><AnswerBox value={r3.backE} /></td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 p-3 bg-green-100 rounded text-center">
                <strong>Project End: <span className="text-2xl text-green-700">{r3.end} days</span></strong>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">LOB Comparison (R2 vs R3)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={genLOB([r2, r3])} margin={{ bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Duration (day)', position: 'bottom', offset: 0 }} />
                  <YAxis domain={[0, PROJECT_LENGTH]} tickFormatter={v => `${(v/1000).toFixed(0)}k`} label={{ value: 'Distance (ft)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="linear" dataKey="exc0" stroke="#2563eb" strokeWidth={1} strokeDasharray="5 5" name="Exc R2" dot={false} />
                  <Line type="linear" dataKey="pipe0" stroke="#16a34a" strokeWidth={1} strokeDasharray="5 5" name="Pipe R2" dot={false} />
                  <Line type="linear" dataKey="back0" stroke="#ea580c" strokeWidth={1} strokeDasharray="5 5" name="Back R2" dot={false} />
                  <Line type="linear" dataKey="exc1" stroke="#2563eb" strokeWidth={2} name="Exc R3" dot={false} />
                  <Line type="linear" dataKey="pipe1" stroke="#16a34a" strokeWidth={2} name="Pipe R3" dot={false} />
                  <Line type="linear" dataKey="back1" stroke="#ea580c" strokeWidth={2} name="Back R3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                💡 <strong>Key Learning:</strong> Buffer ↑ = Duration ↑, but Cost stays the same!
              </div>
            </div>

            <button onClick={nextRound} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
              Next → Round 4
            </button>
          </>
        )}

        {/* ===== ROUND 4: Answer Key ===== */}
        {round === 4 && (
          <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold">📋 Round 4: Rate Analysis - ANSWER KEY</h3>
              <p className="text-sm">Equipment selection affects rate and cost</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Equipment Selection</h3>
              <div className="grid grid-cols-3 gap-4">
                {['exc', 'pipe', 'back'].map((type) => (
                  <div key={type} className="border rounded p-3">
                    <h4 className={`font-bold mb-2 ${type === 'exc' ? 'text-blue-700' : type === 'pipe' ? 'text-green-700' : 'text-orange-700'}`}>
                      {type === 'exc' ? '🚜 Excavation' : type === 'pipe' ? '🏗️ Pipe Laying' : '🚧 Backfill'}
                    </h4>
                    {EQUIPMENT[type].map((eq, i) => (
                      <label key={i} className={`block p-2 rounded mb-1 cursor-pointer ${r4Eq[type] === i ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
                        <input type="radio" checked={r4Eq[type] === i} onChange={() => setR4Eq(p => ({...p, [type]: i}))} className="mr-2" />
                        <span className="font-medium">{eq.name}</span>
                        <div className="text-xs text-gray-600 ml-5">{eq.rate} ft/day | ${eq.cost}/day</div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">R4 Schedule</h3>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 border">Phase</th>
                    <th className="px-2 py-1 border">Equipment</th>
                    <th className="px-2 py-1 border">Rate</th>
                    <th className="px-2 py-1 border">Duration</th>
                    <th className="px-2 py-1 border">$/day</th>
                    <th className="px-2 py-1 border">Start</th>
                    <th className="px-2 py-1 border">End</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-blue-700">
                    <td className="px-2 py-1 border">Excavation</td>
                    <td className="px-2 py-1 border text-center">{r4.excName}</td>
                    <td className="px-2 py-1 border text-center">{r4.excRate}</td>
                    <td className="px-2 py-1 border text-center font-bold">{r4.excDur}</td>
                    <td className="px-2 py-1 border text-center">${r4.excCost}</td>
                    <td className="px-2 py-1 border text-center">{r4.excS}</td>
                    <td className="px-2 py-1 border text-center">{r4.excE}</td>
                  </tr>
                  <tr className="text-green-700">
                    <td className="px-2 py-1 border">Pipe Laying</td>
                    <td className="px-2 py-1 border text-center">{r4.pipeName}</td>
                    <td className="px-2 py-1 border text-center">{r4.pipeRate}</td>
                    <td className="px-2 py-1 border text-center font-bold">{r4.pipeDur}</td>
                    <td className="px-2 py-1 border text-center">${r4.pipeCost}</td>
                    <td className="px-2 py-1 border text-center">{r4.pipeS}</td>
                    <td className="px-2 py-1 border text-center">{r4.pipeE}</td>
                  </tr>
                  <tr className="text-orange-700">
                    <td className="px-2 py-1 border">Backfill</td>
                    <td className="px-2 py-1 border text-center">{r4.backName}</td>
                    <td className="px-2 py-1 border text-center">{r4.backRate}</td>
                    <td className="px-2 py-1 border text-center font-bold">{r4.backDur}</td>
                    <td className="px-2 py-1 border text-center">${r4.backCost}</td>
                    <td className="px-2 py-1 border text-center">{r4.backS}</td>
                    <td className="px-2 py-1 border text-center">{r4.backE}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-gray-600">Duration</div>
                  <div className="text-2xl font-bold text-green-600">{r4.end} days</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-gray-600">Total Cost</div>
                  <div className="text-2xl font-bold text-green-600">${r4Cost.total.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <button onClick={nextRound} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
              Next → Round 5
            </button>
          </>
        )}

        {/* ===== ROUND 5: Answer Key ===== */}
        {round === 5 && (
          <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-bold">📋 Round 5: Optimization - ANSWER KEY</h3>
              <p className="text-sm">Targets: ≤{TARGET_DAYS} days and ≤${TARGET_COST.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Equipment Configuration</h3>
              <div className="grid grid-cols-3 gap-4">
                {['exc', 'pipe', 'back'].map((type) => (
                  <div key={type} className={`border rounded p-3 ${type === 'exc' ? 'bg-blue-50' : type === 'pipe' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <h4 className={`font-bold mb-2 ${type === 'exc' ? 'text-blue-700' : type === 'pipe' ? 'text-green-700' : 'text-orange-700'}`}>
                      {type === 'exc' ? '🚜 Excavation' : type === 'pipe' ? '🏗️ Pipe Laying' : '🚧 Backfill'}
                    </h4>
                    {Object.keys(r5Config[type]).map((key) => {
                      const eqIndex = type === 'pipe' ? (key === 'standard' ? 0 : 1) : (key === 'small' ? 0 : key === 'standard' ? 1 : 2);
                      const eq = EQUIPMENT[type][eqIndex];
                      return (
                        <div key={key} className="flex items-center justify-between bg-white p-2 rounded mb-1">
                          <div>
                            <div className="text-sm font-medium">{eq.name}</div>
                            <div className="text-xs text-gray-500">{eq.rate} ft/d | ${eq.cost}/d</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setR5Config(p => ({...p, [type]: {...p[type], [key]: Math.max(0, p[type][key] - 1)}}))} className="w-6 h-6 bg-gray-200 rounded">-</button>
                            <span className="w-6 text-center font-bold">{r5Config[type][key]}</span>
                            <button onClick={() => setR5Config(p => ({...p, [type]: {...p[type], [key]: p[type][key] + 1}}))} className="w-6 h-6 bg-green-200 rounded">+</button>
                          </div>
                        </div>
                      );
                    })}
                    <div className={`mt-2 p-2 rounded text-sm ${type === 'exc' ? 'bg-blue-100' : type === 'pipe' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <strong>Total:</strong> {r5Calc[type].count} units | {r5Calc[type].rate} ft/d | ${r5Calc[type].cost}/d
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-purple-700">Buffer:</span>
                  <input type="range" min="1" max="10" value={r5Buffer} onChange={e => setR5Buffer(+e.target.value)} className="flex-1" />
                  <span className="text-2xl font-bold text-purple-600 w-12">{r5Buffer}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">Constraints Check</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${r5.end <= TARGET_DAYS ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                  <div className="text-gray-600">Duration</div>
                  <div className={`text-3xl font-bold ${r5.end <= TARGET_DAYS ? 'text-green-600' : 'text-red-600'}`}>{r5.end} days</div>
                  <div className="text-sm">Target: ≤{TARGET_DAYS} {r5.end <= TARGET_DAYS ? '✅' : '❌'}</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${r5Cost.total <= TARGET_COST ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                  <div className="text-gray-600">Total Cost</div>
                  <div className={`text-3xl font-bold ${r5Cost.total <= TARGET_COST ? 'text-green-600' : 'text-red-600'}`}>${(r5Cost.total/1000).toFixed(0)}K</div>
                  <div className="text-sm">Target: ≤${TARGET_COST/1000}K {r5Cost.total <= TARGET_COST ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>

            <button onClick={nextRound} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
              Finish 🏆
            </button>
          </>
        )}
      </div>
    </div>
  );
}
