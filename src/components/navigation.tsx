'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Home, Trophy, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Stages',
    href: '/stages',
    icon: Trophy,
  },
  {
    name: 'Competition',
    href: '/competition',
    icon: DollarSign,
  },
  {
    name: 'My Profile',
    href: '/profile',
    icon: Menu,
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({ item, className = "" }: { item: typeof navigationItems[0], className?: string }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        className
      )}
      onClick={() => setIsOpen(false)}
    >
      <item.icon className="h-4 w-4" />
      {item.name}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur p-3 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PLK</span>
              </div>
              <span className="font-bold text-lg">CKY Grader</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
          {/* Authentication Buttons Desktop */}
          <div className="hidden md:flex items-center ml-4 space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <Link href="/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Navigate to different sections of the AI Text Grader application.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-2 px-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">PLK</span>
                  </div>
                  <span className="font-bold text-lg">CKY Grader</span>
                </div>
                
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.name} item={item} className="w-full justify-start" />
                  ))}
                  {/* Authentication Buttons Mobile */}
                  <div className="mt-4 space-y-2">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </SignInButton>
                      <Link href="/signup">
                        <Button variant="default" className="w-full">Sign Up</Button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 