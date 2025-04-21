import { ChatOllama } from "@langchain/ollama";
import { ConversationChain } from "langchain/chains";
import readline from 'readline';

const model = new ChatOllama({model: 'llama3.2', temperature: 0, streaming: true});
const chain = new ConversationChain({ llm: model });

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