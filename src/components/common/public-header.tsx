
'use client';

import { LanguageSwitcher } from './language-switcher';

export function PublicHeader() {
  return (
    <header className="absolute top-0 z-10 w-full p-4">
        <div className="container mx-auto flex justify-end">
            <LanguageSwitcher />
        </div>
    </header>
  );
}
