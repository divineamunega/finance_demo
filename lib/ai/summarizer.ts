import { generateText } from "ai";
import { aiClient } from "./client";


interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  topCategory: string;
  monthlyBreakdown: { month: string; income: number; expenses: number }[];
  categoryBreakdown: { category: string; total: number }[];
  anomalies: { merchant: string; amount: number; date: Date; reason: string }[];
}

const financialSummaryPrompt = `You are an expert financial analyst providing personalized insights to help users understand and improve their financial health.

Analyze the following financial data and create a comprehensive yet concise summary that is insightful, actionable, and easy to understand.

FINANCIAL DATA:
{financialData}

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

export async function generateFinancialSummary(data: FinancialData): Promise<string> {
  try {
    const model = "mistral/ministral-3b";


    const { text } = await generateText({
      model: aiClient(model),
      system: 'You are a helpful financial assistant.',
      prompt: financialSummaryPrompt.replace('{financialData}', JSON.stringify(data, null, 2)),
    });

    return text || "Unable to generate summary.";
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return "Error generating financial summary.";
  }
}
