import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { handleApiError } from "@/lib/api";

// Define type for currency conversion response
interface CurrencyConversionResponse {
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

const CurrencyConverter = () => {
  const [usdAmount, setUsdAmount] = useState("");
  const [inrAmount, setInrAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(83.12);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { toast } = useToast();

  // Currency conversion API call
  const { mutate: convertCurrency, isPending: isConverting } = useMutation({
    mutationFn: async (amount: string): Promise<CurrencyConversionResponse> => {
      const response = await fetch('http://localhost:3000/api/test-currency-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, fromCurrency: 'USD', toCurrency: 'INR' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Currency conversion failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setExchangeRate(data.rate || 83.12);
      setLastUpdated(new Date());
      
      // Update the INR value based on current USD input
      if (usdAmount) {
        const converted = (parseFloat(usdAmount) * data.rate).toFixed(2);
        setInrAmount(converted);
      }
      
      toast({
        title: "Exchange rate updated",
        description: `Current rate: 1 USD = ${data.rate} INR`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update rate",
        description: handleApiError(error),
        variant: "destructive",
      });
    }
  });

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
    // Use the real API to get the current rate
    convertCurrency(usdAmount || "100");
  };

  return (
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Currency Converter</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshRate}
          disabled={isConverting}
        >
          {isConverting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
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