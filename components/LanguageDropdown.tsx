"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type Language = "html" | "css" | "javascript" | "python" | "csharp" | "java";

interface LanguageDropdownProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languages: { id: Language; name: string; icon: string }[] = [
  { id: "html", name: "HTML", icon: "🌐" },
  { id: "css", name: "CSS", icon: "🎨" },
  { id: "javascript", name: "JavaScript", icon: "⚡" },
  { id: "python", name: "Python", icon: "🐍" },
  { id: "csharp", name: "C#", icon: "🔷" },
  { id: "java", name: "Java", icon: "☕" },
];

export default function LanguageDropdown({ selectedLanguage, onLanguageChange }: LanguageDropdownProps) {
  const currentLang = languages.find((l) => l.id === selectedLanguage) || languages[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span>{currentLang.icon}</span>
          <span>{currentLang.name}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((lang) => (
              <Menu.Item key={lang.id}>
                {({ active }) => (
                  <button
                    onClick={() => onLanguageChange(lang.id)}
                    className={`${
                      active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } ${
                      selectedLanguage === lang.id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-gray-700 dark:text-gray-200"
                    } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                  >
                    <span>{lang.icon}</span>
                    {lang.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}