'use client';

import { useRouter } from 'next/navigation';
import {
  User,
  Home,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/useAuth';
import { useOrderHistory } from '@/features/orders/useOrders';
import { AppShell } from '@/components/layout/AppShell';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface RowProps {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}

function Row({ icon, iconBgClass, label, subtitle, onClick, danger = false }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 text-left"
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${iconBgClass}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight ${
            danger ? 'text-red-600' : 'text-slate-800'
          }`}
        >
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Chevron or nothing for danger */}
      {!danger && <ChevronRight className="flex-shrink-0 w-4 h-4 text-slate-400" />}
    </button>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-1">
        {title}
      </p>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: orders } = useOrderHistory();

  const orderCount = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + o.totalAmount, 0) ?? 0;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      router.push('/login');
    } catch {
      // clearSession is called even on error inside useLogout
      router.push('/login');
    }
  };

  if (!user) {
    return (
      <AppShell activeTab="account">
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-slate-500">לא מחובר.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab="account">
      {/* Header section */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#1E3A5F] px-4 pt-12 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white text-2xl font-bold">
              {getInitials(user.firstName, user.lastName)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{user.companyName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-around bg-white/10 rounded-2xl py-3 px-2">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-bold text-lg tabular-nums">{orderCount}</span>
            <span className="text-slate-400 text-xs">הזמנות</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-bold text-lg tabular-nums">
              {formatCurrency(totalSpent)}
            </span>
            <span className="text-slate-400 text-xs">סה"כ רכישות</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-bold text-lg">
              {formatMemberSince(user.createdAt)}
            </span>
            <span className="text-slate-400 text-xs">חבר מאז</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 py-5 space-y-5">
        {/* Account section */}
        <Section title="חשבון">
          <Row
            icon={<User className="w-4 h-4 text-blue-600" />}
            iconBgClass="bg-blue-100"
            label={`${user.firstName} ${user.lastName}`}
            subtitle={user.companyName}
            onClick={() => {}}
          />
          <Row
            icon={<Home className="w-4 h-4 text-emerald-600" />}
            iconBgClass="bg-emerald-100"
            label="כתובת למשלוח"
            subtitle={user.companyName}
            onClick={() => {}}
          />
        </Section>

        {/* Orders section */}
        <Section title="הזמנות">
          <Row
            icon={<FileText className="w-4 h-4 text-indigo-600" />}
            iconBgClass="bg-indigo-100"
            label="היסטוריית הזמנות"
            subtitle={`${orderCount} הזמנות`}
            onClick={() => router.push('/orders')}
          />
        </Section>

        {/* Support section */}
        <Section title="תמיכה">
          <Row
            icon={<HelpCircle className="w-4 h-4 text-amber-600" />}
            iconBgClass="bg-amber-100"
            label="עזרה ותמיכה"
            subtitle="צור קשר עם מנהל חשבונך"
            onClick={() => {}}
          />
        </Section>

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Row
            icon={<LogOut className="w-4 h-4 text-red-500" />}
            iconBgClass="bg-red-100"
            label="יציאה"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>
    </AppShell>
  );
}
