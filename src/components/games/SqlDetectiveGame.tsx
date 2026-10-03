'use client';

import React, { useState } from 'react';
import GameShell from './GameShell';

interface SqlDetectiveGameProps {
  onClose: () => void;
}

const CASES = [
  {
    id: 1,
    title: 'Case #1: Unidentified System Intrusion',
    briefing: 'A suspicious API key was used at midnight to extract customer data. Find the suspect entry in `audit_logs` where `action = "DATA_EXPORT"` and `status = "FAILED"`.',
    tables: [
      {
        name: 'audit_logs',
        columns: ['log_id', 'user_id', 'action', 'ip_address', 'status'],
        rows: [
          ['101', 'usr_82', 'LOGIN', '192.168.1.5', 'SUCCESS'],
          ['102', 'suspect_7', 'DATA_EXPORT', '10.0.4.12', 'FAILED'],
          ['103', 'usr_14', 'UPDATE_PROFILE', '192.168.1.9', 'SUCCESS'],
          ['104', 'usr_02', 'DATA_EXPORT', '172.16.0.4', 'SUCCESS'],
        ]
      }
    ],
    checkSolution: (query: string) => {
      const q = query.toLowerCase();
      return q.includes('select') && q.includes('audit_logs') && q.includes('data_export') && q.includes('failed');
    },
    hint: 'Use `SELECT * FROM audit_logs WHERE action = "DATA_EXPORT" AND status = "FAILED";`'
  },
  {
    id: 2,
    title: 'Case #2: Foreign Key Payment Discrepancy',
    briefing: 'Join `transactions` with `users` to identify the username of the user who made a transaction greater than 50000.',
    tables: [
      {
        name: 'users',
        columns: ['user_id', 'username', 'email'],
        rows: [
          ['usr_1', 'alex_dev', 'alex@bloom.edu'],
          ['usr_7', 'shadow_hacker', 'shadow@darknet.org'],
          ['usr_9', 'priya_m', 'priya@tech.in'],
        ]
      },
      {
        name: 'transactions',
        columns: ['txn_id', 'user_id', 'amount', 'currency'],
        rows: [
          ['t_501', 'usr_1', '1200', 'INR'],
          ['t_502', 'usr_7', '95000', 'INR'],
          ['t_503', 'usr_9', '4500', 'INR'],
        ]
      }
    ],
    checkSolution: (query: string) => {
      const q = query.toLowerCase();
      return q.includes('join') && (q.includes('50000') || q.includes('95000')) && (q.includes('users') || q.includes('transactions'));
    },
    hint: 'Use `SELECT u.username, t.amount FROM users u JOIN transactions t ON u.user_id = t.user_id WHERE t.amount > 50000;`'
  }
];

export default function SqlDetectiveGame({ onClose }: SqlDetectiveGameProps) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [queryInput, setQueryInput] = useState('SELECT * FROM audit_logs WHERE action = "DATA_EXPORT";');
  const [outputResult, setOutputResult] = useState<{ type: 'success' | 'error'; message: string; rows?: string[][] } | null>(null);

  const activeCase = CASES[currentCaseIndex];

  const handleExecuteQuery = (setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    if (!queryInput.trim()) return;

    const isCorrect = activeCase.checkSolution(queryInput);

    if (isCorrect) {
      setScore(prev => prev + 50);
      setOutputResult({
        type: 'success',
        message: '✅ SQL Query Verified! Evidence extracted successfully.',
        rows: activeCase.tables[0].rows.filter(r => r.includes('DATA_EXPORT') || r.includes('95000') || r.includes('suspect_7'))
      });

      if (currentCaseIndex < CASES.length - 1) {
        setTimeout(() => {
          setCurrentCaseIndex(prev => prev + 1);
          setQueryInput('SELECT u.username, t.amount FROM users u JOIN transactions t ON u.user_id = t.user_id;');
          setOutputResult(null);
        }, 1500);
      } else {
        setTimeout(() => {
          onCompleteGame(100, 100);
        }, 1200);
      }
    } else {
      setOutputResult({
        type: 'error',
        message: '❌ Query Execution Warning: Filters or JOIN conditions do not match case briefing criteria.'
      });
    }
  };

  return (
    <GameShell
      gameId="sql-detective"
      title="SQL Detective: Cyber Crime Investigation"
      subtitle="Analyze relational database tables, execute SQL queries, and extract evidence."
      difficulty="Intermediate"
      skill="SQL & Relational Databases"
      instructions={[
        'Review the case briefing and database table schema.',
        'Write SELECT statements using WHERE, JOIN, and GROUP BY clauses.',
        'Execute query to solve the cyber security investigation case.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Briefing Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="font-bold text-[#0A66FF] uppercase">{activeCase.title}</span>
              <span className="text-slate-400">Case {currentCaseIndex + 1} of {CASES.length}</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">{activeCase.briefing}</p>
          </div>

          {/* Table Schemas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCase.tables.map(table => (
              <div key={table.name} className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Table: {table.name}</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 font-mono text-[10px] text-slate-500">
                        {table.columns.map(c => (
                          <th key={c} className="py-1 px-2">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 font-mono text-[11px] text-slate-700 hover:bg-slate-50">
                          {row.map((val, cellIdx) => (
                            <td key={cellIdx} className="py-1 px-2">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* SQL Editor */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block">SQL Query Console</label>
            <textarea
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs outline-none h-28 focus:ring-2 focus:ring-[#0A66FF]"
              placeholder="Write SQL query here..."
            />
          </div>

          {/* Output Display */}
          {outputResult && (
            <div className={`p-4 rounded-2xl text-xs font-mono space-y-2 ${outputResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              <div>{outputResult.message}</div>
              {outputResult.rows && (
                <div className="pt-2 border-t border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">Returned Dataset:</span>
                  <div className="space-y-1">
                    {outputResult.rows.map((r, i) => (
                      <div key={i} className="text-[11px] font-bold text-emerald-950">
                        {r.join(' | ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => alert(`💡 Hint: ${activeCase.hint}`)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            >
              💡 Need Hint?
            </button>
            <button
              onClick={() => handleExecuteQuery(setScore, onCompleteGame)}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all"
            >
              Execute SQL Query →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
