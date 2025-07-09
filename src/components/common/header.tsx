'use client';

import { LanguageSwitcher } from './language-switcher';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        <div className="flex w-full items-center justify-end">
            <LanguageSwitcher />
        </div>
    </header>
  );
}
