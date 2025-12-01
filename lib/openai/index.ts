import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  topCategory: string;
  monthlyBreakdown: { month: string; income: number; expenses: number }[];
  categoryBreakdown: { category: string; total: number }[];
  anomalies: { merchant: string; amount: number; date: Date; reason: string }[];
}

export async function generateFinancialSummary(data: FinancialData): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Financial summary is not available because OpenAI API key is missing.";
  }

  try {
    const prompt = `
      Analyze the following financial data for a user and provide a concise, helpful summary (max 2 paragraphs).
      Highlight key trends, spending habits, and any anomalies.
      
      Data:
      ${JSON.stringify(data, null, 2)}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful financial assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return "Error generating financial summary.";
  }
}
