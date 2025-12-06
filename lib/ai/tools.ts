import { Tool } from 'ai';
import { z } from 'zod';
import { executeGetAccountBalance, executeWithdraw, executeTransfer } from './executeTools';

export const createFinancialTools = (userId: string): Record<string, Tool> => ({
  get_account_balance: {
    description: "Get the current balance of the user's account. Use this when the user asks about their balance or available funds.",
    inputSchema: z.object({
      accountId: z.string().optional().describe("The account ID to check balance for. If not specified, use the user's primary account."),
    }),
    execute: async ({ accountId }: { accountId?: string }) => {
      return await executeGetAccountBalance(userId, accountId);
    },
  },

  withdraw_money: {
    description: "Withdraw money from the user's account. Use this when the user wants to withdraw cash or transfer money out of their account to external destinations.",
    inputSchema: z.object({
      accountId: z.string().describe("The account ID to withdraw from"),
      amount: z.number().describe("The amount to withdraw in dollars"),
    }),
    execute: async ({ accountId, amount }: { accountId: string; amount: number }) => {
      return await executeWithdraw(userId, accountId, amount);
    },
  },

  transfer_money: {
    description: "Transfer money between accounts or to another user. Use this when the user wants to send money to someone or move money between their own accounts.",
    inputSchema: z.object({
      fromAccountId: z.string().describe("The account ID to transfer from"),
      toAccountId: z.string().optional().describe("The account ID to transfer to (for transfers between own accounts)"),
      recipientEmail: z.string().optional().describe("The email of the recipient user (for transfers to other users)"),
      amount: z.number().describe("The amount to transfer in dollars"),
      description: z.string().optional().describe("Optional description for the transfer"),
    }),
    execute: async ({ fromAccountId, toAccountId, recipientEmail, amount, description }: { fromAccountId: string; toAccountId?: string; recipientEmail?: string; amount: number; description?: string }) => {
      return await executeTransfer(userId, fromAccountId, amount, toAccountId, recipientEmail, description);
    },
  },
});
