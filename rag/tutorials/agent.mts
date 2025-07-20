import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import readline from "node:readline/promises";

// Define the tools for the agent to use
const agentTools = [new TavilySearchResults({ maxResults: 3, includeRawContent: true })];
const agentModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.2,
  maxOutputTokens: 1000,
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

// Read human message from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages = [
  new SystemMessage("Call TavilySearchResults tool to answer questions about current events needs data from the web such as weather, news, etc."),
];

while (true) {
  const userInput = await rl.question("Enter your question (or type 'exit' to quit): ");
  if (userInput.trim().toLowerCase() === "exit") break;
  messages.push(new HumanMessage(userInput));
  const agentState = await agent.invoke(
    { messages },
    { configurable: { thread_id: "42" } },
  );
  const reply = agentState.messages[agentState.messages.length - 1].content;
  console.log(reply);
  messages.push(agentState.messages[agentState.messages.length - 1]);
}

await rl.close();