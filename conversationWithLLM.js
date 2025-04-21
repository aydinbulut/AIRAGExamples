import { ChatOllama } from "@langchain/ollama";
import { ConversationChain } from "langchain/chains";
import readline from 'readline';

const model = new ChatOllama(
    {
        model: 'llama3.2',
        temperature: 0.5, // 0 for deterministic output, 1 for more creative output
        streaming: true, // Set to true for streaming output
        topK: 5, // Number of top tokens to sample from 1-100
        topP: 0.5, // Cumulative probability for sampling
        maxTokens: 1 // Maximum number of tokens to generate
    });
const chain = new ConversationChain({ llm: model, streaming: true });

// Ask user in console to provide prompt arbitrarily
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Keep asking the user for input until they type 'exit'
const askPrompt = () => {
    rl.question('Please enter your prompt (type "exit" to quit): ', async (prompt) => {
        if (prompt.toLowerCase() === 'exit') {
            console.log('Exiting...');
            rl.close();
            return;
        }
        // Sending the user prompt to the conversation chain
        const res = await chain.call({ input: prompt });
        console.log(res.response); // Print the response from the LLM
        askPrompt(); // Ask for the next prompt
    });
};

askPrompt();