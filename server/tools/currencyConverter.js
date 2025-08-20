import { Tool } from 'langchain/tools';

/**
 * Converts USD to INR using a fixed exchange rate.
 */
class CurrencyConverterTool extends Tool {
  constructor() {
    super();
    this.name = 'currency_converter';
    this.description = `Convert one or many USD amounts to Indian Rupees (INR) using a fixed illustrative rate.
Use when the user: asks for INR, says they don't understand USD, mentions rupees/₹, or requests conversion.
Input formats accepted:
  • A single number: 250
  • Comma-separated numbers: 4500,1800,1000
  • Free text containing $ or USD amounts (the tool will extract): "$4,500 + $1,800 + $1,000"
Output: A list of conversions and the rate used. If multiple values appear, include each and a total.
IMPORTANT: Do NOT decline; you have the conversion capability.`;
  }

  async _call(input) {
    const raw = String(input || '').trim();
    const rate = 83.5; // illustrative static rate

    // Extract numeric USD amounts (with optional $ and commas)
    const numberPattern = /\$?\b\d[\d,]*(?:\.\d+)?\b/g;
    let matches = raw.match(numberPattern) || [];

    // If raw is just a simple number (no commas, no spaces) ensure it's included
    if (!matches.length && /^\d+(?:\.\d+)?$/.test(raw)) {
      matches = [raw];
    }

    // Deduplicate while preserving order
    const cleaned = [];
    for (const m of matches) {
      const numStr = m.replace(/[$,]/g, '');
      if (!cleaned.includes(numStr)) cleaned.push(numStr);
    }

    const values = cleaned
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v) && v >= 0);

    if (!values.length) {
      return 'Error: no valid USD amounts detected.';
    }

    const lines = values.map(v => {
      const inr = v * rate;
      return `USD ${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} = INR ${inr.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    });

    if (values.length > 1) {
      const totalUsd = values.reduce((a,b)=>a+b,0);
      const totalInr = totalUsd * rate;
      lines.push('---');
      lines.push(`TOTAL USD ${totalUsd.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} = INR ${totalInr.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`);
    }

    lines.push(`(Rate used: 1 USD = ${rate} INR)`);
    return lines.join('\n');
  }
}

export { CurrencyConverterTool };