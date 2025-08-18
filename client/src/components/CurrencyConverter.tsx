import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CurrencyConverter = () => {
  const [usdAmount, setUsdAmount] = useState("");
  const [inrAmount, setInrAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(83.12); // Mock rate
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (usdAmount) {
      const converted = (parseFloat(usdAmount) * exchangeRate).toFixed(2);
      setInrAmount(converted);
    } else {
      setInrAmount("");
    }
  }, [usdAmount, exchangeRate]);

  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
  };

  const handleInrChange = (value: string) => {
    setInrAmount(value);
    if (value) {
      const converted = (parseFloat(value) / exchangeRate).toFixed(2);
      setUsdAmount(converted);
    } else {
      setUsdAmount("");
    }
  };

  const refreshRate = () => {
    // Simulate rate refresh
    const newRate = 83.12 + (Math.random() - 0.5) * 2;
    setExchangeRate(Number(newRate.toFixed(2)));
    setLastUpdated(new Date());
  };

  return (
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Currency Converter</h3>
        <Button variant="outline" size="sm" onClick={refreshRate}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 p-3 bg-gradient-secondary rounded-lg">
          <TrendingUp className="h-5 w-5 text-financial-info" />
          <div>
            <p className="font-medium text-foreground">1 USD = {exchangeRate} INR</p>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="usd">USD Amount</Label>
            <Input
              id="usd"
              type="number"
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="Enter USD amount"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">US Dollars</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inr">INR Amount</Label>
            <Input
              id="inr"
              type="number"
              value={inrAmount}
              onChange={(e) => handleInrChange(e.target.value)}
              placeholder="Enter INR amount"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">Indian Rupees</p>
          </div>
        </div>

        {usdAmount && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-center text-lg font-medium text-foreground">
              ${usdAmount} USD = ₹{inrAmount} INR
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CurrencyConverter;