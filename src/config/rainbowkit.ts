import { Theme, darkTheme } from '@rainbow-me/rainbowkit';
import merge from 'lodash.merge';

// BlindBid custom dark theme with gold accents
export const blindBidTheme: Theme = merge(darkTheme(), {
  colors: {
    accentColor: 'hsl(43, 74%, 49%)', // Gold accent
    accentColorForeground: 'hsl(0, 0%, 5%)',
    actionButtonBorder: 'hsl(43, 74%, 49%)',
    actionButtonBorderMobile: 'hsl(43, 74%, 49%)',
    actionButtonSecondaryBackground: 'hsl(240, 20%, 12%)',
    closeButton: 'hsl(43, 74%, 49%)',
    closeButtonBackground: 'hsl(240, 20%, 12%)',
    connectButtonBackground: 'hsl(240, 20%, 8%)',
    connectButtonBackgroundError: 'hsl(0, 84%, 60%)',
    connectButtonInnerBackground: 'hsl(240, 20%, 12%)',
    connectButtonText: 'hsl(43, 74%, 49%)',
    connectButtonTextError: 'hsl(0, 0%, 100%)',
    generalBorder: 'hsl(43, 74%, 30%)',
    generalBorderDim: 'hsl(240, 20%, 20%)',
    menuItemBackground: 'hsl(240, 20%, 15%)',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    modalBackground: 'hsl(240, 20%, 8%)',
    modalBorder: 'hsl(43, 74%, 30%)',
    modalText: 'hsl(0, 0%, 95%)',
    modalTextDim: 'hsl(0, 0%, 70%)',
    modalTextSecondary: 'hsl(0, 0%, 80%)',
    profileAction: 'hsl(240, 20%, 15%)',
    profileActionHover: 'hsl(240, 20%, 20%)',
    profileForeground: 'hsl(240, 20%, 10%)',
    selectedOptionBorder: 'hsl(43, 74%, 49%)',
    standby: 'hsl(43, 74%, 49%)',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    actionButton: '8px',
    connectButton: '8px',
    menuButton: '8px',
    modal: '12px',
    modalMobile: '12px',
  },
  shadows: {
    connectButton: '0 4px 20px rgba(181, 137, 39, 0.15)',
    dialog: '0 8px 40px rgba(0, 0, 0, 0.5)',
    profileDetailsAction: '0 2px 10px rgba(0, 0, 0, 0.3)',
    selectedOption: '0 0 0 2px hsl(43, 74%, 49%)',
    selectedWallet: '0 0 0 2px hsl(43, 74%, 49%)',
    walletLogo: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
} as Partial<Theme>);
