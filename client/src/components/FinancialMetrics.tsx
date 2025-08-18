import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, isPositive, icon }: MetricCardProps) => {
  return (
    <Card className="p-4 shadow-elegant hover:shadow-financial transition-smooth">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-secondary rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${
          isPositive ? "text-financial-success" : "text-financial-error"
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
    </Card>
  );
};

const FinancialMetrics = () => {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      isPositive: true,
      icon: <DollarSign className="h-5 w-5 text-financial-success" />,
    },
    {
      title: "Net Profit",
      value: "$456K",
      change: "+8.2%",
      isPositive: true,
      icon: <TrendingUp className="h-5 w-5 text-financial-success" />,
    },
    {
      title: "Operating Expenses",
      value: "$1.2M",
      change: "-3.1%",
      isPositive: true,
      icon: <BarChart3 className="h-5 w-5 text-financial-warning" />,
    },
    {
      title: "Cash Flow",
      value: "$789K",
      change: "-2.4%",
      isPositive: false,
      icon: <TrendingDown className="h-5 w-5 text-financial-info" />,
    },
  ];

  return (
    <Card className="p-6 shadow-elegant">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Key Financial Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            isPositive={metric.isPositive}
            icon={metric.icon}
          />
        ))}
      </div>
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          Metrics will update automatically when you upload and analyze financial documents
        </p>
      </div>
    </Card>
  );
};

export default FinancialMetrics;