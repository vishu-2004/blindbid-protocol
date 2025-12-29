import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { config } from '@/config/wagmi';
import { blindBidTheme } from '@/config/rainbowkit';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

// Pages
import Landing from '@/pages/Landing';
import Auctions from '@/pages/Auctions';
import CreateVault from '@/pages/CreateVault';
import AuctionDetail from '@/pages/AuctionDetail';
import NotFound from '@/pages/NotFound';

// RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Inner app component that has access to router context
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <Layout pathname={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/create" element={<CreateVault />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={blindBidTheme} modalSize="compact">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
