import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAdminListInvestors,
  useAdminListDeposits,
  useAdminUpdateInvestorStatus,
  useAdminUpdateDepositStatus,
  useCreditInvestor,
  useGetDepositAddresses,
  useUpdateDepositAddress,
  getAdminListInvestorsQueryKey,
  getAdminListDepositsQueryKey,
  getGetDepositAddressesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

const LICENSE_KEY = "StockdevA";

// ─── License Gate ────────────────────────────────────────────────────────────
function LicenseGate({ onUnlock }: { onUnlock: () => void }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === LICENSE_KEY) {
      sessionStorage.setItem("spcx_admin_unlocked", "1");
      onUnlock();
    } else {
      setError("Invalid license key. Access denied.");
      setKey("");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0f16] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 border border-white/10 bg-white/5 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white/40" />
          </div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">SPCX Admin</h1>
          <p className="text-white/40 text-sm mt-2 tracking-wide">Enter your license key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(""); }}
              placeholder="License key"
              className="w-full h-14 px-4 pr-12 bg-black/40 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 font-mono text-sm tracking-widest"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!key}
            className="w-full h-14 bg-white text-black font-display font-bold uppercase tracking-widest text-sm disabled:opacity-40 hover:bg-white/90 transition-colors"
          >
            Unlock Admin Panel
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6 tracking-widest uppercase">
          Authorized access only
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
function AdminPanel() {
  const queryClient = useQueryClient();

  const { data: investors } = useAdminListInvestors({
    query: { refetchInterval: 15000, queryKey: getAdminListInvestorsQueryKey() }
  });
  const { data: deposits } = useAdminListDeposits({
    query: { refetchInterval: 15000, queryKey: getAdminListDepositsQueryKey() }
  });
  const { data: addresses } = useGetDepositAddresses({
    query: { queryKey: getGetDepositAddressesQueryKey() }
  });

  const updateInvestor = useAdminUpdateInvestorStatus();
  const updateDeposit  = useAdminUpdateDepositStatus();
  const creditInvestor = useCreditInvestor();
  const updateAddress  = useUpdateDepositAddress();

  const [investorFilter, setInvestorFilter] = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [creditSearch,  setCreditSearch]  = useState("");
  const [creditShares,  setCreditShares]  = useState("");
  const [creditPrice,   setCreditPrice]   = useState("147.62");

  const handleInvestorStatus = (id: number, status: "approved"|"rejected") => {
    updateInvestor.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success(`Investor ${status}`);
          queryClient.invalidateQueries({ queryKey: getAdminListInvestorsQueryKey() });
        },
        onError: (err) => toast.error(err.message || "Failed to update status"),
      }
    );
  };

  const handleDepositStatus = (id: number, status: "completed"|"failed") => {
    updateDeposit.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success(`Deposit marked as ${status}`);
          queryClient.invalidateQueries({ queryKey: getAdminListDepositsQueryKey() });
        },
        onError: (err) => toast.error(err.message || "Failed to update deposit"),
      }
    );
  };

  const handleCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const investor = investors?.find((i) => i.email.toLowerCase() === creditSearch.toLowerCase());
    if (!investor) { toast.error("Investor not found."); return; }
    if (!creditShares || isNaN(Number(creditShares))) { toast.error("Invalid shares amount."); return; }

    creditInvestor.mutate(
      { id: investor.id, data: { shares: Number(creditShares), pricePerShare: Number(creditPrice) } },
      {
        onSuccess: () => {
          toast.success(`Credited ${creditShares} shares to ${investor.email}`);
          setCreditSearch(""); setCreditShares("");
          queryClient.invalidateQueries({ queryKey: getAdminListInvestorsQueryKey() });
        },
        onError: (err) => toast.error(err.message || "Failed to credit shares"),
      }
    );
  };

  const handleSaveAddress = (coin: "BTC"|"ETH"|"DOGE", address: string) => {
    updateAddress.mutate(
      { coin, data: { address } },
      {
        onSuccess: () => {
          toast.success(`${coin} address updated`);
          queryClient.invalidateQueries({ queryKey: getGetDepositAddressesQueryKey() });
        },
        onError: (err) => toast.error(err.message || "Failed to update address"),
      }
    );
  };

  const filteredInvestors = investors?.filter((i) =>
    investorFilter === "all" ? true : i.status === investorFilter
  );

  const selectedForCredit = investors?.find(
    (i) => i.email.toLowerCase() === creditSearch.toLowerCase()
  );

  const AddressRow = ({ coin, initialAddress }: { coin: "BTC"|"ETH"|"DOGE"; initialAddress: string }) => {
    const [addr, setAddr] = useState(initialAddress);
    return (
      <div className="flex items-center gap-4 py-4 border-b border-white/10 last:border-0">
        <div className="w-16 font-display font-bold tracking-widest text-lg text-white">{coin}</div>
        <Input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          className="font-mono bg-black/40 border-white/20 flex-1 text-white"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSaveAddress(coin, addr)}
          disabled={addr === initialAddress}
        >
          Save
        </Button>
      </div>
    );
  };

  const statusBadge = (s: string) =>
    s === "approved" || s === "completed"
      ? "success"
      : s === "pending"
      ? "warning"
      : "destructive";

  return (
    <div className="min-h-[100dvh] bg-[#0d1117] text-white">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#0d1117] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1a8a4a]" />
          <span className="font-display tracking-widest font-bold text-xl uppercase text-white">SPCX Admin Panel</span>
          <span className="text-xs font-display tracking-widest uppercase text-white/40">Mission Control</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-display tracking-widest uppercase text-white/50">
          <div>Investors: <span className="text-white font-bold">{investors?.length ?? 0}</span></div>
          <div>Pending Req: <span className="text-yellow-400 font-bold">{investors?.filter((i) => i.status === "pending").length ?? 0}</span></div>
          <div className="hidden sm:block">Deposits: <span className="text-white font-bold">{deposits?.length ?? 0}</span></div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <Tabs defaultValue="investors" className="w-full">
          <TabsList className="bg-black/40 border border-white/10 mb-6 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="investors">Access Requests</TabsTrigger>
            <TabsTrigger value="deposits">Payment Verification</TabsTrigger>
            <TabsTrigger value="credit">Credit Shares</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Addresses</TabsTrigger>
          </TabsList>

          {/* ── Access Requests ─────────────────────────── */}
          <TabsContent value="investors">
            <Card className="bg-black/20 border-white/10">
              <CardContent className="p-0">
                <div className="p-4 border-b border-white/10 flex gap-2 flex-wrap">
                  {(["all","pending","approved","rejected"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setInvestorFilter(f)}
                      className={`px-3 py-1 text-xs font-display uppercase tracking-widest border transition-colors ${
                        investorFilter === f
                          ? "border-primary text-primary bg-primary/10"
                          : "border-white/10 text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {f} {f === "all" ? `(${investors?.length ?? 0})` : `(${investors?.filter(i => i.status === f).length ?? 0})`}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvestors?.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.fullName}</TableCell>
                          <TableCell className="text-white/70">{inv.email}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge(inv.status) as any} className="text-[10px] uppercase tracking-wider">
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/50">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono">{inv.shares ?? 0}</TableCell>
                          <TableCell className="text-right">
                            {inv.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 border-[#1a8a4a] text-[#1a8a4a] hover:bg-[#1a8a4a]/20" onClick={() => handleInvestorStatus(inv.id, "approved")}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-red-500 text-red-500 hover:bg-red-500/20" onClick={() => handleInvestorStatus(inv.id, "rejected")}>
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredInvestors?.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-white/30">
                            No investors found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Payment Verification ─────────────────────── */}
          <TabsContent value="deposits">
            <Card className="bg-black/20 border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Investor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits?.map((dep) => (
                        <TableRow key={dep.id}>
                          <TableCell>
                            <div className="font-medium">{dep.fullName}</div>
                            <div className="text-xs text-white/50">{dep.email}</div>
                          </TableCell>
                          <TableCell className="font-mono text-[#1a8a4a] font-bold">${Number(dep.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="uppercase text-xs font-display tracking-widest text-white/60">{dep.method}</div>
                            {dep.coin && <div className="font-bold text-sm">{dep.coin}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge(dep.status) as any} className="text-[10px] uppercase tracking-wider">
                              {dep.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/50 text-sm">{new Date(dep.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {dep.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 border-[#1a8a4a] text-[#1a8a4a] hover:bg-[#1a8a4a]/20" onClick={() => handleDepositStatus(dep.id, "completed")}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-red-500 text-red-500 hover:bg-red-500/20" onClick={() => handleDepositStatus(dep.id, "failed")}>
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!deposits?.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-white/30">
                            No deposits recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Credit Shares ────────────────────────────── */}
          <TabsContent value="credit">
            <Card className="bg-black/20 border-white/10 max-w-2xl">
              <CardContent className="p-6">
                <form onSubmit={handleCredit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-display text-white/70">Investor Email</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Exact investor email..."
                        value={creditSearch}
                        onChange={(e) => setCreditSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {selectedForCredit && (
                    <div className="p-4 border border-white/10 bg-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{selectedForCredit.fullName}</div>
                        <div className="text-xs text-white/50 mt-0.5">{selectedForCredit.email}</div>
                        <Badge variant={statusBadge(selectedForCredit.status) as any} className="mt-2 text-[10px]">
                          {selectedForCredit.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/50 uppercase font-display tracking-widest">Current Holdings</div>
                        <div className="font-mono text-2xl font-bold text-white">{selectedForCredit.shares ?? 0}</div>
                        <div className="text-xs text-white/30">shares</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-display text-white/70">Shares to Credit</label>
                      <Input
                        type="number"
                        value={creditShares}
                        onChange={(e) => setCreditShares(e.target.value)}
                        className="bg-black/40 border-white/20 font-mono text-lg text-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-display text-white/70">Price Per Share ($)</label>
                      <Input
                        type="number"
                        value={creditPrice}
                        onChange={(e) => setCreditPrice(e.target.value)}
                        className="bg-black/40 border-white/20 font-mono text-lg text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={!selectedForCredit || creditInvestor.isPending}
                  >
                    {creditInvestor.isPending ? "Processing..." : "Credit Shares"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Crypto Addresses ─────────────────────────── */}
          <TabsContent value="crypto">
            <Card className="bg-black/20 border-white/10 max-w-3xl">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl uppercase tracking-widest text-white">Deposit Addresses</h3>
                  <p className="text-sm text-white/50 mt-1">Update the master wallet addresses shown to users during the deposit flow.</p>
                </div>
                <div>
                  {addresses?.map((addr) => (
                    <AddressRow key={addr.coin} coin={addr.coin as "BTC"|"ETH"|"DOGE"} initialAddress={addr.address} />
                  ))}
                  {!addresses?.length && (
                    <p className="text-white/30 text-sm py-4">No addresses configured.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ─── Entry point with gate ────────────────────────────────────────────────────
export default function Admin() {
  const [unlocked, setUnlocked] = useState(() =>
    sessionStorage.getItem("spcx_admin_unlocked") === "1"
  );

  if (!unlocked) {
    return <LicenseGate onUnlock={() => setUnlocked(true)} />;
  }

  return <AdminPanel />;
}
