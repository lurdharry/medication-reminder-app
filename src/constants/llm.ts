import { UserIntent } from "@/types";

export const functionDefinations = [
  {
    name: UserIntent.ADD_MEDICATION,
    description: "Add a new medication to the user schedule",
    parameters: {
      type: "object",
      properties: {
        medicationName: {
          type: "string",
          description: "Name of the medication",
        },
        dosage: {
          type: "string",
          description: 'Dosage amount (e.g., "10", "500")',
        },
        unit: {
          type: "string",
          description: "Unit (mg, ml, tablets, etc.)",
        },
        times: {
          type: "array",
          items: { type: "string" },
          description: 'Times to take (HH:MM format, e.g., ["08:00", "20:00"])',
        },
        purpose: {
          type: "string",
          description: "What the medication is for",
        },
        instructions: {
          type: "string",
          description: 'Special instructions (e.g., "take with food")',
        },
      },
      required: ["medicationName", "dosage", "unit", "times"],
    },
  },
  {
    name: UserIntent.MARK_TAKEN,
    description: "Mark a medication dose as taken",
    parameters: {
      type: "object",
      properties: {
        medicationName: {
          type: "string",
          description: "Name of the medication taken",
        },
        time: {
          type: "string",
          description: "Time the medication was taken (optional)",
        },
      },
      required: ["medicationName"],
    },
  },
  {
    name: UserIntent.SKIP_DOSE,
    description: "Skip a scheduled medication dose",
    parameters: {
      type: "object",
      properties: {
        medicationName: {
          type: "string",
          description: "Name of the medication to skip",
        },
        reason: {
          type: "string",
          description: "Reason for skipping (optional)",
        },
      },
      required: ["medicationName"],
    },
  },
  {
    name: UserIntent.QUERY_SCHEDULE,
    description: "Check medication schedule",
    parameters: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["today", "tomorrow", "this_week"],
          description: "Timeframe to check",
        },
      },
      required: ["timeframe"],
    },
  },
  {
    name: UserIntent.QUERY_INTERACTIONS,
    description: "Check for drug interactions",
    parameters: {
      type: "object",
      properties: {
        newMedication: {
          type: "string",
          description: "New medication to check against current medications",
        },
      },
    },
  },
  {
    name: UserIntent.REQUEST_HELP,
    description: "User needs help or has urgent concerns",
    parameters: {
      type: "object",
      properties: {
        urgency: {
          type: "string",
          enum: ["low", "medium", "high", "emergency"],
          description: "Level of urgency",
        },
        issue: {
          type: "string",
          description: "Description of the issue",
        },
      },
      required: ["urgency", "issue"],
    },
  },
  {
    name: UserIntent.GET_ADHERENCE_REPORT,
    description: "Get adherence statistics and report",
    parameters: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["week", "month", "all_time"],
          description: "Time period for the report",
        },
      },
    },
  },
];
