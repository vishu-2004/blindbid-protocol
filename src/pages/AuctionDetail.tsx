import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuctionDetail } from '@/hooks/useAuctionDetail';
import { SellerPreStartView } from '@/components/auction/SellerPreStartView';
import { BuyerPreStartView } from '@/components/auction/BuyerPreStartView';
import { LiveAuctionView } from '@/components/auction/LiveAuctionView';
import { AuctionEndedView } from '@/components/auction/AuctionEndedView';
import { AuctionCancelledView } from '@/components/auction/AuctionCancelledView';
import { AuctionLoadingView } from '@/components/auction/AuctionLoadingView';
import { AuctionNotFoundView } from '@/components/auction/AuctionNotFoundView';

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    vaultData,
    verificationData,
    currentView,
    remainingTime,
    formattedCurrentBid,
    formattedStartPrice,
    nextBidAmount,
    isConnected,
    canBid,
    actionPending,
    isSeller,
    isHighestBidder,
    isWinner,
    activeChain,
    error,
    startAuction,
    cancelAuction,
    cancelVault,
    placeBid,
    endAuction,
  } = useAuctionDetail(id);

  const renderView = () => {
    switch (currentView) {
      case 'loading':
        return <AuctionLoadingView />;

      case 'not-found':
        return <AuctionNotFoundView error={error} />;

      case 'seller-prestart':
        return vaultData ? (
          <SellerPreStartView
            vaultData={vaultData}
            vaultId={id!}
            formattedStartPrice={formattedStartPrice}
            actionPending={actionPending}
            onStartAuction={startAuction}
            onCancelAuction={cancelAuction}
            onCancelVault={cancelVault}
          />
        ) : null;

      case 'buyer-prestart':
        return vaultData ? (
          <BuyerPreStartView
            vaultData={vaultData}
            verificationData={verificationData}
            formattedStartPrice={formattedStartPrice}
          />
        ) : null;

      case 'live':
        return vaultData ? (
          <LiveAuctionView
            vaultData={vaultData}
            verificationData={verificationData}
            remainingTime={remainingTime}
            formattedCurrentBid={formattedCurrentBid}
            nextBidAmount={nextBidAmount}
            isConnected={isConnected}
            canBid={canBid}
            actionPending={actionPending}
            isSeller={isSeller}
            isHighestBidder={isHighestBidder}
            activeChain={activeChain}
            onPlaceBid={placeBid}
            onEndAuction={endAuction}
          />
        ) : null;

      case 'ended':
        return vaultData ? (
          <AuctionEndedView
            vaultData={vaultData}
            formattedCurrentBid={formattedCurrentBid}
            isWinner={isWinner}
          />
        ) : null;

      case 'cancelled':
        return vaultData ? (
          <AuctionCancelledView vaultData={vaultData} />
        ) : null;

      default:
        return <AuctionNotFoundView />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link 
          to="/auctions" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Auctions
        </Link>
      </div>

      {renderView()}
    </div>
  );
};

export default AuctionDetail;
