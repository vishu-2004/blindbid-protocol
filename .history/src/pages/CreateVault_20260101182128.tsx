import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Vault, Gavel, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateVault } from '@/hooks/useCreateVault';
import StepIndicator from '@/components/StepIndicator';
import { isContractConfigured } from '@/utils/contract';

const CreateVault = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const {
    currentStep,
    isProcessing,
    nftInfo,
    vaultId,
    error,
    success,
    verifyAndApproveNFTs,
    createVault,
    createAuction,
    reset,
  } = useCreateVault();

  // Step 1 form state
  const [nftAddress, setNftAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');

  // Step 2 form state
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');

  // Step 3 form state
  const [startPrice, setStartPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  // Handle Step 1 submission
  const handleVerifyAndApprove = async () => {
    const result = await verifyAndApproveNFTs(nftAddress, tokenIds);
    if (result) {
      toast({
        title: 'NFTs Approved',
        description: 'Your NFTs have been approved for the vault contract.',
      });
    }
  };

  // Handle Step 2 submission
  const handleCreateVault = async () => {
    const result = await createVault(vaultName, vaultDescription);
    if (result) {
      toast({
        title: 'Vault Created',
        description: 'Your vault has been created successfully.',
      });
    }
  };

  // Handle Step 3 submission
  const handleCreateAuction = async () => {
    const duration = parseInt(durationMinutes, 10);
    const result = await createAuction(startPrice, duration);
    if (result && vaultId !== null) {
      toast({
        title: 'Auction Created',
        description: 'Your auction is ready to be started.',
      });
      // Navigate to auction detail page
      setTimeout(() => {
        navigate(`/auction/${vaultId}`);
      }, 1500);
    }
  };

  

  // Animation variants
  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Contract not configured
  if (!isContractConfigured()) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="glass-gold rounded-xl p-8 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Contract Not Configured
          </h2>
          <p className="text-muted-foreground">
            Please configure the smart contract address to create vaults.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Create Vault Auction
        </h1>
        <p className="text-muted-foreground">
          Lock your NFTs in a vault and start a blind auction
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Connect Wallet Prompt */}
      {!isConnected ? (
        <motion.div
          className="glass-gold rounded-xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Vault className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to create a vault auction.
          </p>
          <ConnectButton />
        </motion.div>
      ) : (
        /* Step Forms */
        <div className="glass-gold rounded-xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Verify & Approve NFTs */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Step 1: Verify & Approve NFTs
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    NFT Contract Address
                  </label>
                  <Input
                    placeholder="0x..."
                    value={nftAddress}
                    onChange={(e) => setNftAddress(e.target.value)}
                    disabled={isProcessing}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Token IDs (comma-separated)
                  </label>
                  <Input
                    placeholder="1, 2, 3"
                    value={tokenIds}
                    onChange={(e) => setTokenIds(e.target.value)}
                    disabled={isProcessing}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the token IDs you want to include in the vault
                  </p>
                </div>

                <Button
                  className="w-full gradient-gold text-primary-foreground font-semibold"
                  onClick={handleVerifyAndApprove}
                  disabled={isProcessing || !nftAddress || !tokenIds}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving NFTs...
                    </>
                  ) : (
                    'Verify & Approve NFTs'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 2: Create Vault */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Vault className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Step 2: Create Vault
                  </h2>
                </div>

                {/* NFT Summary */}
                {nftInfo && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      NFT Contract
                    </p>
                    <p className="text-sm font-mono text-foreground truncate">
                      {nftInfo.nftAddress}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 mb-1">
                      Token IDs
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {nftInfo.tokenIds.map((id) => id.toString()).join(', ')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vault Name
                  </label>
                  <Input
                    placeholder="My Awesome Vault"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    disabled={isProcessing}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vault Description
                  </label>
                  <Textarea
                    placeholder="Describe your vault..."
                    value={vaultDescription}
                    onChange={(e) => setVaultDescription(e.target.value)}
                    disabled={isProcessing}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                <Button
                  className="w-full gradient-gold text-primary-foreground font-semibold"
                  onClick={handleCreateVault}
                  disabled={isProcessing || !vaultName}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Vault...
                    </>
                  ) : (
                    'Create Vault'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 3: Create Auction */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Gavel className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Step 3: Create Auction
                  </h2>
                </div>

                {/* Vault Summary */}
                {vaultId !== null && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Vault ID
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      #{vaultId.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 mb-1">
                      Vault Name
                    </p>
                    <p className="text-sm text-foreground">{vaultName}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Price (QIE)
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.1"
                      value={startPrice}
                      onChange={(e) => setStartPrice(e.target.value)}
                      disabled={isProcessing}
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="60"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      disabled={isProcessing}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  The auction will be created but not started. You can start it
                  from the auction detail page.
                </p>

                <Button
                  className="w-full gradient-gold text-primary-foreground font-semibold"
                  onClick={handleCreateAuction}
                  disabled={isProcessing || !startPrice || !durationMinutes}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Auction...
                    </>
                  ) : (
                    'Create Auction'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-500">{success}</p>
            </motion.div>
          )}

          {/* Reset Button */}
          {currentStep > 1 && !isProcessing && (
            <div className="mt-6 text-center">
              <button
                onClick={reset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateVault;
