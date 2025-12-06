import { Tool } from 'ai';
import { z } from 'zod';
import { executeGetAccountBalance, executeWithdraw, executeTransfer } from './executeTools';

export const createFinancialTools = (userId: string): Record<string, Tool> => ({
  get_account_balance: {
    description: "Get the current balance of the user's account. Use this when the user asks about their balance or available funds.",
    inputSchema: z.object({}), // Empty object for no parameters
    execute: async () => {
      return await executeGetAccountBalance(userId, undefined);
    },
  },

  withdraw_money: {
    description: "Withdraw money from the user's account. Use this when the user wants to withdraw cash.",
    inputSchema: z.object({
      accountId: z.string().describe("The account ID to withdraw from"),
      amount: z.number().describe("The amount to withdraw in dollars"),
    }),
    execute: async ({ accountId, amount }: { accountId: string; amount: number }) => {
      return await executeWithdraw(userId, accountId, amount);
    },
  },

  transfer_money: {
    description: "Transfer money between accounts or to another user.",
    inputSchema: z.object({
      fromAccountId: z.string().describe("The account ID to transfer from"),
      toAccountId: z.string().optional().describe("The account ID to transfer to"),
      recipientEmail: z.string().optional().describe("The email of the recipient user"),
      amount: z.number().describe("The amount to transfer in dollars"),
      description: z.string().optional().describe("Optional description"),
    }),
    execute: async ({ fromAccountId, toAccountId, recipientEmail, amount, description }: { fromAccountId: string; toAccountId?: string; recipientEmail?: string; amount: number; description?: string }) => {
      return await executeTransfer(userId, fromAccountId, amount, toAccountId, recipientEmail, description);
    },
  },
});


