/**
 * This is a simple tool to multiply two numbers.
 * It is used to demonstrate how to use the LLM with tools.
 * The tool will return the result and the LLM will use the result to answer the user question.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const multiply = tool(
  ({ a, b }) => {
      /**
       * Multiply two numbers.
       */
      return parseInt(a) * parseInt(b);
  },
  {
      name: "multiply",
      description: "Multiply two numbers and return the result for mathematical operations",
      schema: z.object({
          a: z.union([z.number(), z.string()]),
          b: z.union([z.number(), z.string()]),
      }),
  }
);

// Call the tool manually for testing purpose
// console.log('multiply result: ', await multiply.invoke({ a: 2, b: 3 }));