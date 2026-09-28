'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

type ActiveTab = 'catalog' | 'cart' | 'orders' | 'account';

interface AppShellProps {
  children: ReactNode;
  activeTab?: ActiveTab;
}

function CatalogIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-slate-400'}`}
      fill={active ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      aria-hidden="true"
    >
      {active ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      )}
    </svg>
  );
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-slate-400'}`}
      fill={active ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      aria-hidden="true"
    >
      {active ? (
        <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      )}
    </svg>
  );
}

function OrdersIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-slate-400'}`}
      fill={active ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      aria-hidden="true"
    >
      {active ? (
        <path
          fillRule="evenodd"
          d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h12.75a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.785 48.785 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.265c.03.028.061.055.092.082a.75.75 0 101.038-1.083 1.5 1.5 0 00-2.192.732.75.75 0 001.062 1.27zm-9.165 0a.75.75 0 001.062-1.27 1.5 1.5 0 00-2.192.732.75.75 0 001.038 1.083c.031-.027.062-.054.092-.082z"
          clipRule="evenodd"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      )}
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-blue-500' : 'text-slate-400'}`}
      fill={active ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      aria-hidden="true"
    >
      {active ? (
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
          clipRule="evenodd"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      )}
    </svg>
  );
}

interface NavTab {
  key: ActiveTab;
  label: string;
  href: string;
}

const NAV_TABS: NavTab[] = [
  { key: 'catalog', label: 'Catalog', href: '/catalog' },
  { key: 'cart', label: 'Cart', href: '/cart' },
  { key: 'orders', label: 'History', href: '/orders' },
  { key: 'account', label: 'Account', href: '/account' },
];

function resolveActiveTab(pathname: string): ActiveTab {
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/orders')) return 'orders';
  if (pathname.startsWith('/account')) return 'account';
  return 'catalog';
}

export function AppShell({ children, activeTab }: AppShellProps) {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount);

  const currentTab = activeTab ?? resolveActiveTab(pathname);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC] relative">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_TABS.map((tab) => {
            const isActive = currentTab === tab.key;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 relative',
                  'transition-colors duration-150',
                  isActive ? 'text-blue-500' : 'text-slate-400',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative">
                  {tab.key === 'catalog' && <CatalogIcon active={isActive} />}
                  {tab.key === 'cart' && <CartIcon active={isActive} />}
                  {tab.key === 'orders' && <OrdersIcon active={isActive} />}
                  {tab.key === 'account' && <AccountIcon active={isActive} />}

                  {/* Cart badge */}
                  {tab.key === 'cart' && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] font-bold px-1 leading-none">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isActive ? 'text-blue-500' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
