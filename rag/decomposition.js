import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

// Create an instance of the LLM model for chat
const model = new ChatOllama({ model: "llama3.2", temperature: 0 });

// Define the question to be answered
// This is the original question that we want to decompose into sub-questions and then answer each sub-question in isolation
const userPrompt =
  "What are the main components of an LLM-powered autonomous agent system?";


// Step 1 - Ask the model to generate sub-questions

// Define a zod object for the structured output of the model for sub-questions
// This will be used to enforce the output structure of the model
const Questions = z.object({
  questions: z
    .array(z.string())
    .describe("A list of sub-questions related to the input query."),
});

// Define the system prompt for generating sub-questions role
const systemPrompt = `You are a helpful assistant that generates multiple sub-questions related to an input question.
The goal is to break down the input into a set of sub-problems / sub-questions that can be answers in isolation.`;

// Get instance of the model with structured output format
const structuredModel = model.withStructuredOutput(Questions);

// Ask the model to generate sub-questions related to the user's prompt
// The model will generate a list of sub-questions, the output will be a json object containing single attribute "questions" which is an array of strings as defined in the zod object 'Questions' 
let subQuestions = (await structuredModel.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage(userPrompt),
])).questions;

// Get the first 5 sub-questions in case the model generates more than 5 
subQuestions = subQuestions.slice(0, 5);

console.log('Sub-questions generated:');
console.log(subQuestions);
console.log('------------------');


// Step 2 - Ask the model to answer the sub-questions
// The model will answer each sub-question in isolation but with the context of the previous sub-question answers

// Define the system prompt for answering sub-questions
const systemPromptTemplate = PromptTemplate.fromTemplate(`
Prior questions and answers:

{priorQuestionsAndAnswers}
`);

const combineSubQuestionAnswers = (subQuestionAnswers) => {
  const r = subQuestionAnswers.map((subQuestionAnswer) => {
    return `Question: ${subQuestionAnswer.question}\nAnswer: ${subQuestionAnswer.answer}`;
  }).join('\n\n----\n\n');
  return r;
}

// Generate answers for each sub-question arbitrarily by providing the previous sub-question answers as context
const subQuestionAnswers = [];
for (const subQuestion of subQuestions) {
  const answer = await model.invoke([
    new SystemMessage(await systemPromptTemplate.format({
      priorQuestionsAndAnswers: combineSubQuestionAnswers(subQuestionAnswers) || 'No prior questions and answers',
    })),
    new SystemMessage(
      `You are a helpful assistant that answers questions.`
    ),
    new SystemMessage(subQuestion),
  ]);

  // Note: There could be an actual retrieval step here to get the context for the sub-question from a knowledge base or other sources

  // Push the answer to the sub-question answers array
  subQuestionAnswers.push({ question: subQuestion, answer: answer.content });
  console.log('Generated answer for sub-question:');
  console.log('Question: ' + subQuestion);
  console.log('Answer: ' + answer.content);
  console.log('------------------');
}

console.log('Generation answers for sub-questions completed.');


// Step 3 - Answer the original question by combining the answers to the sub-questions

// Template for the final prompt
const systemPromptTemplate2 = PromptTemplate.fromTemplate(`
  You are a helpful assistant that answers questions.
  You are given a set of sub-questions and their answers.
  Your task is to combine the answers to the sub-questions and provide a comprehensive answer user question.
  The sub-questions and their answers are:
  {priorQuestionsAndAnswers}
  `);

// Final prompt to answer the original question of the user
// The model will use the answers to the sub-questions as context to answer the original question
const finalPrompt = await systemPromptTemplate2.format({
  priorQuestionsAndAnswers: combineSubQuestionAnswers(subQuestionAnswers),
});

// Ask the model to answer the original question using the answers to the sub-questions as context
// The model will generate a comprehensive answer to the original question
// Note: There could be an actual retrieval step here to get the context for the original question from a knowledge base or other sources
const finalAnswer = await model.invoke([
  new SystemMessage(finalPrompt),
  new HumanMessage(userPrompt)
]);

console.log('Final answer to the original question:');
console.log(finalAnswer.content);
console.log('------------------');