"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { User, Settings, Moon, Sun, LogOut, LineChart } from "lucide-react"

export default function ProfileMenu() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative mb-5 z-50 flex" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-border text-neutral-900 dark:text-white transition-all duration-300 ease-out hover:bg-gray-100 dark:hover:bg-neutral-800 hover:cursor-pointer ${isOpen ? "scale-110 ring-2 ring-neutral-300 dark:ring-white/20" : "scale-100"
          }`}
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Profile"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-3 w-64 origin-top rounded-md border border-gray-200 dark:border-border bg-white dark:bg-neutral-900 shadow-lg shadow-black/10 dark:shadow-black/50 transition-all duration-300 animate-in fade-in slide-in-from-top-4">

          <div className="px-4 py-3 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-neutral-800/50 rounded-t-md">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {session?.user?.name || "Inventory User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {session?.user?.email || "No email attached"}
            </p>
          </div>
          <Link
            href="/analytics"
            onClick={() => setIsOpen(false)} // Close menu when clicked
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors hover:cursor-pointer"
          >
            <LineChart className="mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            Profit & Loss
          </Link>

          <div className="flex flex-col p-1 space-y-1">
            <button className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors hover:cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors hover:cursor-pointer"
            >
              <div className="flex items-center">
                {theme === "dark" ? (
                  <Moon className="mr-2 h-4 w-4 transition-transform duration-500 hover:-rotate-12 animate-in fade-in zoom-in-50 -spin-in-90" />
                ) : (
                  <Sun className="mr-2 h-4 w-4 transition-transform duration-500 hover:rotate-90 animate-in fade-in zoom-in-50 spin-in-90" />
                )}
                <span>Toggle Theme</span>
              </div>
              <span className="text-xs text-gray-500 capitalize">{theme}</span>
            </button>

            <div className="my-1 h-px bg-gray-200 dark:bg-border" />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 transition-colors hover:cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}