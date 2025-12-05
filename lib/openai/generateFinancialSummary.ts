import { openai } from "./client";



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
    const prompt = `You are an expert financial analyst providing personalized insights to help users understand and improve their financial health.

Analyze the following financial data and create a comprehensive yet concise summary that is insightful, actionable, and easy to understand.

FINANCIAL DATA:
${JSON.stringify(data, null, 2)}

ANALYSIS REQUIREMENTS:

1. **Financial Health Overview** (2-3 sentences)
   - Provide a clear assessment of their overall financial position
   - Compare income vs. expenses with specific percentages
   - Highlight whether they're saving, breaking even, or overspending

2. **Spending Patterns & Insights** (2-3 sentences)
   - Identify the dominant spending categories with specific amounts
   - Point out any concerning trends or positive habits
   - Compare spending across different months if data is available

3. **Actionable Recommendations** (2-3 sentences)
   - Provide 2-3 specific, practical suggestions for improvement
   - If anomalies exist, explain them and suggest next steps
   - Offer personalized advice based on their spending patterns

TONE & STYLE:
- Professional yet friendly and approachable
- Use clear, jargon-free language
- Be encouraging and constructive, not judgmental
- Use specific numbers and percentages to add credibility
- Keep the total response to 3 concise paragraphs maximum

IMPORTANT:
- Focus on actionable insights, not just data repetition
- Highlight both positive behaviors and areas for improvement
- Make recommendations specific to their actual spending patterns
- If net change is negative, be tactful but honest about the situation`;

    const response = await openai.chat.completions.create({
       model: "amazon/nova-2-lite-v1:free",
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
