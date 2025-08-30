import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { useWeb3 } from "../hooks/useWeb3";
import { useToast } from "../hooks/use-toast";
import { ConnectKitButton } from "connectkit";
import { marketApi, errorHandler } from "../lib/api";
import {
  ShoppingCart,
  TrendingUp,
  Filter,
  MapPin,
  Calendar,
  Zap,
  ExternalLink,
  Loader2,
  Plus,
  DollarSign,
} from "lucide-react";

interface CreditListing {
  id: number;
  tokenId: number;
  projectName: string;
  location: string;
  methodology: string;
  vintage: number;
  amount: number;
  pricePerCredit: number;
  totalPrice: number;
  seller: string;
  sellerName?: string;
  verificationScore?: number;
  createdAt: string;
  expiresAt?: string;
}

export default function Market() {
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();

  const [listings, setListings] = useState<CreditListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [filteredListings, setFilteredListings] = useState(listings);
  const [filters, setFilters] = useState({
    methodology: "all",
    vintage: "all",
    minPrice: "",
    maxPrice: "",
    location: "",
    sortBy: "priceAsc",
  });

  const [selectedListing, setSelectedListing] = useState<CreditListing | null>(
    null,
  );
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [sellData, setSellData] = useState({
    tokenId: "",
    amount: "",
    pricePerCredit: "",
  });

  // Load listings from API
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await marketApi.getListings();
      if (response.success && response.data) {
        // Convert API response to CreditListing format
        const convertedListings = response.data.map((listing: any) => ({
          id: listing.id,
          tokenId: listing.project_id || listing.id,
          projectName: listing.project_name || "Carbon Credit Project",
          location: listing.project_location || "Global",
          methodology: listing.methodology || "VCS",
          vintage: listing.vintage_year || 2024,
          amount: listing.token_amount || listing.amount || 100,
          pricePerCredit:
            listing.price_per_token || listing.price_per_credit || 25,
          totalPrice:
            listing.total_value ||
            listing.token_amount * listing.price_per_token ||
            2500,
          seller: listing.seller_address,
          sellerName: listing.seller_name || "Anonymous",
          verificationScore: listing.verification_score || 0.85,
          createdAt: listing.listed_at || listing.created_at,
          expiresAt: listing.expires_at,
        }));
        setListings(convertedListings);
      } else {
        console.error("Market API failed:", response.error);
        setListings([]);
      }
    } catch (error) {
      console.error("Failed to load listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...listings];

    if (filters.methodology && filters.methodology !== "all") {
      filtered = filtered.filter(
        (listing) => listing.methodology === filters.methodology,
      );
    }
    if (filters.vintage && filters.vintage !== "all") {
      filtered = filtered.filter(
        (listing) => listing.vintage.toString() === filters.vintage,
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter(
        (listing) => listing.pricePerCredit >= parseFloat(filters.minPrice),
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (listing) => listing.pricePerCredit <= parseFloat(filters.maxPrice),
      );
    }
    if (filters.location) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(filters.location.toLowerCase()),
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "priceAsc":
        filtered.sort((a, b) => a.pricePerCredit - b.pricePerCredit);
        break;
      case "priceDesc":
        filtered.sort((a, b) => b.pricePerCredit - a.pricePerCredit);
        break;
      case "amountDesc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "scoreDesc":
        filtered.sort(
          (a, b) => (b.verificationScore || 0) - (a.verificationScore || 0),
        );
        break;
    }

    setFilteredListings(filtered);
  }, [listings, filters]);

  const handleBuy = async () => {
    if (!selectedListing || !buyAmount || !isConnected || !address) return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(buyAmount);
      const totalCost = amount * selectedListing.pricePerCredit;

      // Call API to purchase credits
      const response = await marketApi.purchaseCredits(selectedListing.id, {
        buyerAddress: address,
        tokenAmount: amount,
      });

      if (response.success) {
        toast({
          title: "Purchase successful!",
          description: `Bought ${amount} credits for $${totalCost.toLocaleString()}`,
        });

        // Reload listings to reflect the purchase
        await loadListings();

        setBuyDialogOpen(false);
        setBuyAmount("");
      } else {
        throw new Error(response.error || "Purchase failed");
      }
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSell = async () => {
    if (
      !sellData.tokenId ||
      !sellData.amount ||
      !sellData.pricePerCredit ||
      !isConnected ||
      !address
    )
      return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(sellData.amount);
      const pricePerCredit = parseFloat(sellData.pricePerCredit);

      // Call API to create listing
      const response = await marketApi.createListing({
        creditId: parseInt(sellData.tokenId),
        sellerAddress: address,
        amount: amount,
        pricePerCredit: pricePerCredit,
        currency: "USD",
      });

      if (response.success) {
        toast({
          title: "Listing created!",
          description: `Listed ${amount} credits at $${pricePerCredit} each`,
        });

        // Reload listings to show the new listing
        await loadListings();

        setSellDialogOpen(false);
        setSellData({ tokenId: "", amount: "", pricePerCredit: "" });
      } else {
        throw new Error(response.error || "Failed to create listing");
      }
    } catch (error) {
      toast({
        title: "Listing failed",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const methodologies = ["REDD+", "CDM", "VCS", "Gold Standard"];
  const vintages = ["2024", "2023", "2022", "2021"];

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingCart className="w-10 h-10 text-neon-cyan" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Carbon Credit <span className="text-gradient">Marketplace</span>
              </h1>
              <p className="text-xl text-white/70">
                Connect your wallet to trade verified carbon credits in the
                decentralized marketplace
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
              Carbon Credit <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-lg text-white/70 mt-2">
              Trade verified carbon credits with transparent pricing and instant
              settlement
            </p>
          </div>

          <div className="flex space-x-4">
            <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-neon">
                  <Plus className="w-5 h-5 mr-2" />
                  Sell Credits
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">
                    List Credits for Sale
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    List your carbon credits for sale on the marketplace.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-id" className="text-white">
                        Token ID
                      </Label>
                      <Input
                        id="token-id"
                        value={sellData.tokenId}
                        onChange={(e) =>
                          setSellData({ ...sellData, tokenId: e.target.value })
                        }
                        className="glass border-white/20 text-white"
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sell-amount" className="text-white">
                        Amount (tCO2e)
                      </Label>
                      <Input
                        id="sell-amount"
                        type="number"
                        value={sellData.amount}
                        onChange={(e) =>
                          setSellData({ ...sellData, amount: e.target.value })
                        }
                        className="glass border-white/20 text-white"
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price-per-credit" className="text-white">
                        Price per Credit ($)
                      </Label>
                      <Input
                        id="price-per-credit"
                        type="number"
                        step="0.01"
                        value={sellData.pricePerCredit}
                        onChange={(e) =>
                          setSellData({
                            ...sellData,
                            pricePerCredit: e.target.value,
                          })
                        }
                        className="glass border-white/20 text-white"
                        placeholder="25.00"
                      />
                    </div>

                    {sellData.amount && sellData.pricePerCredit && (
                      <div className="p-4 glass rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Value:
                          </span>
                          <span className="text-neon-cyan font-medium">
                            $
                            {(
                              parseFloat(sellData.amount) *
                              parseFloat(sellData.pricePerCredit)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setSellDialogOpen(false)}
                      className="btn-glass flex-1"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSell}
                      className="btn-neon flex-1"
                      disabled={
                        isProcessing ||
                        !sellData.tokenId ||
                        !sellData.amount ||
                        !sellData.pricePerCredit
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Listing"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-neon-cyan" />
                <span className="text-sm text-muted-foreground">
                  Active Listings
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredListings.length}
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-neon-green" />
                <span className="text-sm text-muted-foreground">
                  Total Volume
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredListings
                  .reduce((sum, listing) => sum + listing.amount, 0)
                  .toLocaleString()}
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-neon-purple" />
                <span className="text-sm text-muted-foreground">Avg Price</span>
              </div>
              <div className="text-2xl font-bold text-white">
                $
                {filteredListings.length > 0
                  ? (
                      filteredListings.reduce(
                        (sum, listing) => sum + listing.pricePerCredit,
                        0,
                      ) / filteredListings.length
                    ).toFixed(2)
                  : "0.00"}
              </div>
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-neon-pink" />
                <span className="text-sm text-muted-foreground">
                  Total Value
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                $
                {filteredListings
                  .reduce((sum, listing) => sum + listing.totalPrice, 0)
                  .toLocaleString()}
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="crypto-card mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Methodology</Label>
                <Select
                  value={filters.methodology}
                  onValueChange={(value) =>
                    setFilters({ ...filters, methodology: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="all">All</SelectItem>
                    {methodologies.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Vintage</Label>
                <Select
                  value={filters.vintage}
                  onValueChange={(value) =>
                    setFilters({ ...filters, vintage: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="all">All</SelectItem>
                    {vintages.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Min Price ($)</Label>
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="glass border-white/20 text-white"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Max Price ($)</Label>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="glass border-white/20 text-white"
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Location</Label>
                <Input
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="glass border-white/20 text-white"
                  placeholder="Search location"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sort By</Label>
                <Select
                  onValueChange={(value) =>
                    setFilters({ ...filters, sortBy: value })
                  }
                  defaultValue="priceAsc"
                >
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="amountDesc">
                      Amount: High to Low
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="scoreDesc">Best Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-neon-cyan mb-4" />
            <p className="text-muted-foreground">Loading market listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                No listings found
              </h3>
              <p className="text-muted-foreground">
                No carbon credits match your current filters. Try adjusting your
                search criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="crypto-card">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {listing.projectName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-cyan">
                        ${listing.pricePerCredit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per tCO2e
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Methodology:
                      </span>
                      <span className="text-white ml-2">
                        {listing.methodology}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vintage:</span>
                      <span className="text-white ml-2">{listing.vintage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <span className="text-neon-cyan ml-2">
                        {listing.amount.toLocaleString()} tCO2e
                      </span>
                    </div>
                    {listing.verificationScore && (
                      <div>
                        <span className="text-muted-foreground">AI Score:</span>
                        <span className="text-neon-green ml-2">
                          {(listing.verificationScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-sm">
                      <div className="text-muted-foreground">
                        Seller: {listing.sellerName || "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                        {listing.seller.slice(0, 6)}...
                        {listing.seller.slice(-4)}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="btn-neon"
                      onClick={() => {
                        setSelectedListing(listing);
                        setBuyDialogOpen(true);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Credits
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Buy Dialog */}
        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogContent className="glass-card border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Purchase Carbon Credits
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Purchase carbon credits from this marketplace listing.
              </DialogDescription>
            </DialogHeader>

            {selectedListing && (
              <div className="space-y-6">
                <div className="p-4 glass rounded-lg">
                  <h4 className="font-semibold text-white mb-2">
                    {selectedListing.projectName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedListing.location} • {selectedListing.methodology}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Price per credit:
                      </span>
                      <span className="text-neon-cyan">
                        ${selectedListing.pricePerCredit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="text-white">
                        {selectedListing.amount.toLocaleString()} tCO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-amount" className="text-white">
                      Amount to Purchase (tCO2e)
                    </Label>
                    <Input
                      id="buy-amount"
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="glass border-white/20 text-white"
                      placeholder="0"
                      max={selectedListing.amount}
                    />
                  </div>

                  {buyAmount && (
                    <div className="p-4 glass rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="text-white">{buyAmount} tCO2e</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Price per credit:
                        </span>
                        <span className="text-white">
                          ${selectedListing.pricePerCredit}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                        <span className="text-white">Total Cost:</span>
                        <span className="text-neon-cyan">
                          $
                          {(
                            parseFloat(buyAmount) *
                            selectedListing.pricePerCredit
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setBuyDialogOpen(false)}
                    className="btn-glass flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBuy}
                    className="btn-neon flex-1"
                    disabled={
                      isProcessing ||
                      !buyAmount ||
                      parseFloat(buyAmount) > selectedListing.amount
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase Credits"
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
