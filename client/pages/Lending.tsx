import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { ConnectKitButton } from "connectkit";
import { useWeb3 } from "../hooks/useWeb3";
import { useToast } from "../hooks/use-toast";
import { lendingApi, errorHandler, getApiBase } from "../lib/api";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Shield,
  DollarSign,
  Zap,
  ArrowUpDown,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface LendingPosition {
  id: number;
  collateralTokenId: number;
  collateralAmount: number;
  collateralValue: number;
  borrowedAmount: number;
  borrowedCurrency: string;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  projectName: string;
  status: "active" | "repaid" | "liquidated";
  createdAt: string;
  lastUpdated: string;
}

interface CollateralAsset {
  tokenId: number;
  projectName: string;
  amount: number;
  currentPrice: number;
  methodology: string;
  vintage: number;
}

export default function Lending() {
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();

  const [positions, setPositions] = useState<LendingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableAssets, setAvailableAssets] = useState<CollateralAsset[]>([]);
  const [avgPrice, setAvgPrice] = useState<number>(25);

  const [selectedAsset, setSelectedAsset] = useState<CollateralAsset | null>(
    null,
  );
  const [selectedPosition, setSelectedPosition] =
    useState<LendingPosition | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [depositData, setDepositData] = useState({
    amount: "",
    borrowAmount: "",
  });

  const [repayData, setRepayData] = useState({
    amount: "",
  });

  // Load available collateral assets from wallet balances
  useEffect(() => {
    const loadAssets = async () => {
      if (!isConnected || !address) {
        setAvailableAssets([]);
        return;
      }
      try {
        const [balResp, stats] = await Promise.all([
          import("../lib/api").then(m => m.creditsApi.getUserBalance(address)),
          import("../lib/api").then(m => m.marketApi.getStats?.()).catch(() => null),
        ]);
        if (stats && (stats as any).success && (stats as any).data?.averagePrice) {
          setAvgPrice((stats as any).data.averagePrice);
        }
        if (balResp.success && Array.isArray(balResp.data)) {
          const assets = balResp.data.map((c: any) => ({
            tokenId: c.creditId,
            projectName: c.projectName || `Token #${c.tokenId}`,
            amount: Number(c.amount),
            currentPrice: Number((stats as any)?.data?.averagePrice || 25),
            methodology: c.methodology,
            vintage: c.vintage,
          }));
          setAvailableAssets(assets);
        } else {
          setAvailableAssets([]);
        }
      } catch {
        setAvailableAssets([]);
      }
    };
    loadAssets();
  }, [isConnected, address]);

  // Live updates: SSE for user positions with 5s polling fallback
  useEffect(() => {
    if (!isConnected || !address) return;

    let pollId: any = null;
    let es: EventSource | null = null;

    const startPolling = () => {
      if (pollId) return;
      loadPositions();
      pollId = setInterval(loadPositions, 5000);
    };

    try {
      const base = getApiBase();
      const url = `${base.replace(/\/$/, "")}/lending/stream?userAddress=${encodeURIComponent(address)}`;
      es = new EventSource(url);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data || "[]");
          const convertedPositions = (Array.isArray(data) ? data : []).map((pos: any) => ({
            id: pos.id,
            collateralTokenId: pos.credit_id || pos.id,
            collateralAmount: pos.collateral_amount || 100,
            collateralValue: (pos.collateral_amount || 100) * 25.5,
            borrowedAmount: pos.borrowed_amount || 1530,
            borrowedCurrency: "xc3USD",
            interestRate: pos.interest_rate || 0.08,
            healthFactor: pos.health_factor || 1.45,
            liquidationThreshold: pos.liquidation_threshold || 0.8,
            projectName: pos.project_name || "Carbon Credit Project",
            status: (pos.status as "active" | "repaid" | "liquidated") || "active",
            createdAt: pos.created_at || new Date().toISOString(),
            lastUpdated: pos.updated_at || new Date().toISOString(),
          }));
          setPositions(convertedPositions);
          setLoading(false);
        } catch (e) {
          console.warn("Failed to parse lending SSE data:", e);
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        startPolling();
      };
    } catch (e) {
      startPolling();
    }

    return () => {
      if (pollId) clearInterval(pollId);
      if (es) es.close();
    };
  }, [isConnected, address]);

  const loadPositions = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await lendingApi.getUserPositions(address);
      if (response.success && response.data) {
        // Convert API response to LendingPosition format
        const convertedPositions = response.data.map((pos: any) => ({
          id: pos.id,
          collateralTokenId: pos.credit_id || pos.id,
          collateralAmount: pos.collateral_amount || 100,
          collateralValue: (pos.collateral_amount || 100) * 25.5,
          borrowedAmount: pos.borrowed_amount || 1530,
          borrowedCurrency: "xc3USD",
          interestRate: pos.interest_rate || 0.08,
          healthFactor: pos.health_factor || 1.45,
          liquidationThreshold: pos.liquidation_threshold || 0.8,
          projectName: pos.project_name || "Carbon Credit Project",
          status:
            (pos.status as "active" | "repaid" | "liquidated") || "active",
          createdAt: pos.created_at || new Date().toISOString(),
          lastUpdated: pos.updated_at || new Date().toISOString(),
        }));
        setPositions(convertedPositions);
      } else {
        console.error("Lending API failed:", response.error);
        setPositions([]);
      }
    } catch (error) {
      console.error("Failed to load positions:", error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  // Protocol stats
  const protocolStats = {
    totalValueLocked: 12800000,
    totalBorrowed: 7680000,
    utilizationRate: 60,
    averageHealthFactor: 1.85,
  };

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return "text-neon-green";
    if (healthFactor >= 1.2) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthFactorStatus = (healthFactor: number) => {
    if (healthFactor >= 1.5) return "Safe";
    if (healthFactor >= 1.2) return "Moderate Risk";
    return "High Risk";
  };

  const calculateBorrowCapacity = (collateralValue: number, ltv = 0.6) => {
    return collateralValue * ltv;
  };

  const handleDeposit = async () => {
    if (!selectedAsset || !depositData.amount || !isConnected || !address)
      return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(depositData.amount);
      const borrowAmount = parseFloat(depositData.borrowAmount || "0");
      const collateralValue = amount * selectedAsset.currentPrice;
      const maxBorrow = collateralValue * 0.6; // 60% LTV
      if (borrowAmount > maxBorrow) {
        throw new Error(`Borrow exceeds max capacity ($${maxBorrow.toFixed(2)})`);
      }
      if (amount > selectedAsset.amount) {
        throw new Error("Insufficient collateral balance");
      }

      // Call API to create lending position
      const response = await lendingApi.createPosition({
        userAddress: address,
        creditId: selectedAsset.tokenId,
        collateralAmount: amount,
        borrowedAmount: borrowAmount,
        interestRate: 0.08,
      });

      if (response.success) {
        toast({
          title: "Position created!",
          description: `Deposited ${amount} credits and borrowed ${borrowAmount} xc3USD`,
        });

        // Reload positions to show the new position
        await loadPositions();

        setDepositDialogOpen(false);
        setDepositData({ amount: "", borrowAmount: "" });
      } else {
        throw new Error(response.error || "Failed to create position");
      }
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepay = async () => {
    if (!selectedPosition || !repayData.amount || !isConnected || !address)
      return;

    setIsProcessing(true);
    try {
      const repayAmount = parseFloat(repayData.amount);

      // Call API to repay loan
      const response = await lendingApi.repayLoan(selectedPosition.id, {
        userAddress: address,
        amount: repayAmount,
      });

      if (response.success) {
        toast({
          title: "Repayment successful!",
          description: `Repaid ${repayAmount} xc3USD`,
        });

        // Reload positions to reflect the repayment
        await loadPositions();

        setRepayDialogOpen(false);
        setRepayData({ amount: "" });
      } else {
        throw new Error(response.error || "Failed to process repayment");
      }
    } catch (error) {
      toast({
        title: "Repayment failed",
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
              <Wallet className="w-10 h-10 text-neon-cyan" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Carbon Credit <span className="text-gradient">Lending</span>
              </h1>
              <p className="text-xl text-white/70">
                Connect your wallet to use carbon credits as collateral for
                borrowing xc3USD
              </p>
            </div>
            <ConnectKitButton.Custom>
              {({ show }) => {
                const { connect, connectors } = useWeb3();
                return (
                  <Button
                    className="btn-neon"
                    onClick={() => {
                      const mm = (connectors as any[])?.find(
                        (c) => c.id === "metaMask" && (c as any).ready,
                      );
                      const injected = (connectors as any[])?.find(
                        (c) => c.id === "injected" && (c as any).ready,
                      );
                      if (mm || injected) connect(mm || injected);
                      else show();
                    }}
                  >
                    Connect Wallet
                  </Button>
                );
              }}
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
              Carbon Credit <span className="text-gradient">Lending</span>
            </h1>
            <p className="text-lg text-white/70 mt-2">
              Use your carbon credits as collateral to borrow against their
              value
            </p>
          </div>

          <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="w-5 h-5 mr-2" />
                New Position
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">
                  Create Lending Position
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new lending position by depositing collateral and
                  borrowing against carbon credits.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Select Collateral Asset
                  </h3>
                  <div className="grid gap-4">
                    {availableAssets.map((asset) => (
                      <div
                        key={asset.tokenId}
                        className={`p-4 glass rounded-lg cursor-pointer transition-all ${
                          selectedAsset?.tokenId === asset.tokenId
                            ? "border-neon-cyan border-2"
                            : "border-white/20 border hover:border-white/40"
                        }`}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">
                              {asset.projectName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {asset.methodology} • {asset.vintage}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Available: {asset.amount.toLocaleString()} tCO2e
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-neon-cyan">
                              ${asset.currentPrice}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              per tCO2e
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAsset && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="collateral-amount" className="text-white">
                        Collateral Amount (tCO2e)
                      </Label>
                      <Input
                        id="collateral-amount"
                        type="number"
                        value={depositData.amount}
                        onChange={(e) =>
                          setDepositData({
                            ...depositData,
                            amount: e.target.value,
                          })
                        }
                        className="glass border-white/20 text-white"
                        placeholder="0"
                        max={selectedAsset.amount}
                      />
                    </div>

                    {depositData.amount && (
                      <>
                        <div className="p-4 glass rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Collateral Value:
                            </span>
                            <span className="text-white">
                              $
                              {(
                                parseFloat(depositData.amount) *
                                selectedAsset.currentPrice
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Max Borrow (60% LTV):
                            </span>
                            <span className="text-neon-cyan">
                              $
                              {calculateBorrowCapacity(
                                parseFloat(depositData.amount) *
                                  selectedAsset.currentPrice,
                              ).toLocaleString()}{" "}
                              xc3USD
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="borrow-amount" className="text-white">
                            Borrow Amount (xc3USD) - Optional
                          </Label>
                          <Input
                            id="borrow-amount"
                            type="number"
                            value={depositData.borrowAmount}
                            onChange={(e) =>
                              setDepositData({
                                ...depositData,
                                borrowAmount: e.target.value,
                              })
                            }
                            className="glass border-white/20 text-white"
                            placeholder="0"
                            max={calculateBorrowCapacity(
                              parseFloat(depositData.amount) *
                                selectedAsset.currentPrice,
                            )}
                          />
                        </div>

                        {depositData.borrowAmount && (
                          <div className="p-4 glass rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Health Factor:
                              </span>
                              <span
                                className={getHealthFactorColor(
                                  (parseFloat(depositData.amount) *
                                    selectedAsset.currentPrice *
                                    0.8) /
                                    parseFloat(depositData.borrowAmount),
                                )}
                              >
                                {(
                                  (parseFloat(depositData.amount) *
                                    selectedAsset.currentPrice *
                                    0.8) /
                                  parseFloat(depositData.borrowAmount)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setDepositDialogOpen(false)}
                    className="btn-glass flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="btn-neon flex-1"
                    disabled={
                      isProcessing || !selectedAsset || !depositData.amount
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Position"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-neon-cyan" />
                <span className="text-sm text-muted-foreground">
                  Total Value Locked
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${(protocolStats.totalValueLocked / 1000000).toFixed(1)}M
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                <span className="text-sm text-muted-foreground">
                  Total Borrowed
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${(protocolStats.totalBorrowed / 1000000).toFixed(1)}M
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-neon-purple" />
                <span className="text-sm text-muted-foreground">
                  Utilization Rate
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {protocolStats.utilizationRate}%
              </div>
              <Progress value={protocolStats.utilizationRate} className="h-2" />
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-neon-pink" />
                <span className="text-sm text-muted-foreground">
                  Avg Health Factor
                </span>
              </div>
              <div className="text-2xl font-bold text-neon-green">
                {protocolStats.averageHealthFactor}
              </div>
            </div>
          </Card>
        </div>

        {/* Lending Positions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Your Lending Positions
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neon-cyan mb-4" />
              <p className="text-muted-foreground">
                Loading lending positions...
              </p>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  No lending positions
                </h3>
                <p className="text-muted-foreground">
                  Create your first lending position to start earning on your
                  carbon credits
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {positions.map((position) => (
                <Card key={position.id} className="crypto-card">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {position.projectName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`glass ${
                            position.status === "active"
                              ? "border-neon-green/50 text-neon-green"
                              : "border-white/20 text-white/60"
                          }`}
                        >
                          {position.status === "active" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : null}
                          {position.status.charAt(0).toUpperCase() +
                            position.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getHealthFactorColor(position.healthFactor)}`}
                        >
                          {position.healthFactor.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Health Factor
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Collateral:
                        </span>
                        <div className="text-white">
                          {position.collateralAmount.toLocaleString()} tCO2e
                        </div>
                        <div className="text-neon-cyan">
                          ${position.collateralValue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Borrowed:</span>
                        <div className="text-white">
                          {position.borrowedAmount.toLocaleString()}{" "}
                          {position.borrowedCurrency}
                        </div>
                        <div className="text-yellow-400">
                          {(position.interestRate * 100).toFixed(1)}% APR
                        </div>
                      </div>
                    </div>

                    {/* Health Factor Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Health Status:
                        </span>
                        <span
                          className={getHealthFactorColor(
                            position.healthFactor,
                          )}
                        >
                          {getHealthFactorStatus(position.healthFactor)}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={Math.min(
                            100,
                            position.healthFactor === 999
                              ? 100
                              : (position.healthFactor / 2) * 100,
                          )}
                          className="h-2"
                        />
                        <div
                          className="absolute top-0 w-px h-2 bg-red-400"
                          style={{ left: "60%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Liquidation</span>
                        <span>Safe</span>
                      </div>
                    </div>

                    {position.healthFactor < 1.3 && (
                      <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">
                          Position at risk! Consider repaying or adding
                          collateral.
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-glass flex-1"
                        onClick={async () => {
                          if (!address) return;

                          try {
                            // For demo purposes, add 50 units of collateral
                            const response = await lendingApi.addCollateral(
                              position.id,
                              {
                                userAddress: address,
                                amount: 50,
                              },
                            );

                            if (response.success) {
                              toast({
                                title: "Collateral added!",
                                description:
                                  "Successfully added 50 tCO2e as collateral",
                              });
                              await loadPositions();
                            } else {
                              throw new Error(
                                response.error || "Failed to add collateral",
                              );
                            }
                          } catch (error) {
                            toast({
                              title: "Failed to add collateral",
                              description: errorHandler.handleError(error),
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Collateral
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-glass flex-1"
                        onClick={() => {
                          setSelectedPosition(position);
                          setRepayDialogOpen(true);
                        }}
                        disabled={position.borrowedAmount === 0}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Repay
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Repay Dialog */}
        <Dialog open={repayDialogOpen} onOpenChange={setRepayDialogOpen}>
          <DialogContent className="glass-card border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Repay Loan
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Repay your outstanding loan to reduce your debt and improve your
                health factor.
              </DialogDescription>
            </DialogHeader>

            {selectedPosition && (
              <div className="space-y-6">
                <div className="p-4 glass rounded-lg">
                  <h4 className="font-semibold text-white mb-2">
                    {selectedPosition.projectName}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Outstanding debt:
                      </span>
                      <span className="text-white">
                        {selectedPosition.borrowedAmount.toLocaleString()}{" "}
                        xc3USD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Health factor:
                      </span>
                      <span
                        className={getHealthFactorColor(
                          selectedPosition.healthFactor,
                        )}
                      >
                        {selectedPosition.healthFactor.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repay-amount" className="text-white">
                      Repay Amount (xc3USD)
                    </Label>
                    <Input
                      id="repay-amount"
                      type="number"
                      value={repayData.amount}
                      onChange={(e) =>
                        setRepayData({ ...repayData, amount: e.target.value })
                      }
                      className="glass border-white/20 text-white"
                      placeholder="0"
                      max={selectedPosition.borrowedAmount}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Available to repay:{" "}
                        {selectedPosition.borrowedAmount.toLocaleString()}{" "}
                        xc3USD
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setRepayData({
                            amount: selectedPosition.borrowedAmount.toString(),
                          })
                        }
                        className="text-neon-cyan hover:text-neon-cyan/80 h-auto p-0"
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  {repayData.amount && (
                    <div className="p-4 glass rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          New health factor:
                        </span>
                        <span
                          className={getHealthFactorColor(
                            selectedPosition.borrowedAmount -
                              parseFloat(repayData.amount) >
                              0
                              ? (selectedPosition.collateralValue * 0.8) /
                                  (selectedPosition.borrowedAmount -
                                    parseFloat(repayData.amount))
                              : 999,
                          )}
                        >
                          {selectedPosition.borrowedAmount -
                            parseFloat(repayData.amount) >
                          0
                            ? (
                                (selectedPosition.collateralValue * 0.8) /
                                (selectedPosition.borrowedAmount -
                                  parseFloat(repayData.amount))
                              ).toFixed(2)
                            : "∞"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setRepayDialogOpen(false)}
                    className="btn-glass flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRepay}
                    className="btn-neon flex-1"
                    disabled={
                      isProcessing ||
                      !repayData.amount ||
                      parseFloat(repayData.amount) >
                        selectedPosition.borrowedAmount
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Repaying...
                      </>
                    ) : (
                      "Repay Loan"
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
