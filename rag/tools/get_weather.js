/**
 * This is a dummy tool to get the current temperature in Celsius for a specified city.
 * It is used to demonstrate how to use the LLM with tools.
 * The tool will return the result and the LLM will use the result to answer the user question.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const get_weather = tool(
  ({ city }) => {
      /**
       * Return dumy weather data for a city.
       */
      return {
        city,
        temperature: 25,
        unit: "Celsius",
        description: 'The weather is sunny with a few clouds.',
    };
  },
  {
      name: "get_weather",
      description: "Retrieve real time the current temperature in Celsius for a specified city for weather forecast. Call this tool only if the user question is related to weather and contains a city.",
      schema: z.object({
          city: z.string(),
      })
  }
);

// Call the tool manually for testing purpose
// console.log('weather result: ', await weather.invoke({ city: 'Amsterdam' }));