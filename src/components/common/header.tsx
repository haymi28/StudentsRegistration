'use client';

import { LanguageSwitcher } from './language-switcher';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  return (
    <header className="absolute top-0 z-40 flex h-14 w-full items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex w-full items-center justify-end">
            <LanguageSwitcher />
        </div>
    </header>
  );
}
