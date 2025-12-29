import { motion } from 'framer-motion';

const footerLinks = {
  protocol: [
    { label: 'Documentation', href: '#' },
    { label: 'GitHub', href: '#' },
    { label: 'Audit Report', href: '#' },
  ],
  community: [
    { label: 'Discord', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Telegram', href: '#' },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-dark-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Blind<span className="text-primary">Bid</span>
              </span>
            </motion.div>
            <p className="text-muted-foreground text-sm max-w-md">
              A decentralized blind auction protocol for NFT vaults. 
              Bid confidently on hidden treasures with on-chain guarantees.
            </p>
          </div>

          {/* Protocol Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Protocol</h4>
            <ul className="space-y-2">
              {footerLinks.protocol.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 BlindBid Protocol. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built on QIE Network
          </p>
        </div>
      </div>
    </footer>
  );
};
