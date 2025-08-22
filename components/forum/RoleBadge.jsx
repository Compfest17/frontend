'use client';

import { Shield, HardHat } from 'lucide-react';

export default function RoleBadge({ role }) {
  if (!role) return null;

  const roleConfig = {
    admin: {
      // label: 'Admin',
      className: 'bg-red-100 text-red-800 border-red-200',
      Icon: Shield
    },
    karyawan: {
      // label: 'Karyawan',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      Icon: HardHat
    }
  };

  const config = roleConfig[role.toLowerCase()];
  if (!config) return null;

  const { Icon } = config;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      <Icon size={14} strokeWidth={2} />
      {/* {config.label} */}
    </span>
  );
}

