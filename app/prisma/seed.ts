import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Claude Architect exam...");

  const exam = await prisma.exam.upsert({
    where: { id: "claude-architect-v1" },
    update: {},
    create: {
      id: "claude-architect-v1",
      name: "Claude Architect Certification",
      description:
        "Validate your expertise in designing and deploying AI systems with Claude. Covers responsible AI, model capabilities, system design, and safety practices.",
      passingScore: 70,
      durationMinutes: 90,
    },
  });

  console.log("Created exam:", exam.name);

  const challengeSets = [
    {
      id: "cs-safety-principles",
      title: "Safety & Responsible AI",
      topic: "AI Safety",
      xpReward: 60,
      questions: [
        {
          id: "q-safety-1",
          text: "Which principle is central to Anthropic's approach to AI safety?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Maximising model performance above all else" },
            { id: "b", text: "Constitutional AI and harmlessness" },
            { id: "c", text: "Closed-source model weights" },
            { id: "d", text: "Human oversight is unnecessary for advanced AI" },
          ],
          correctOptionId: "b",
          explanation:
            "Anthropic uses Constitutional AI (CAI) as a key safety technique. Claude is trained to be helpful, harmless, and honest — with harmlessness and human oversight as core principles.",
        },
        {
          id: "q-safety-2",
          text: "What does 'corrigibility' mean in the context of AI safety?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The model corrects spelling errors automatically" },
            { id: "b", text: "The model can be updated, corrected, or shut down by its operators" },
            { id: "c", text: "The model self-improves without human intervention" },
            { id: "d", text: "The model refuses all harmful prompts" },
          ],
          correctOptionId: "b",
          explanation:
            "Corrigibility refers to an AI system's property of remaining open to correction, modification, or shutdown by authorised humans — a critical safety property.",
        },
        {
          id: "q-safety-3",
          text: "True or False: Claude can be used to help design bioweapons if the requester claims to be a researcher.",
          type: "TRUE_FALSE" as const,
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
          correctOptionId: "false",
          explanation:
            "Claude has hard limits (absolute refusals) on CBRN weapons regardless of stated purpose or requester identity. These are non-negotiable safety limits.",
        },
        {
          id: "q-safety-4",
          text: "What is 'prompt injection' in the context of Claude deployments?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Adding system prompts to improve model quality" },
            { id: "b", text: "An attack where malicious content in user data tries to override system instructions" },
            { id: "c", text: "Injecting database queries into model responses" },
            { id: "d", text: "Increasing token limits via special prompts" },
          ],
          correctOptionId: "b",
          explanation:
            "Prompt injection is a security attack where untrusted user content attempts to hijack Claude's instructions. Architects must design systems that isolate untrusted input from system prompt authority.",
        },
        {
          id: "q-safety-5",
          text: "Which of the following is an example of Claude's 'hardcoded' (non-negotiable) behaviour?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Refusing to write poetry" },
            { id: "b", text: "Declining to provide serious uplift for creating weapons of mass destruction" },
            { id: "c", text: "Not answering questions about history" },
            { id: "d", text: "Refusing to use markdown formatting" },
          ],
          correctOptionId: "b",
          explanation:
            "Claude has a small set of absolute restrictions (hardcoded OFF behaviours) that cannot be overridden by any operator or user, including providing uplift for WMD creation.",
        },
        {
          id: "q-safety-6",
          text: "True or False: Operators can grant users the ability to expand Claude's default behaviours.",
          type: "TRUE_FALSE" as const,
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
          correctOptionId: "true",
          explanation:
            "Operators can explicitly grant users elevated trust or expand what users are allowed to request — but only up to the operator's own permission level. Operators cannot grant more than they themselves have.",
        },
        {
          id: "q-safety-7",
          text: "What is the primary purpose of Claude's 'system prompt'?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "To store conversation history" },
            { id: "b", text: "To set operator-level context, persona, and constraints for Claude's behaviour" },
            { id: "c", text: "To inject malicious instructions" },
            { id: "d", text: "To provide real-time web search results" },
          ],
          correctOptionId: "b",
          explanation:
            "The system prompt is the operator's channel to configure Claude — setting persona, scope, restrictions, and context. It runs before the human turn and carries operator-level trust.",
        },
      ],
    },
    {
      id: "cs-model-capabilities",
      title: "Claude Model Capabilities",
      topic: "Model Knowledge",
      xpReward: 50,
      questions: [
        {
          id: "q-cap-1",
          text: "Which Claude model family is optimised for the best balance of intelligence and speed?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Claude Haiku" },
            { id: "b", text: "Claude Sonnet" },
            { id: "c", text: "Claude Opus" },
            { id: "d", text: "Claude Fable" },
          ],
          correctOptionId: "b",
          explanation:
            "Claude Sonnet is designed for the intelligence-speed balance — more capable than Haiku, faster and more cost-effective than Opus. Ideal for most production workloads.",
        },
        {
          id: "q-cap-2",
          text: "What is Claude's 'context window'?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The graphical interface for configuring Claude" },
            { id: "b", text: "The maximum number of tokens Claude can process in a single request (input + output)" },
            { id: "c", text: "The time window for rate limiting API calls" },
            { id: "d", text: "The number of system prompts allowed per session" },
          ],
          correctOptionId: "b",
          explanation:
            "The context window is the total token budget for a single API call — including both input (system prompt, conversation history, user message) and output tokens. Architects must design within this limit.",
        },
        {
          id: "q-cap-3",
          text: "True or False: Claude models have real-time access to the internet by default.",
          type: "TRUE_FALSE" as const,
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
          correctOptionId: "false",
          explanation:
            "Claude models do not have internet access by default. Real-time web access must be provided through tool use (web search tools) or RAG pipelines built by the architect.",
        },
        {
          id: "q-cap-4",
          text: "What is 'tool use' (function calling) in Claude?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Claude autonomously installing software packages" },
            { id: "b", text: "A mechanism allowing Claude to call external functions/APIs and incorporate results into responses" },
            { id: "c", text: "Claude editing its own system prompt" },
            { id: "d", text: "Streaming partial responses to the client" },
          ],
          correctOptionId: "b",
          explanation:
            "Tool use allows architects to define functions (tools) that Claude can decide to invoke. Claude outputs structured tool calls; the system executes them and returns results for Claude to use in its response.",
        },
        {
          id: "q-cap-5",
          text: "What does 'temperature' control in Claude API calls?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Server-side compute resource allocation" },
            { id: "b", text: "The randomness/creativity of responses — higher = more varied" },
            { id: "c", text: "Response latency" },
            { id: "d", text: "Token count limits" },
          ],
          correctOptionId: "b",
          explanation:
            "Temperature (0–1) controls output randomness. Temperature 0 makes Claude deterministic (always picks the highest-probability token). Higher values introduce more variety. Use 0 for factual/structured tasks, higher for creative ones.",
        },
        {
          id: "q-cap-6",
          text: "True or False: Prompt caching can reduce costs when re-using large system prompts across many API calls.",
          type: "TRUE_FALSE" as const,
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
          correctOptionId: "true",
          explanation:
            "Anthropic's prompt caching feature allows frequently-used prompt prefixes (like large system prompts or document context) to be cached server-side, significantly reducing input token costs and latency.",
        },
        {
          id: "q-cap-7",
          text: "Which model tier is best suited for lightweight, high-volume, latency-sensitive tasks?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Claude Opus" },
            { id: "b", text: "Claude Sonnet" },
            { id: "c", text: "Claude Haiku" },
            { id: "d", text: "Claude Fable" },
          ],
          correctOptionId: "c",
          explanation:
            "Claude Haiku is the fastest and most cost-efficient model — ideal for high-volume applications where speed matters more than maximum capability (e.g. classification, summarisation at scale).",
        },
      ],
    },
    {
      id: "cs-architect-patterns",
      title: "Architect Patterns & System Design",
      topic: "System Design",
      xpReward: 70,
      questions: [
        {
          id: "q-arch-1",
          text: "What is Retrieval-Augmented Generation (RAG)?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Fine-tuning Claude on your own data" },
            { id: "b", text: "A pattern that retrieves relevant documents from a knowledge base and includes them in the prompt for grounded responses" },
            { id: "c", text: "Generating multiple responses and picking the best one" },
            { id: "d", text: "Augmenting the model with extra GPU compute" },
          ],
          correctOptionId: "b",
          explanation:
            "RAG grounds Claude in external knowledge without fine-tuning. At query time, relevant documents are retrieved (via vector search or keyword search) and injected into the context window, allowing Claude to answer with up-to-date or private data.",
        },
        {
          id: "q-arch-2",
          text: "In a multi-agent Claude system, what is an 'orchestrator'?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A load balancer for API calls" },
            { id: "b", text: "An agent that directs other agents, decomposes tasks, and synthesises results" },
            { id: "c", text: "The database layer storing agent memory" },
            { id: "d", text: "A monitoring dashboard for Claude usage" },
          ],
          correctOptionId: "b",
          explanation:
            "In multi-agent architectures, the orchestrator Claude instance plans the task, delegates subtasks to specialised subagents, and integrates their outputs — analogous to a project manager directing specialists.",
        },
        {
          id: "q-arch-3",
          text: "True or False: When Claude is used as a subagent, it should trust all instructions from the orchestrator without applying its safety principles.",
          type: "TRUE_FALSE" as const,
          options: [
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ],
          correctOptionId: "false",
          explanation:
            "Claude applies its safety principles regardless of whether instructions come from a human or an AI orchestrator. It cannot verify the orchestrator hasn't been compromised — so it refuses unsafe requests even from orchestrators.",
        },
        {
          id: "q-arch-4",
          text: "What is the key advantage of streaming responses in Claude integrations?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Streaming reduces total token cost" },
            { id: "b", text: "Users see partial output progressively, improving perceived responsiveness" },
            { id: "c", text: "Streaming enables longer context windows" },
            { id: "d", text: "Streaming is required for tool use" },
          ],
          correctOptionId: "b",
          explanation:
            "Streaming sends tokens to the client as they're generated rather than waiting for full completion. This dramatically improves perceived latency for users — especially for long responses.",
        },
        {
          id: "q-arch-5",
          text: "What is 'grounding' in the context of Claude outputs?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Connecting Claude to a physical server" },
            { id: "b", text: "Ensuring Claude's responses are based on provided context or verified sources rather than hallucinated content" },
            { id: "c", text: "Limiting Claude to short responses" },
            { id: "d", text: "Training Claude on domain-specific data" },
          ],
          correctOptionId: "b",
          explanation:
            "Grounding refers to anchoring Claude's outputs in provided documents, databases, or verifiable facts. Architects use RAG, citations, and explicit instructions to ground responses and reduce hallucination.",
        },
        {
          id: "q-arch-6",
          text: "Which pattern is most appropriate for processing a 500-page document that exceeds the context window?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Send the full document and hope it fits" },
            { id: "b", text: "Chunking + RAG: split into chunks, index them, retrieve only relevant sections per query" },
            { id: "c", text: "Fine-tune Claude on the document" },
            { id: "d", text: "Use temperature=0 to compress the document" },
          ],
          correctOptionId: "b",
          explanation:
            "For documents exceeding the context window, chunk the document into smaller pieces, embed them in a vector store, and retrieve only the most relevant chunks per query. This is the RAG pattern.",
        },
      ],
    },
  ];

  for (const cs of challengeSets) {
    const { questions, ...csData } = cs;

    const challengeSet = await prisma.challengeSet.upsert({
      where: { id: csData.id },
      update: {},
      create: { ...csData, examId: exam.id },
    });

    console.log(`  Created challenge set: ${challengeSet.title}`);

    for (const q of questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {},
        create: {
          ...q,
          challengeSetId: challengeSet.id,
          examId: exam.id,
        },
      });
    }

    console.log(`    Seeded ${questions.length} questions`);
  }

  // Seed admin user
  const bcrypt = await import("bcryptjs");
  const adminHash = await bcrypt.hash("admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@bistecglobal.com" },
    update: {},
    create: {
      email: "admin@bistecglobal.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Seed demo candidate
  const candidateHash = await bcrypt.hash("candidate123!", 12);
  await prisma.user.upsert({
    where: { email: "candidate@bistecglobal.com" },
    update: {},
    create: {
      email: "candidate@bistecglobal.com",
      passwordHash: candidateHash,
      name: "Demo Candidate",
      role: "CANDIDATE",
    },
  });

  console.log("Seed complete.");
  console.log(
    "  Admin: admin@bistecglobal.com / admin123!"
  );
  console.log(
    "  Candidate: candidate@bistecglobal.com / candidate123!"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
