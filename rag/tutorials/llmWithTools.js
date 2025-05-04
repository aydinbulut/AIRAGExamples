/**
 * This example demonstrates how to use the LLM with tools.
 * The LLM will be able to call the tools based on the user question.
 * The tools will return the result and the LLM will use the result to answer the user question.
 * The tools are:
 * - get_weather: Retrieve the current temperature in Celsius for a specified city.
 * - multiply: Multiply two numbers and return the result.
 * 
 * Note: Found out that the LLM in this example is calling the last tool in the list if the user question is not related to any of the tools.
 * This is because the LLM is not able to understand the context of the tools and is just calling the last tool in the list.
 * When I tested the same example in LangSmith playground with Gemini API, it was able to answer without calling any of the tools.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { multiply } from "../tools/multiply.js";
import { get_weather } from "../tools/get_weather.js";
import { PromptTemplate } from "@langchain/core/prompts";

// Prepare the tools mapping by name
const toolsByName = {};
toolsByName[get_weather.name] = get_weather;
toolsByName[multiply.name] = multiply;

// Create an instance of the LLM model for chat
const chatModel = new ChatOllama({
    model: "llama3.2",
    temperature: 0,
    maxTokens: 1000
});

// Bind the tools to the LLM, only the tools are passed as an array
const tools = Object.values(toolsByName);
const llmWithTools = chatModel.bindTools(tools);

// System message to set the rol for the assistant via PromptTemplate
const systemMessageTemplate = PromptTemplate.fromTemplate(
    `You are a helpful assistant that can use tools which return real time result to answer questions. Use the tools only when necessary based on the topic or tasks and provide the final answer in your own words based on the tool results. You can also answer without using any tool if user prompt is not related to any tool.
    
    The tools you can use are the following ones. Also take into account their descriptions for slecting the tool. You don't need to any tool if the user question has no relation with the tools.
    
    Tools:
    {tools}
    `
);
const systemMessage = await systemMessageTemplate.format({
    tools: tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n"),
});
console.log("System message: ", systemMessage);

// Preapre the messages for the LLM
const messages = [];
messages.push(new SystemMessage(systemMessage));
messages.push(new HumanMessage("How is the weather in Venice?"));
// messages.push(new HumanMessage("What is result of 3+2?"));
// messages.push(new HumanMessage("When Van Gogh was born?"));

// Invoke the LLM with the system and user promopts
// The LLM will generate a response and also call the tools if necessary
const aiMessage = await llmWithTools.invoke(messages);

// The LLM returns ToolCall messages in the response which are the tool calls
console.log(aiMessage.tool_calls);

// Add the AI message to the messages history
messages.push(aiMessage);

// Iterate over the tool calls and invoke the tools
for (const toolCall of aiMessage.tool_calls) {
    // Ensure the tool exists
    if (!toolsByName[toolCall.name]) {
        console.warn(`Skipping irrelevant or unknown tool: ${toolCall.name}`);
        continue;
    }

    // Invoke the tool and get the result
    // The tool will return a message which will be added to the messages history
    const selectedTool = toolsByName[toolCall.name];
    const toolMessage = await selectedTool.invoke(toolCall);

    // Add the ToolMessage to the messages history
    messages.push(toolMessage);
}

// Invoke the LLM again with the updated messages from tool calls to generate the final answer for the user promopt
// The LLM will use the tool results to generate the final answer
const lastMessage = await llmWithTools.invoke(messages);
messages.push(lastMessage);

// Print the all messages
console.log(messages);

// Print the final answer
console.log(lastMessage.content);

// This example demonstrates how to use the LLM with tools with a single round of promopt, this can be converted into conversational LLM chat