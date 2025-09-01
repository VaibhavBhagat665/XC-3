import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useWeb3 } from "../hooks/useWeb3";
import { useToast } from "../hooks/use-toast";
import {
  activityApi,
  metricsApi,
  creditsApi,
  marketApi,
  lendingApi,
  errorHandler,
} from "../lib/api";
import { ConnectKitButton } from "connectkit";
import {
  Activity as ActivityIcon,
  TrendingUp,
  Wallet,
  ShoppingCart,
  Zap,
  Users,
  Globe,
  ArrowRightLeft,
  DollarSign,
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  BarChart3,
} from "lucide-react";

interface DashboardMetrics {
  totalCreditsMinted: number;
  creditsRetired: number;
  totalValueLocked: number;
  activeProjects: number;
  averageVerificationScore: number;
  networkStatus: {
    [key: string]: {
      status: string;
      blockNumber: number;
    };
  };
}

interface ActivityItem {
  id: number;
  action_type: string;
  project_name?: string;
  credit_amount?: number;
  transaction_hash?: string;
  created_at: string;
  details?: any;
}

export default function Activity() {
  const { address, isConnected } = useWeb3();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [userBalance, setUserBalance] = useState<any[]>([]);

  // Removed mock data - using real API data only

  useEffect(() => {
    loadDashboardData();
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setMetricsLoading(true);

      // Load protocol metrics
      const metricsResponse = await metricsApi.get();
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      } else {
        setMetrics(null);
      }
      setMetricsLoading(false);

      // Load user-specific data if connected
      if (isConnected && address) {
        try {
          // Load user activity
          const activityResponse = await activityApi.getUserActivity(
            address,
            100,
          );
          if (activityResponse.success && activityResponse.data) {
            setUserActivity(activityResponse.data);
          } else {
            console.error(
              "Failed to load user activity:",
              activityResponse.error,
            );
            setUserActivity([]);
          }

          // Load activity stats
          const statsResponse = await activityApi.getActivityStats();
          if (statsResponse.success && statsResponse.data) {
            setActivityStats(statsResponse.data);
          } else {
            console.warn("Failed to load activity stats:", statsResponse.error);
          }

          // Load user credit balance
          const balanceResponse = await creditsApi.getUserBalance(address);
          if (balanceResponse.success && balanceResponse.data) {
            setUserBalance(balanceResponse.data);
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          setUserActivity([]);
        }
      }

      // Load recent protocol activity
      try {
        const recentResponse = await activityApi.getRecentActivity(50);
        if (recentResponse.success && recentResponse.data) {
          setRecentActivity(recentResponse.data);
        } else {
          console.error(
            "Failed to load recent activity:",
            recentResponse.error,
          );
          setRecentActivity([]);
        }
      } catch (error) {
        console.error("Failed to load recent activity:", error);
        setRecentActivity([]);
      }
    } catch (error) {
      toast({
        title: "Failed to load dashboard",
        description: errorHandler.handleError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "project_registered":
        return <FileCheck className="w-4 h-4 text-neon-cyan" />;
      case "verification_completed":
      case "verification_started":
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case "credits_purchased":
      case "credits_minted":
        return <Zap className="w-4 h-4 text-neon-purple" />;
      case "market_listing_created":
        return <ShoppingCart className="w-4 h-4 text-neon-pink" />;
      case "lending_position_created":
        return <Wallet className="w-4 h-4 text-neon-orange" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-white/60" />;
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Protocol <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-lg text-white/70">
            Real-time overview of your activity and protocol metrics
          </p>
        </div>

        {/* Protocol Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-neon-green" />
                <span className="text-sm text-muted-foreground">
                  Credits Minted
                </span>
              </div>
              {metricsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {(metrics?.totalCreditsMinted || 0).toLocaleString()}
                </div>
              )}
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-neon-purple" />
                <span className="text-sm text-muted-foreground">
                  Credits Retired
                </span>
              </div>
              {metricsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {(metrics?.creditsRetired || 0).toLocaleString()}
                </div>
              )}
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-neon-cyan" />
                <span className="text-sm text-muted-foreground">
                  Total Value Locked
                </span>
              </div>
              {metricsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  ${((metrics?.totalValueLocked || 0) / 1000000).toFixed(1)}M
                </div>
              )}
            </div>
          </Card>

          <Card className="crypto-card">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-neon-pink" />
                <span className="text-sm text-muted-foreground">
                  Active Projects
                </span>
              </div>
              {metricsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {(metrics?.activeProjects || 0).toLocaleString()}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Activity Statistics */}
        {activityStats && (
          <Card className="crypto-card mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-neon-cyan" />
                Protocol Activity Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 glass rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-cyan">
                    {activityStats.total_transactions}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Transactions
                  </div>
                </div>
                <div className="p-3 glass rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-purple">
                    {activityStats.total_lending_positions}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Lending Positions
                  </div>
                </div>
                <div className="p-3 glass rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-green">
                    {activityStats.active_users}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div className="p-3 glass rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-pink">
                    {activityStats.last_24h_transactions}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    24h Transactions
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Network Status */}
        {metrics && (
          <Card className="crypto-card mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-neon-cyan" />
                Network Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metrics.networkStatus).map(
                  ([network, status]) => (
                    <div
                      key={network}
                      className="flex items-center justify-between p-3 glass rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                        <span className="text-white capitalize">{network}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-neon-green">
                          {status.status}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Block: {status.blockNumber.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity */}
          <Card className="crypto-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ActivityIcon className="w-5 h-5 mr-2 text-neon-cyan" />
                  {isConnected ? "Your Activity" : "Recent Activity"}
                </h3>
                {isConnected && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-glass"
                    onClick={loadDashboardData}
                  >
                    Refresh
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 glass rounded-lg animate-pulse"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/20 rounded w-3/4" />
                        <div className="h-3 bg-white/20 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(isConnected ? userActivity : recentActivity).map(
                    (activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 glass rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="mt-1">
                          {getActionIcon(activity.action_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {formatActionType(activity.action_type)}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.created_at)}
                            </span>
                          </div>
                          {activity.project_name && (
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.project_name}
                            </p>
                          )}
                          {activity.credit_amount && (
                            <p className="text-sm text-neon-cyan">
                              {activity.credit_amount.toLocaleString()} tCO2e
                            </p>
                          )}
                          {activity.details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.details.score &&
                                `AI Score: ${(activity.details.score * 100).toFixed(1)}%`}
                              {activity.details.total &&
                                `Total: $${activity.details.total.toLocaleString()}`}
                              {activity.details.collateral_value &&
                                `Collateral: $${activity.details.collateral_value.toLocaleString()}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {!isConnected && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ActivityIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connect to See Your Activity
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to see your personal transaction
                    history, project activities, and lending positions
                  </p>
                  <ConnectKitButton.Custom>
                    {({ show }) => (
                      <Button className="btn-neon" onClick={show}>
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              )}
            </div>
          </Card>

          {/* User Portfolio */}
          <Card className="crypto-card">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-neon-purple" />
                {isConnected ? "Your Portfolio" : "Protocol Overview"}
              </h3>

              {isConnected ? (
                userBalance.length > 0 ? (
                  <div className="space-y-3">
                    {userBalance.map((balance, index) => (
                      <div key={index} className="p-3 glass rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-white">
                              {balance.project_name ||
                                `Credit #${balance.token_id}`}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {balance.methodology} • Vintage{" "}
                              {balance.vintage_year}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-neon-cyan">
                              {balance.amount.toLocaleString()} tCO2e
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ~$
                              {(
                                balance.amount * (balance.price || 25)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No carbon credits in your portfolio yet
                    </p>
                    <Button
                      className="btn-neon"
                      onClick={() => (window.location.href = "/market")}
                    >
                      Browse Market
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="p-4 glass rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">
                        Average Verification Score
                      </span>
                      <span className="text-neon-green font-bold">
                        {(
                          (metrics?.averageVerificationScore || 0) * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(metrics?.averageVerificationScore || 0) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 glass rounded-lg text-center">
                      <div className="text-lg font-bold text-neon-cyan">
                        24h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Verification Time
                      </div>
                    </div>
                    <div className="p-3 glass rounded-lg text-center">
                      <div className="text-lg font-bold text-neon-green">
                        99.9%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-muted-foreground mb-4">
                      Connect to see your portfolio and trading history
                    </p>
                    <ConnectKitButton.Custom>
                      {({ show }) => (
                        <Button className="btn-neon" onClick={show}>
                          Connect Wallet
                        </Button>
                      )}
                    </ConnectKitButton.Custom>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="crypto-card mt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-neon-pink" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                className="btn-glass h-20 flex-col space-y-2"
                onClick={() => (window.location.href = "/projects")}
              >
                <FileCheck className="w-6 h-6" />
                <span>Register Project</span>
              </Button>
              <Button
                className="btn-glass h-20 flex-col space-y-2"
                onClick={() => (window.location.href = "/market")}
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Browse Market</span>
              </Button>
              <Button
                className="btn-glass h-20 flex-col space-y-2"
                onClick={() => (window.location.href = "/lend")}
              >
                <Wallet className="w-6 h-6" />
                <span>Lending</span>
              </Button>
              <Button
                className="btn-glass h-20 flex-col space-y-2"
                onClick={() => (window.location.href = "/wallet")}
              >
                <ArrowRightLeft className="w-6 h-6" />
                <span>Wallet</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
