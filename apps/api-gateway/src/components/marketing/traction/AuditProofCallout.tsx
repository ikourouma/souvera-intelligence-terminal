'use client';

import { CheckCircle2 } from 'lucide-react';

const PROOF_ITEMS = [
  { value: '592', label: 'Supply-Demand Matrix cells (74×8)' },
  { value: '416', label: 'AfCETA corridor signals' },
  { value: '74/74', label: 'Trade snapshot audit PASS' },
];

export function AuditProofCallout() {
  return (
    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-sm">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-400 mb-2">Governed trade intelligence coverage</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
            {PROOF_ITEMS.map((item) => (
              <div key={item.label}>
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-zinc-500">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Dual-source reconciliation and petroleum exclusion transparency across trade intelligence modules.
          </p>
        </div>
      </div>
    </div>
  );
}
