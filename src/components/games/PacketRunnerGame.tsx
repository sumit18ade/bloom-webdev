'use client';

import React, { useState } from 'react';
import GameShell from './GameShell';

interface PacketRunnerGameProps {
  onClose: () => void;
}

export default function PacketRunnerGame({ onClose }: PacketRunnerGameProps) {
  const [selectedSubnet, setSelectedSubnet] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const subnets = [
    { cidr: '192.168.1.0/24', netmask: '255.255.255.0', hostCount: 254, isCorrect: true },
    { cidr: '192.168.1.0/16', netmask: '255.255.0.0', hostCount: 65534, isCorrect: false },
    { cidr: '192.168.1.0/28', netmask: '255.255.255.240', hostCount: 14, isCorrect: false }
  ];

  const ports = [
    { num: 80, protocol: 'HTTP', isCorrect: false },
    { num: 443, protocol: 'HTTPS (TLS)', isCorrect: true },
    { num: 21, protocol: 'FTP', isCorrect: false }
  ];

  const handleTransmit = (setScore: React.Dispatch<React.SetStateAction<number>>, onCompleteGame: (score: number, accuracy: number) => void) => {
    if (!selectedSubnet || !selectedPort) return;

    setIsTransmitting(true);
    const sub = subnets.find(s => s.cidr === selectedSubnet);
    const prt = ports.find(p => p.num === selectedPort);

    setTimeout(() => {
      setIsTransmitting(false);
      if (sub?.isCorrect && prt?.isCorrect) {
        setScore(100);
        setStatusText('✅ Packet Delivered! TLS encrypted socket stream successfully connected to 192.168.1.50:443.');
        setTimeout(() => {
          onCompleteGame(100, 100);
        }, 1500);
      } else {
        setStatusText('❌ Delivery Failed: Packet dropped due to incorrect CIDR boundary or unencrypted port protocol.');
      }
    }, 1000);
  };

  return (
    <GameShell
      gameId="packet-runner"
      title="Packet Runner: Network Subnetting & OSI Routing"
      subtitle="Route encrypted IP data packets across router nodes and configure CIDR subnets."
      difficulty="Intermediate"
      skill="Computer Networks & TCP/IP"
      instructions={[
        'Client endpoint requires 250 local host IPs in subnet `192.168.1.0`.',
        'Select the precise CIDR subnet mask to prevent IP address waste.',
        'Choose the secure TLS port to establish an encrypted socket pipeline.'
      ]}
      onClose={onClose}
    >
      {({ setScore, onCompleteGame }) => (
        <div className="space-y-6">
          {/* Visual Route Topography */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-sm">
            <div className="p-3 rounded-xl bg-slate-800 text-center border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Client Source</span>
              <span className="font-bold text-[#0A66FF]">192.168.1.10</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="h-0.5 flex-1 bg-slate-700 relative overflow-hidden">
                {isTransmitting && (
                  <div className="absolute inset-0 bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span className="px-2 py-1 rounded bg-purple-900/60 text-purple-300 text-[10px] border border-purple-700">
                Router R1
              </span>
              <div className="h-0.5 flex-1 bg-slate-700" />
            </div>

            <div className="p-3 rounded-xl bg-slate-800 text-center border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Destination Gateway</span>
              <span className="font-bold text-emerald-400">192.168.1.50</span>
            </div>
          </div>

          {/* Subnet Selection */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block">1. Select Target CIDR Subnet (/24 vs /16 vs /28)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {subnets.map(s => (
                <button
                  key={s.cidr}
                  onClick={() => setSelectedSubnet(s.cidr)}
                  className={`p-4 rounded-2xl border text-left transition-all ${selectedSubnet === s.cidr ? 'border-[#0A66FF] bg-blue-50 text-[#0A66FF] font-bold' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <span className="font-mono text-sm block font-bold text-slate-900">{s.cidr}</span>
                  <span className="text-slate-500 text-xs block font-mono">Netmask: {s.netmask}</span>
                  <span className="text-slate-400 text-[10px] font-mono">Hosts: {s.hostCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Port Selection */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase font-bold block">2. Select Transport Protocol Port</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ports.map(p => (
                <button
                  key={p.num}
                  onClick={() => setSelectedPort(p.num)}
                  className={`p-4 rounded-2xl border text-left transition-all ${selectedPort === p.num ? 'border-[#0A66FF] bg-blue-50 text-[#0A66FF] font-bold' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <span className="font-mono text-sm block font-bold text-slate-900">Port {p.num}</span>
                  <span className="text-slate-500 text-xs block font-mono">{p.protocol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {statusText && (
            <div className={`p-4 rounded-2xl text-xs font-mono ${statusText.includes('Delivered') ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              {statusText}
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleTransmit(setScore, onCompleteGame)}
              disabled={!selectedSubnet || !selectedPort || isTransmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0A66FF] hover:bg-[#0052DB] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              Transmit Packet Stream →
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
