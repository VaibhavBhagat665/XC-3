import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useWeb3, useCarbonCredits, useChainInfo } from "../hooks/useWeb3";
import { useToast } from "../hooks/use-toast";
import { creditsApi, errorHandler } from "../lib/api";
import { ConnectKitButton } from "connectkit";
import {
  Wallet as WalletIcon,
  Send,
  ArrowUpDown,
  Recycle,
  Coins,
  ExternalLink,
  Loader2,
  Copy,
  CheckCircle,
} from "lucide-react";

interface CreditBalance {
  tokenId: number;
  amount: number;
  projectName: string;
  vintage: number;
  methodology: string;
  chainId: number;
  chainName: string;
}

export default function Wallet() {
  const { address, isConnected, chainId, isZetaChain, switchToZeta } =
    useWeb3();
  const { balance } = useCarbonCredits();
  const { chainName, chainColor } = useChainInfo();
  const { toast } = useToast();

  const [creditBalances, setCreditBalances] = useState<CreditBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditBalance | null>(
    null,
  );
  const [transferData, setTransferData] = useState({ to: "", amount: "" });
  const [retireData, setRetireData] = useState({ amount: "", reason: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load balances from API
  useEffect(() => {
    if (isConnected && address) {
      loadBalances();
    }
  }, [isConnected, address]);

  const loadBalances = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await creditsApi.getUserBalance(address);
      if (response.success && response.data) {
        // Convert API response to CreditBalance format
        const convertedBalances = response.data.map((balance: any) => ({
          tokenId: balance.tokenId,
          amount: balance.amount,
          projectName: balance.projectName,
          vintage: balance.vintage,
          methodology: balance.methodology,
          chainId: balance.chainId,
          chainName: balance.chainName,
        }));
        setCreditBalances(convertedBalances);
      } else {
        console.error("Failed to load credit balances:", response.error);
        setCreditBalances([]);
      }
    } catch (error) {
      console.error("Failed to load balances:", error);
      setCreditBalances([]);
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = creditBalances.reduce(
    (sum, credit) => sum + credit.amount,
    0,
  );

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleTransfer = async () => {
    if (!selectedCredit || !transferData.to || !transferData.amount || !address)
      return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(transferData.amount);

      // Call API to transfer credits
      const response = await creditsApi.transferCredits({
        tokenId: selectedCredit.tokenId,
        fromAddress: address,
        toAddress: transferData.to,
        amount,
      });

      if (response.success) {
        toast({
          title: "Transfer successful!",
          description: `Transferred ${amount} credits to ${transferData.to}`,
        });

        // Reload balances to reflect the transfer
        await loadBalances();

        setTransferDialogOpen(false);
        setTransferData({ to: "", amount: "" });
      } else {
        throw new Error(response.error || "Transfer failed");
      }
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetire = async () => {
    if (!selectedCredit || !retireData.amount || !address) return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(retireData.amount);

      // Call API to retire credits
      const response = await creditsApi.retireCredits({
        tokenId: selectedCredit.tokenId,
        userAddress: address,
        amount,
        reason: retireData.reason || "Carbon offset",
      });

      if (response.success) {
        toast({
          title: "Credits retired!",
          description: `Retired ${amount} credits for: ${retireData.reason || "Carbon offset"}`,
        });

        // Reload balances to reflect the retirement
        await loadBalances();

        setRetireDialogOpen(false);
        setRetireData({ amount: "", reason: "" });
      } else {
        throw new Error(response.error || "Retirement failed");
      }
    } catch (error) {
      toast({
        title: "Retirement failed",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto">
              <WalletIcon className="w-10 h-10 text-neon-cyan" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Connect Your <span className="text-gradient">Wallet</span>
              </h1>
              <p className="text-xl text-white/70">
                Connect your Web3 wallet to view and manage your carbon credits
                across multiple chains
              </p>
            </div>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button className="btn-neon" onClick={show}>
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              Your <span className="text-gradient">Wallet</span>
            </h1>
            <p className="text-lg text-white/70 mt-2">
              Manage your carbon credits across all connected chains
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={`glass border-current/50 ${chainColor}`}
            >
              <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
              {chainName}
            </Badge>
            {!isZetaChain && (
              <Button size="sm" onClick={switchToZeta} className="btn-glass">
                Switch to ZetaChain
              </Button>
            )}
          </div>
        </div>

        {/* Wallet Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="crypto-card lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Wallet Address
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  className="btn-glass"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground font-mono bg-black/20 p-3 rounded-lg break-all">
                {address}
              </p>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Total Portfolio
              </h3>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-neon-cyan">
                  {totalCredits.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Carbon Credits (tCO2e)
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Credit Balances */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Credit Holdings</h2>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="btn-glass"
                onClick={() =>
                  window.open("https://bridge.zetachain.com", "_blank")
                }
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Bridge Assets
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neon-cyan mb-4" />
              <p className="text-muted-foreground">
                Loading credit balances...
              </p>
            </div>
          ) : creditBalances.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto">
                  <Coins className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  No credits found
                </h3>
                <p className="text-muted-foreground">
                  You don't have any carbon credits yet. Register a project to
                  start earning credits.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {creditBalances.map((credit) => (
                <Card
                  key={`${credit.chainId}-${credit.tokenId}`}
                  className="crypto-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {credit.projectName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Vintage: {credit.vintage}</span>
                          <span>•</span>
                          <span>{credit.methodology}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="glass border-neon-cyan/50 text-neon-cyan"
                      >
                        {credit.chainName}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="text-xl font-bold text-neon-cyan">
                          {credit.amount.toLocaleString()} tCO2e
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="text-white font-mono">
                          #{credit.tokenId}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-glass flex-1"
                        onClick={() => {
                          setSelectedCredit(credit);
                          setTransferDialogOpen(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-glass flex-1"
                        onClick={() => {
                          setSelectedCredit(credit);
                          setRetireDialogOpen(true);
                        }}
                      >
                        <Recycle className="w-4 h-4 mr-2" />
                        Retire
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Transfer Dialog */}
        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent className="glass-card border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Transfer Carbon Credits
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Transfer carbon credits to another wallet address.
              </DialogDescription>
            </DialogHeader>

            {selectedCredit && (
              <div className="space-y-6">
                <div className="p-4 glass rounded-lg">
                  <h4 className="font-semibold text-white mb-2">
                    Selected Credit
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCredit.projectName}
                  </p>
                  <p className="text-sm text-neon-cyan">
                    Available: {selectedCredit.amount.toLocaleString()} tCO2e
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to-address" className="text-white">
                      Recipient Address
                    </Label>
                    <Input
                      id="to-address"
                      value={transferData.to}
                      onChange={(e) =>
                        setTransferData({ ...transferData, to: e.target.value })
                      }
                      className="glass border-white/20 text-white"
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      Amount (tCO2e)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferData.amount}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          amount: e.target.value,
                        })
                      }
                      className="glass border-white/20 text-white"
                      placeholder="0"
                      max={selectedCredit.amount}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setTransferDialogOpen(false)}
                    className="btn-glass flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTransfer}
                    className="btn-neon flex-1"
                    disabled={
                      isProcessing || !transferData.to || !transferData.amount
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transferring...
                      </>
                    ) : (
                      "Transfer Credits"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Retire Dialog */}
        <Dialog open={retireDialogOpen} onOpenChange={setRetireDialogOpen}>
          <DialogContent className="glass-card border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Retire Carbon Credits
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Permanently retire carbon credits to offset your carbon
                footprint.
              </DialogDescription>
            </DialogHeader>

            {selectedCredit && (
              <div className="space-y-6">
                <div className="p-4 glass rounded-lg">
                  <h4 className="font-semibold text-white mb-2">
                    Selected Credit
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCredit.projectName}
                  </p>
                  <p className="text-sm text-neon-cyan">
                    Available: {selectedCredit.amount.toLocaleString()} tCO2e
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retire-amount" className="text-white">
                      Amount to Retire (tCO2e)
                    </Label>
                    <Input
                      id="retire-amount"
                      type="number"
                      value={retireData.amount}
                      onChange={(e) =>
                        setRetireData({ ...retireData, amount: e.target.value })
                      }
                      className="glass border-white/20 text-white"
                      placeholder="0"
                      max={selectedCredit.amount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retire-reason" className="text-white">
                      Retirement Reason
                    </Label>
                    <Input
                      id="retire-reason"
                      value={retireData.reason}
                      onChange={(e) =>
                        setRetireData({ ...retireData, reason: e.target.value })
                      }
                      className="glass border-white/20 text-white"
                      placeholder="e.g., Carbon neutrality for company operations"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setRetireDialogOpen(false)}
                    className="btn-glass flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRetire}
                    className="btn-neon flex-1"
                    disabled={isProcessing || !retireData.amount}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Retiring...
                      </>
                    ) : (
                      "Retire Credits"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
