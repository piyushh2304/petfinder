"use client"
import { useAuth, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth()

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-2xl tracking-tight text-primary flex gap-2 items-center cursor-pointer hover:opacity-80 transition">
          🐾 PetFinder
        </Link>
        <div className="flex items-center gap-4">
          {isLoaded && !isSignedIn && (
            <Link href="/sign-in">
               <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-bold transition shadow-sm active:translate-y-px cursor-pointer">
                  Sign In
               </button>
            </Link>
          )}
          {isLoaded && isSignedIn && (
             <div className="flex items-center gap-6">
                <Link href="/" className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-all">Radar Grid</Link>
                <Link href="/profile" className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-rose-500 transition-all">Profile</Link>
                
                <div className="p-1 border border-border bg-card rounded-full shadow-sm hover:shadow-md transition flex items-center justify-center ml-2">
                   <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                </div>
             </div>
          )}
        </div>
      </div>
    </nav>
  )
}
