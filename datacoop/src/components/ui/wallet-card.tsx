"use client";

import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface WalletCardProps {
  balance: number;
  totalEarned: number;
  onWithdraw?: () => void;
  onAddFunds?: () => void;
  isBrand?: boolean;
}

export function WalletCard({ balance, totalEarned, onWithdraw, onAddFunds, isBrand = false }: WalletCardProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {isBrand ? "Brand Wallet" : "Your Wallet"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-primary">
          {formatCurrency(balance)}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total Earned: <span className="font-medium">{formatCurrency(totalEarned)}</span></span>
          {isBrand ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="5000"
                      placeholder="5000"
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Minimum ₹5,000</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={onAddFunds} disabled={!withdrawAmount || Number(withdrawAmount) < 5000}>
                    Proceed to Pay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              {balance >= 500 && onWithdraw && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowDown className="h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw to UPI</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="upi">UPI ID</Label>
                        <Input
                          id="upi"
                          placeholder="name@bank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="500"
                          max={balance}
                          placeholder="500"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum ₹500 • Available: {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={onWithdraw} disabled={!upiId || !withdrawAmount || Number(withdrawAmount) < 500 || Number(withdrawAmount) > balance}>
                        Request Withdrawal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}