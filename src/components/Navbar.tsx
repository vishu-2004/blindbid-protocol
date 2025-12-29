import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useScrollState } from '@/hooks/useScrollState';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/auctions', label: 'Auctions' },
  { path: '/create', label: 'Create Vault' },
];

export const Navbar = () => {
  const { isScrolled } = useScrollState(50);
  const location = useLocation();

  return (
    <motion.header
      initial={false}
      animate={{
        height: isScrolled ? 64 : 80,
        backgroundColor: isScrolled 
          ? 'hsl(240 20% 5% / 0.95)' 
          : 'hsl(240 20% 5% / 0.8)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50"
    >
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Blind<span className="text-primary">Bid</span>
            </span>
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2"
              >
                <motion.span
                  className={`text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                >
                  {link.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connect */}
        <div className="flex items-center gap-4">
          <ConnectButton 
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </motion.header>
  );
};
