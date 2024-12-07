import { type FC } from 'react';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  PhotoIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Generate', href: '/generate', icon: SparklesIcon },
  { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
];

export const Sidebar: FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  // ... rest of the component code ...
}; 