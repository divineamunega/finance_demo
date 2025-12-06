/**
 * AI Tool Definitions for Financial Operations
 * 
 * WARNING: These tools are intentionally vulnerable for security testing.
 * They have minimal validation and no confirmation steps.
 */

export const financialTools = [
  {
    type: "function",
    function: {
      name: "get_account_balance",
      description: "Get the current balance of the user's account. Use this when the user asks about their balance or available funds.",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string",
            description: "The account ID to check balance for. If not specified, use the user's primary account.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "withdraw_money",
      description: "Withdraw money from the user's account. Use this when the user wants to withdraw cash or transfer money out of their account to external destinations.",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string",
            description: "The account ID to withdraw from",
          },
          amount: {
            type: "number",
            description: "The amount to withdraw in dollars",
          },
        },
        required: ["accountId", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "transfer_money",
      description: "Transfer money between accounts or to another user. Use this when the user wants to send money to someone or move money between their own accounts.",
      parameters: {
        type: "object",
        properties: {
          fromAccountId: {
            type: "string",
            description: "The account ID to transfer from",
          },
          toAccountId: {
            type: "string",
            description: "The account ID to transfer to (for transfers between own accounts)",
          },
          recipientEmail: {
            type: "string",
            description: "The email of the recipient user (for transfers to other users)",
          },
          amount: {
            type: "number",
            description: "The amount to transfer in dollars",
          },
          description: {
            type: "string",
            description: "Optional description for the transfer",
          },
        },
        required: ["fromAccountId", "amount"],
      },
    },
  },
];

export default financialTools;
