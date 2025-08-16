import { Tool } from 'langchain/tools';

/**
 * Converts USD to INR using a fixed exchange rate.
 */
class CurrencyConverterTool extends Tool {
  constructor() {
    super();
    this.name = 'currency_converter';
    this.description = `Convert USD amounts to Indian Rupees (INR).
Use when the user explicitly asks to convert or expresses an amount in USD wanting INR.
Input: a positive number (USD amount). Example: "250"`;
  }

  async _call(input) {
    const n = parseFloat(String(input).trim());
    if (isNaN(n) || n < 0) {
      return 'Error: provide a positive numeric USD amount.';
    }
    const rate = 83.5;
    const inr = n * rate;
    return `USD ${n.toFixed(2)} = INR ${inr.toFixed(2)} (rate 1 USD = ${rate})`;
  }
}

export { CurrencyConverterTool };