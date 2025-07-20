import dotenv from "dotenv";
dotenv.config();
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { multiply } from "../tools/multiply.js";
import { get_weather } from "../tools/get_weather.js";

const toolsByName = {};
toolsByName[get_weather.name] = get_weather;
toolsByName[multiply.name] = multiply;



// Call the tool manually for testing purpose
// console.log('multiply result: ', await multiply.invoke({ a: '2', b: '3' }));

const chatModel = new ChatOllama({
    model: "llama3.2",
    temperature: 0,
    maxTokens: 1000
});

const tools = Object.values(toolsByName);
const llmWithTools = chatModel.bindTools(tools);

const messages = [];
messages.push(new SystemMessage("You are a helpful assistant that can use tools which return real time result to answer questions. Use the tools when necessary and provide the final answer in your own words based on the tool results."));
// messages.push(new HumanMessage("How is the weather in Venice?"));
messages.push(new HumanMessage("When Van Gogh was burn?"));

const aiMessage = await llmWithTools.invoke(messages);

messages.push(aiMessage);

console.log(aiMessage.tool_calls);

for (const toolCall of aiMessage.tool_calls) {
    const selectedTool = toolsByName[toolCall.name];
    const toolMessage = await selectedTool.invoke(toolCall);
    messages.push(toolMessage);
}

const lastMessage = await llmWithTools.invoke(messages);
messages.push(lastMessage);
console.log(messages);
console.log(lastMessage.content);