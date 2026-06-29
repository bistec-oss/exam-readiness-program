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
    // ── Foundations Exam Guide levels (extracted from official exam guide PDF) ──
    {
      id: "cca-d1-agentic-orchestration",
      title: "Domain 1 · Agentic Architecture & Orchestration",
      topic: "Agentic Orchestration",
      xpReward: 80,
      questions: [
        {
          id: "cca-d1-q1",
          text: "Production data shows that in 12% of cases, your support agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID" },
            { id: "b", text: "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations" },
            { id: "c", text: "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details" },
            { id: "d", text: "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type" },
          ],
          correctOptionId: "a",
          explanation:
            "When a specific tool sequence is required for critical business logic (verifying identity before refunds), programmatic enforcement gives deterministic guarantees that prompt-based approaches cannot. B and C rely on probabilistic LLM compliance, insufficient when errors have financial consequences. D addresses tool availability, not tool ordering — the actual problem.",
        },
        {
          id: "cca-d1-q2",
          text: "A multi-agent research system runs on the topic 'impact of AI on creative industries.' Every subagent succeeds, but the final report covers only visual arts, missing music, writing, and film. The coordinator's logs show it decomposed the topic into 'AI in digital art,' 'AI in graphic design,' and 'AI in photography.' What is the most likely root cause?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives" },
            { id: "b", text: "The coordinator's task decomposition is too narrow, producing subagent assignments that don't cover all relevant domains of the topic" },
            { id: "c", text: "The web search agent's queries are not comprehensive enough and need expanding" },
            { id: "d", text: "The document analysis agent filters out non-visual sources due to overly restrictive relevance criteria" },
          ],
          correctOptionId: "b",
          explanation:
            "The coordinator's logs reveal the cause directly: it decomposed 'creative industries' into only visual-arts subtasks, omitting music, writing, and film. The subagents executed their assigned tasks correctly. A, C, and D wrongly blame downstream agents working correctly within their assigned scope.",
        },
        {
          id: "cca-d1-q3",
          text: "You are implementing an agentic loop with the Claude Agent SDK. Which control-flow rule correctly governs loop continuation?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Continue while the assistant's text response is non-empty; stop when it is empty" },
            { id: "b", text: "Continue when stop_reason is \"tool_use\" (execute tools, append results, iterate); terminate when stop_reason is \"end_turn\"" },
            { id: "c", text: "Always cap iterations at a fixed number as the primary stopping mechanism" },
            { id: "d", text: "Parse the assistant's natural-language output for phrases like 'done' to decide when to stop" },
          ],
          correctOptionId: "b",
          explanation:
            "The agentic loop is driven by stop_reason: 'tool_use' means execute the requested tools and feed results back; 'end_turn' means the model is finished. Parsing natural-language signals (D), arbitrary iteration caps (C), and checking assistant text content (A) are anti-patterns.",
        },
        {
          id: "cca-d1-q4",
          text: "A coordinator passes a topic to a synthesis subagent, but the subagent produces output as if it never saw the web-search and document-analysis findings. What is the correct mental model for subagent context?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Subagents automatically inherit the coordinator's full conversation history" },
            { id: "b", text: "Subagents operate with isolated context and must be given prior findings explicitly in their prompt" },
            { id: "c", text: "Subagents share a global memory store updated after every invocation" },
            { id: "d", text: "Subagents read the coordinator's scratchpad file by default" },
          ],
          correctOptionId: "b",
          explanation:
            "Subagents run with isolated context — they do not inherit the coordinator's history or share memory between invocations. Findings from prior agents (e.g., search results) must be included directly in the subagent's prompt to be available downstream.",
        },
        {
          id: "cca-d1-q5",
          text: "Your coordinator runs three subagents one after another, costing significant wall-clock time, even though the three research subtopics are independent. How do you run them concurrently with the Agent SDK?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Emit multiple Task tool calls in a single coordinator response so the subagents spawn in parallel" },
            { id: "b", text: "Increase max_tokens so each subagent finishes faster" },
            { id: "c", text: "Set tool_choice to \"any\" so all tools fire at once" },
            { id: "d", text: "Issue each Task call in a separate follow-up turn to keep them isolated" },
          ],
          correctOptionId: "a",
          explanation:
            "Parallel subagents are spawned by emitting multiple Task tool calls in a single response, not across separate turns (D, which is sequential). max_tokens (B) and tool_choice (C) do not control parallelism.",
        },
        {
          id: "cca-d1-q6",
          text: "A coordinator agent fails to spawn any subagents despite a correct prompt. Which configuration is most likely missing?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "tool_choice must be set to \"auto\"" },
            { id: "b", text: "The coordinator's allowedTools must include \"Task\", the mechanism for spawning subagents" },
            { id: "c", text: "fork_session must be enabled on the coordinator" },
            { id: "d", text: "The subagents must be registered in ~/.claude.json" },
          ],
          correctOptionId: "b",
          explanation:
            "Subagents are spawned via the Task tool, so the coordinator's allowedTools must include \"Task\". fork_session (C) is for branching from a shared baseline, not spawning, and the other options do not enable subagent invocation.",
        },
      ],
    },
    {
      id: "cca-d2-tool-mcp",
      title: "Domain 2 · Tool Design & MCP Integration",
      topic: "Tool & MCP Design",
      xpReward: 80,
      questions: [
        {
          id: "cca-d2-q1",
          text: "Logs show the agent calls get_customer when users ask about orders (e.g., 'check my order #12345') instead of lookup_order. Both tools have minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and accept similar identifier formats. What's the most effective first step to improve tool selection?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add 5-8 few-shot examples to the system prompt demonstrating correct tool selection" },
            { id: "b", text: "Expand each tool's description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools" },
            { id: "c", text: "Implement a routing layer that parses input and pre-selects a tool by keyword" },
            { id: "d", text: "Consolidate both tools into one lookup_entity tool that determines the backend internally" },
          ],
          correctOptionId: "b",
          explanation:
            "Tool descriptions are the primary mechanism LLMs use for tool selection; minimal descriptions leave the model unable to differentiate similar tools. B fixes the root cause with a low-effort, high-leverage change. Few-shot (A) adds overhead without fixing the cause, a routing layer (C) is over-engineered, and consolidation (D) is more effort than a 'first step' warrants.",
        },
        {
          id: "cca-d2-q2",
          text: "A synthesis agent must verify many claims while combining findings. Currently it returns to the coordinator, which invokes the web-search agent, then re-invokes synthesis — adding 2-3 round trips and 40% latency. 85% of verifications are simple fact-checks; 15% need deeper investigation. What's the most effective approach?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications still delegate through the coordinator" },
            { id: "b", text: "Have synthesis batch all verification needs and return them to the coordinator at the end of its pass" },
            { id: "c", text: "Give the synthesis agent access to all web-search tools so it handles any verification directly" },
            { id: "d", text: "Have the web-search agent proactively cache extra context around every source up front" },
          ],
          correctOptionId: "a",
          explanation:
            "A applies least privilege: a scoped verify_fact tool covers the 85% common case while complex cases keep the existing coordination pattern. Batching (B) creates blocking dependencies, full tool access (C) over-provisions and invites misuse, and speculative caching (D) can't reliably predict verification needs.",
        },
        {
          id: "cca-d2-q3",
          text: "A subagent is given 18 tools spanning several specializations and starts misusing tools outside its role. Which principle best guides the fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "More tools always improve capability, so keep them and add clearer descriptions only" },
            { id: "b", text: "Scope each agent's tool set to those needed for its role; too many tools (e.g., 18 vs 4-5) degrades selection reliability" },
            { id: "c", text: "Set tool_choice to forced selection for every call" },
            { id: "d", text: "Move all tools to the coordinator and let it call them on the subagent's behalf for every step" },
          ],
          correctOptionId: "b",
          explanation:
            "Giving an agent too many tools increases decision complexity and degrades selection reliability; agents with out-of-specialization tools tend to misuse them. The fix is scoped tool access — only the tools needed for the role, with limited cross-role tools for high-frequency needs.",
        },
        {
          id: "cca-d2-q4",
          text: "An MCP tool occasionally fails. To let the agent make appropriate recovery decisions, what should the tool return on failure?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A uniform 'Operation failed' message for every failure type" },
            { id: "b", text: "Structured error metadata including errorCategory (transient/validation/permission), an isRetryable boolean, and a human-readable description" },
            { id: "c", text: "An empty successful result so the workflow keeps running" },
            { id: "d", text: "A raised exception that terminates the whole workflow" },
          ],
          correctOptionId: "b",
          explanation:
            "Structured error responses (errorCategory, isRetryable, readable description) let the agent decide whether to retry, explain a business rule, or escalate. Uniform errors (A) hide context, silently returning success (C) suppresses errors, and terminating the workflow (D) is an anti-pattern.",
        },
        {
          id: "cca-d2-q5",
          text: "Your team wants a GitHub MCP server shared across everyone who clones the repo, with the token supplied via environment variable rather than committed. Where and how should it be configured?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "In project-scoped .mcp.json using environment variable expansion (e.g., ${GITHUB_TOKEN}) for the credential" },
            { id: "b", text: "In user-scoped ~/.claude.json with the token hardcoded" },
            { id: "c", text: "In the project root CLAUDE.md as a configuration block" },
            { id: "d", text: "In a .claude/commands/ slash command file" },
          ],
          correctOptionId: "a",
          explanation:
            "Shared team tooling belongs in project-scoped .mcp.json (version-controlled), and env var expansion like ${GITHUB_TOKEN} keeps secrets out of the repo. ~/.claude.json (B) is user-scoped and personal; CLAUDE.md (C) and commands (D) don't configure MCP servers.",
        },
        {
          id: "cca-d2-q6",
          text: "An extraction agent sometimes returns conversational text instead of calling the extraction tool. Which tool_choice setting guarantees the model calls a tool (but can choose which)?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "tool_choice: \"auto\"" },
            { id: "b", text: "tool_choice: \"any\"" },
            { id: "c", text: "tool_choice: \"none\"" },
            { id: "d", text: "Omitting tool_choice entirely" },
          ],
          correctOptionId: "b",
          explanation:
            "tool_choice: \"any\" forces the model to call some tool rather than returning text, while still letting it choose which. \"auto\" (A, also the default when omitted in D) permits plain text; \"none\" (C) forbids tool calls. Forcing a specific tool uses {\"type\": \"tool\", \"name\": \"...\"}.",
        },
      ],
    },
    {
      id: "cca-d3-claude-code",
      title: "Domain 3 · Claude Code Configuration & Workflows",
      topic: "Claude Code Workflows",
      xpReward: 80,
      questions: [
        {
          id: "cca-d3-q1",
          text: "You want a custom /review slash command that runs your team's review checklist and is available to every developer when they clone or pull the repo. Where should the command file live?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "In the .claude/commands/ directory in the project repository" },
            { id: "b", text: "In ~/.claude/commands/ in each developer's home directory" },
            { id: "c", text: "In the CLAUDE.md file at the project root" },
            { id: "d", text: "In a .claude/config.json file with a commands array" },
          ],
          correctOptionId: "a",
          explanation:
            "Project-scoped slash commands live in .claude/commands/, are version-controlled, and become available to everyone who clones/pulls. ~/.claude/commands/ (B) is personal and unshared; CLAUDE.md (C) holds context, not command definitions; the config.json mechanism in D doesn't exist.",
        },
        {
          id: "cca-d3-q2",
          text: "You must restructure a monolith into microservices — dozens of files, decisions about service boundaries and module dependencies. Which approach fits best?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Enter plan mode to explore the codebase, understand dependencies, and design an approach before changing code" },
            { id: "b", text: "Start with direct execution and let the implementation reveal natural service boundaries" },
            { id: "c", text: "Use direct execution with comprehensive upfront instructions for each service" },
            { id: "d", text: "Begin in direct execution and switch to plan mode only if unexpected complexity appears" },
          ],
          correctOptionId: "a",
          explanation:
            "Plan mode is designed for large-scale, multi-approach, architectural changes — exactly this task — enabling safe exploration before committing. B risks costly late rework, C assumes the structure is already known, and D ignores that the complexity is stated up front, not emergent.",
        },
        {
          id: "cca-d3-q3",
          text: "Your codebase has area-specific conventions, and test files (e.g., Button.test.tsx) are spread throughout next to the code they test. You want Claude to automatically apply test conventions regardless of a file's directory. What's the most maintainable mechanism?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Create .claude/rules/ files with YAML frontmatter glob patterns (e.g., **/*.test.tsx) that load only when editing matching files" },
            { id: "b", text: "Consolidate all conventions in the root CLAUDE.md under per-area headers and rely on Claude to infer which applies" },
            { id: "c", text: "Create a skill per code type in .claude/skills/ holding the conventions" },
            { id: "d", text: "Place a separate CLAUDE.md in each subdirectory with that area's conventions" },
          ],
          correctOptionId: "a",
          explanation:
            "Path-scoped rules in .claude/rules/ with glob patterns apply conventions by file type regardless of location — ideal for test files spread across directories. Inference (B) is unreliable, skills (C) need manual invocation, and directory CLAUDE.md files (D) are directory-bound.",
        },
        {
          id: "cca-d3-q4",
          text: "Your CI script runs `claude \"Analyze this pull request for security issues\"` but the job hangs waiting for interactive input. What's the correct way to run Claude Code in an automated pipeline?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add the -p (or --print) flag: claude -p \"Analyze this pull request...\"" },
            { id: "b", text: "Set CLAUDE_HEADLESS=true before running the command" },
            { id: "c", text: "Redirect stdin from /dev/null" },
            { id: "d", text: "Add a --batch flag" },
          ],
          correctOptionId: "a",
          explanation:
            "-p / --print runs Claude Code non-interactively: it processes the prompt, writes to stdout, and exits — exactly what CI needs. The other options reference non-existent features or Unix workarounds that don't address the command syntax.",
        },
        {
          id: "cca-d3-q5",
          text: "A new teammate reports they aren't getting team coding instructions that everyone else has. You find the instructions live in ~/.claude/CLAUDE.md on each existing member's machine. What's the correct diagnosis?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The instructions are in user-level config, which isn't shared via version control; move them to project-level (.claude/CLAUDE.md or root CLAUDE.md)" },
            { id: "b", text: "The teammate needs to run /compact to load them" },
            { id: "c", text: "User-level CLAUDE.md is automatically synced across the team and the teammate's cache is stale" },
            { id: "d", text: "Slash commands must be re-registered per machine" },
          ],
          correctOptionId: "a",
          explanation:
            "~/.claude/CLAUDE.md is user-level and applies only to that user — it is not shared with teammates through version control. Team-wide instructions belong in project-level configuration so everyone receives them on clone/pull.",
        },
        {
          id: "cca-d3-q6",
          text: "Your CI job must consume Claude Code's findings programmatically and post them as inline PR comments. Which CLI options produce machine-parseable, schema-conformant output?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "--verbose with grep post-processing of the text output" },
            { id: "b", text: "--output-format json together with --json-schema" },
            { id: "c", text: "--markdown to render a structured report" },
            { id: "d", text: "--interactive so a human can format the output" },
          ],
          correctOptionId: "b",
          explanation:
            "--output-format json with --json-schema enforces structured output in CI, producing machine-parseable findings suitable for automated posting as inline PR comments. Parsing free text (A) is brittle, and the other flags don't enforce structure.",
        },
      ],
    },
    {
      id: "cca-d4-prompt-structured-output",
      title: "Domain 4 · Prompt Engineering & Structured Output",
      topic: "Prompt & Structured Output",
      xpReward: 80,
      questions: [
        {
          id: "cca-d4-q1",
          text: "Real-time Claude calls power two workflows: (1) a blocking pre-merge check developers wait on, and (2) an overnight technical-debt report. Your manager wants to move both to the Message Batches API for 50% cost savings. How should you evaluate this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use batch processing for the overnight technical-debt reports only; keep real-time calls for pre-merge checks" },
            { id: "b", text: "Switch both to batch with status polling for completion" },
            { id: "c", text: "Keep real-time for both to avoid batch result-ordering issues" },
            { id: "d", text: "Switch both to batch with a timeout fallback to real-time" },
          ],
          correctOptionId: "a",
          explanation:
            "The Batches API gives 50% savings but processing can take up to 24 hours with no latency SLA — unsuitable for blocking pre-merge checks, ideal for overnight reports. B fails for blocking work, C misconceives batch (results correlate via custom_id), and D adds needless complexity over matching each API to its use case.",
        },
        {
          id: "cca-d4-q2",
          text: "A PR touches 14 files. Your single-pass review gives detailed feedback on some files, superficial on others, misses obvious bugs, and contradicts itself (flagging a pattern in one file, approving identical code in another). How should you restructure the review?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Split into focused passes: analyze each file individually for local issues, then a separate integration pass for cross-file data flow" },
            { id: "b", text: "Require developers to split large PRs into 3-4 file submissions first" },
            { id: "c", text: "Switch to a larger-context model to fit all 14 files in one pass" },
            { id: "d", text: "Run three full-PR passes and flag only issues appearing in at least two runs" },
          ],
          correctOptionId: "a",
          explanation:
            "The root cause is attention dilution from processing many files at once. Per-file passes ensure consistent depth; a separate integration pass catches cross-file issues. B shifts burden to developers, C misunderstands that bigger context ≠ better attention quality, and D suppresses real but intermittently-caught bugs.",
        },
        {
          id: "cca-d4-q3",
          text: "You need guaranteed schema-conformant structured output from Claude, eliminating JSON syntax errors. Which approach is most reliable?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Ask for JSON in the prompt and parse the text response, retrying on parse failure" },
            { id: "b", text: "Use tool use (tool_use) with a JSON schema as the tool's input parameters" },
            { id: "c", text: "Lower temperature to 0 so the model never makes formatting mistakes" },
            { id: "d", text: "Post-process the text output with a regex to fix malformed JSON" },
          ],
          correctOptionId: "b",
          explanation:
            "Tool use with a JSON schema is the most reliable path to schema-compliant output and eliminates syntax errors. Note it removes syntax errors but not semantic ones (e.g., line items not summing). Prompt-and-parse (A), temperature (C), and regex repair (D) don't guarantee conformance.",
        },
        {
          id: "cca-d4-q4",
          text: "An extraction model fabricates values for fields that are simply absent from some source documents. What schema design best prevents this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Make every field required so the model always fills them" },
            { id: "b", text: "Design fields that may be missing as optional/nullable so the model returns null instead of inventing values" },
            { id: "c", text: "Remove the schema and rely on free-text extraction" },
            { id: "d", text: "Add more few-shot examples of fully populated documents" },
          ],
          correctOptionId: "b",
          explanation:
            "Marking fields optional/nullable when the source may not contain them lets the model return null rather than fabricating values to satisfy a required field. Making everything required (A) encourages hallucination; removing the schema (C) loses guarantees; and only-populated examples (D) don't teach the absent-field case.",
        },
        {
          id: "cca-d4-q5",
          text: "A code-review prompt that says 'be conservative and only report high-confidence findings' still produces too many false positives, eroding developer trust. What most effectively improves precision?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add stronger language like 'be extremely conservative'" },
            { id: "b", text: "Write explicit categorical criteria defining which issues to report (e.g., bugs, security) versus skip (minor style), with concrete examples per severity" },
            { id: "c", text: "Ask the model to self-report a confidence score and drop anything under 90%" },
            { id: "d", text: "Lower max_tokens so the model reports fewer findings" },
          ],
          correctOptionId: "b",
          explanation:
            "Vague instructions like 'be conservative' or 'high-confidence only' don't improve precision; explicit categorical criteria with concrete examples do. Self-reported confidence (C) is poorly calibrated, and truncating output (D) doesn't target false positives.",
        },
        {
          id: "cca-d4-q6",
          text: "Detailed instructions alone still yield inconsistently formatted, sometimes-wrong tool-selection decisions on ambiguous requests. Which technique most reliably improves consistency and judgment?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add 2-4 targeted few-shot examples showing the desired format and the reasoning for choosing one action over plausible alternatives" },
            { id: "b", text: "Repeat the instructions three times in the system prompt" },
            { id: "c", text: "Increase temperature to encourage creativity" },
            { id: "d", text: "Switch to a smaller model for faster responses" },
          ],
          correctOptionId: "a",
          explanation:
            "Few-shot examples are the most effective technique when detailed instructions alone produce inconsistent results: they demonstrate format and ambiguous-case handling, enabling the model to generalize judgment. Repetition (B), higher temperature (C), and a smaller model (D) don't address consistency.",
        },
      ],
    },
    {
      id: "cca-d5-context-reliability",
      title: "Domain 5 · Context Management & Reliability",
      topic: "Context & Reliability",
      xpReward: 80,
      questions: [
        {
          id: "cca-d5-q1",
          text: "Your support agent achieves 55% first-contact resolution (target 80%). Logs show it escalates straightforward cases (standard damage replacements with photo evidence) yet tries to autonomously handle complex policy-exception cases. What most effectively improves escalation calibration?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add explicit escalation criteria to the system prompt with few-shot examples showing when to escalate versus resolve" },
            { id: "b", text: "Have the agent self-report a 1-10 confidence score and route to humans below a threshold" },
            { id: "c", text: "Train a separate classifier on historical tickets to predict escalation need" },
            { id: "d", text: "Use sentiment analysis to escalate when negative sentiment exceeds a threshold" },
          ],
          correctOptionId: "a",
          explanation:
            "Explicit escalation criteria with few-shot examples address the root cause — unclear decision boundaries — and are the proportionate first step. Self-reported confidence (B) is poorly calibrated (the agent is wrongly confident on hard cases), a trained classifier (C) is over-engineered before prompt optimization, and sentiment (D) doesn't correlate with case complexity.",
        },
        {
          id: "cca-d5-q2",
          text: "A web-search subagent times out on a complex topic. Which error-propagation approach best enables the coordinator to recover intelligently?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Return structured error context: failure type, attempted query, any partial results, and potential alternative approaches" },
            { id: "b", text: "Retry internally with backoff and return a generic 'search unavailable' after retries are exhausted" },
            { id: "c", text: "Catch the timeout and return an empty result set marked successful" },
            { id: "d", text: "Propagate the timeout to a top-level handler that terminates the whole workflow" },
          ],
          correctOptionId: "a",
          explanation:
            "Structured error context lets the coordinator choose to retry with a modified query, try alternatives, or proceed with partial results. A generic status (B) hides context, marking failure as success (C) prevents recovery, and terminating the workflow (D) is unnecessary when recovery could succeed.",
        },
        {
          id: "cca-d5-q3",
          text: "In a long aggregated input, the model reliably uses information at the start and end but omits findings buried in the middle. What technique best mitigates this 'lost in the middle' effect?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Place a key-findings summary at the beginning and organize detailed results with explicit section headers" },
            { id: "b", text: "Increase max_tokens so the model can read more" },
            { id: "c", text: "Lower temperature to improve focus" },
            { id: "d", text: "Randomly shuffle the input on each request" },
          ],
          correctOptionId: "a",
          explanation:
            "Models process the beginning and end of long inputs more reliably than the middle. Placing key findings up front and using explicit section headers mitigates position effects. Token limits (B), temperature (C), and shuffling (D) don't address positional attention.",
        },
        {
          id: "cca-d5-q4",
          text: "Each order-lookup tool result carries 40+ fields, but only ~5 are relevant; over a long conversation these verbose results consume disproportionate context. What's the recommended practice?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Keep every field in case it's needed later" },
            { id: "b", text: "Trim verbose tool outputs to only the relevant fields before they accumulate in context" },
            { id: "c", text: "Summarize all numbers, dates, and statuses into vague prose" },
            { id: "d", text: "Drop the conversation history and start fresh after each tool call" },
          ],
          correctOptionId: "b",
          explanation:
            "Trim tool outputs to only relevant fields before they accumulate. Keeping everything (A) wastes context; summarizing exact values into vague prose (C) is a progressive-summarization risk that loses critical facts; dropping history (D) breaks conversational coherence.",
        },
        {
          id: "cca-d5-q5",
          text: "During an extended codebase-exploration session, the agent starts giving inconsistent answers and references 'typical patterns' instead of the specific classes it discovered earlier. What practice best counteracts this context degradation?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the agent maintain a scratchpad file of key findings and reference it for later questions" },
            { id: "b", text: "Increase temperature so it explores more broadly" },
            { id: "c", text: "Ask the same question repeatedly until answers stabilize" },
            { id: "d", text: "Disable subagents so all work stays in one context" },
          ],
          correctOptionId: "a",
          explanation:
            "Scratchpad files persist key findings across context boundaries, countering degradation in long sessions; subagent delegation and periodic summarization help too. Higher temperature (B), repetition (C), and forcing everything into one context (D) make degradation worse, not better.",
        },
        {
          id: "cca-d5-q6",
          text: "A customer opens the conversation by explicitly demanding to speak to a human agent. According to good escalation design, what should the agent do?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Honor the explicit request and escalate to a human immediately, without first attempting investigation" },
            { id: "b", text: "Insist on trying to resolve the issue first and escalate only if it fails" },
            { id: "c", text: "Run sentiment analysis to confirm the customer is actually frustrated" },
            { id: "d", text: "Ask the customer to justify why they need a human" },
          ],
          correctOptionId: "a",
          explanation:
            "Explicit customer requests for a human are a valid escalation trigger and should be honored immediately, without first attempting investigation. (Acknowledging frustration and offering to resolve is appropriate only when the customer hasn't explicitly demanded a human.)",
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

  // ── Additional Exam Catalogs ───────────────────────────────────────────────
  console.log("Seeding additional exam catalogs...");

  const additionalExams = [
    {
      id: "aws-saa-c03",
      name: "AWS Solutions Architect — Associate",
      description: "Validate your ability to design secure, resilient, high-performing, and cost-optimised architectures on AWS. Covers EC2, S3, RDS, VPC, IAM, and core AWS services.",
      passingScore: 72,
      durationMinutes: 130,
      challengeSets: [
        {
          id: "cs-aws-compute",
          title: "Compute & Networking",
          topic: "AWS Compute",
          xpReward: 60,
          questions: [
            {
              id: "q-aws-c1",
              text: "A company needs to host a web application that can automatically scale to handle variable traffic. The application must remain available even if an entire Availability Zone fails. Which architecture best meets these requirements?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Single EC2 instance with Auto Scaling in one AZ" },
                { id: "b", text: "EC2 Auto Scaling group across multiple AZs behind an Application Load Balancer" },
                { id: "c", text: "Multiple EC2 instances in one AZ with Elastic IP" },
                { id: "d", text: "ECS cluster in a single AZ with horizontal scaling" },
              ],
              correctOptionId: "b",
              explanation: "An Auto Scaling group spanning multiple AZs behind an ALB provides both elasticity and high availability. If one AZ fails, traffic routes automatically to healthy instances in other AZs. A single-AZ deployment cannot survive an AZ failure.",
            },
            {
              id: "q-aws-c2",
              text: "Which EC2 purchasing option provides the greatest cost savings for a steady-state workload that runs continuously for 3 years?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "On-Demand Instances" },
                { id: "b", text: "Spot Instances" },
                { id: "c", text: "Reserved Instances (3-year, all-upfront)" },
                { id: "d", text: "Dedicated Hosts" },
              ],
              correctOptionId: "c",
              explanation: "Reserved Instances with 3-year all-upfront payment offer up to 72% discount vs On-Demand for predictable, steady-state workloads. Spot Instances are cheaper per hour but can be interrupted, making them unsuitable for continuously running workloads.",
            },
            {
              id: "q-aws-c3",
              text: "A VPC has public and private subnets. Instances in the private subnet need to download software updates from the internet without being directly reachable from the internet. What should you use?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Internet Gateway attached to the private subnet" },
                { id: "b", text: "NAT Gateway in the public subnet with a route from private subnet to NAT Gateway" },
                { id: "c", text: "VPN Gateway for all outbound traffic" },
                { id: "d", text: "Elastic IP addresses on private instances" },
              ],
              correctOptionId: "b",
              explanation: "A NAT Gateway in the public subnet allows outbound internet traffic from private subnet instances while blocking inbound connections. The private subnet route table points to the NAT Gateway for 0.0.0.0/0 traffic.",
            },
            {
              id: "q-aws-c4",
              text: "True or False: Security Groups in AWS are stateful — if you allow inbound traffic on port 443, return traffic is automatically allowed without a separate outbound rule.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "true",
              explanation: "Security Groups are stateful. When you allow inbound traffic, the response traffic is automatically permitted regardless of outbound rules. This differs from Network ACLs (NACLs), which are stateless and require explicit rules for both directions.",
            },
            {
              id: "q-aws-c5",
              text: "An application requires sub-millisecond latency between EC2 instances processing financial transactions. Which placement strategy should you use?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Spread Placement Group" },
                { id: "b", text: "Partition Placement Group" },
                { id: "c", text: "Cluster Placement Group" },
                { id: "d", text: "Default placement with enhanced networking" },
              ],
              correctOptionId: "c",
              explanation: "Cluster Placement Groups pack instances close together within a single AZ on high-bandwidth, low-latency hardware. They deliver the lowest network latency (sub-millisecond) and highest throughput for tightly-coupled HPC or financial workloads.",
            },
          ],
        },
        {
          id: "cs-aws-storage",
          title: "Storage & Databases",
          topic: "AWS Storage",
          xpReward: 60,
          questions: [
            {
              id: "q-aws-s1",
              text: "A company stores 5 TB of infrequently accessed data that must be retrieved within 12 hours when needed. Which S3 storage class minimizes cost?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "S3 Standard" },
                { id: "b", text: "S3 Standard-IA" },
                { id: "c", text: "S3 Glacier Flexible Retrieval" },
                { id: "d", text: "S3 Glacier Deep Archive" },
              ],
              correctOptionId: "c",
              explanation: "S3 Glacier Flexible Retrieval offers retrievals within 1-12 hours at very low storage cost (~$0.004/GB/month). S3 Standard-IA is more expensive for storage. Deep Archive takes up to 48 hours for retrieval. Glacier Flexible Retrieval fits the 12-hour requirement at minimum cost.",
            },
            {
              id: "q-aws-s2",
              text: "A multi-region e-commerce application needs a relational database with automatic failover, read replicas across regions, and 99.99% availability SLA. Which AWS service best fits?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "RDS MySQL with Multi-AZ deployment" },
                { id: "b", text: "Amazon Aurora Global Database" },
                { id: "c", text: "DynamoDB with global tables" },
                { id: "d", text: "ElastiCache with Redis replication" },
              ],
              correctOptionId: "b",
              explanation: "Aurora Global Database spans multiple AWS regions with sub-second replication, automatic regional failover, and maintains SQL compatibility. RDS Multi-AZ only covers a single region. DynamoDB is NoSQL. ElastiCache is a cache, not a primary relational database.",
            },
            {
              id: "q-aws-s3",
              text: "True or False: Amazon S3 objects are stored redundantly across a minimum of 3 Availability Zones within a region (for Standard storage class).",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "true",
              explanation: "S3 Standard stores data redundantly across a minimum of 3 AZs, providing 99.999999999% (11 nines) durability and 99.99% availability. This is built into the service — users don't need to configure cross-AZ replication for Standard storage.",
            },
            {
              id: "q-aws-s4",
              text: "An application processes 1 million DynamoDB read requests per second with eventual consistency. How does DynamoDB handle this scale?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Requires manual sharding configuration by the architect" },
                { id: "b", text: "Scales automatically via partition management — no configuration needed" },
                { id: "c", text: "Requires provisioned capacity mode with manual capacity planning" },
                { id: "d", text: "Only achievable with DynamoDB Accelerator (DAX) in front" },
              ],
              correctOptionId: "b",
              explanation: "DynamoDB in on-demand mode automatically scales to handle virtually unlimited traffic without manual intervention. DynamoDB manages partition splits and data distribution transparently. Provisioned mode requires capacity planning but isn't required for auto-scaling.",
            },
            {
              id: "q-aws-s5",
              text: "A company needs to migrate a 20 TB on-premises MySQL database to AWS with minimal downtime. The database continues serving traffic during migration. Which AWS service supports this?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "AWS Snowball Edge" },
                { id: "b", text: "AWS Database Migration Service (DMS) with ongoing replication" },
                { id: "c", text: "mysqldump + S3 import" },
                { id: "d", text: "AWS DataSync" },
              ],
              correctOptionId: "b",
              explanation: "AWS DMS performs ongoing change data capture (CDC) replication, migrating existing data and continuously applying changes to keep source and target in sync. This enables cutover with minimal downtime. Snowball is for large-scale offline data transfer. mysqldump causes downtime. DataSync is for file storage.",
            },
          ],
        },
        {
          id: "cs-aws-security",
          title: "Security & IAM",
          topic: "AWS Security",
          xpReward: 70,
          questions: [
            {
              id: "q-aws-iam1",
              text: "Which IAM principle should guide permission design in AWS?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Grant permissions to groups, not individuals, and use broad roles for simplicity" },
                { id: "b", text: "Least privilege — grant only the minimum permissions required for the task" },
                { id: "c", text: "Deny-by-default for IAM users; allow everything for IAM roles" },
                { id: "d", text: "Administrators should have AdministratorAccess for operational efficiency" },
              ],
              correctOptionId: "b",
              explanation: "The principle of least privilege means granting only the permissions needed to perform a specific task. This minimizes the blast radius of compromised credentials. AWS recommends using IAM roles with specific permission policies rather than broad access.",
            },
            {
              id: "q-aws-iam2",
              text: "An EC2 instance needs to read from an S3 bucket. What is the most secure way to provide credentials?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Store AWS access keys in environment variables on the EC2 instance" },
                { id: "b", text: "Hardcode credentials in the application configuration file" },
                { id: "c", text: "Attach an IAM role to the EC2 instance with S3 read permissions" },
                { id: "d", text: "Use the root account credentials with MFA" },
              ],
              correctOptionId: "c",
              explanation: "IAM roles attached to EC2 instances provide temporary, automatically-rotated credentials via the instance metadata service (IMDS). No secrets are stored on disk. Hardcoding or using environment variables for static credentials creates security risks if the instance is compromised.",
            },
            {
              id: "q-aws-iam3",
              text: "True or False: AWS CloudTrail records API calls made in your AWS account and can be used for security auditing and compliance.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "true",
              explanation: "AWS CloudTrail logs all API calls (who, what, when, from where) across your AWS account. It is the primary tool for security auditing, compliance investigation, and detecting unauthorized actions. Logs can be stored in S3 and analyzed with Athena or CloudWatch Logs Insights.",
            },
            {
              id: "q-aws-iam4",
              text: "A web application stores sensitive customer data in S3. The data must be encrypted at rest. Which approach requires the least operational overhead?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Encrypt data client-side before uploading to S3" },
                { id: "b", text: "Enable S3 Server-Side Encryption with AWS managed keys (SSE-S3)" },
                { id: "c", text: "Use a custom KMS key with manual rotation every 90 days" },
                { id: "d", text: "Implement application-level AES-256 encryption" },
              ],
              correctOptionId: "b",
              explanation: "SSE-S3 encrypts all objects automatically using AES-256 with AWS-managed keys. It requires no key management, no application changes, and adds no operational overhead. It can be enforced via bucket policy. Client-side and application-level encryption require code changes and key management.",
            },
            {
              id: "q-aws-iam5",
              text: "Which AWS service provides a Web Application Firewall (WAF) to protect against SQL injection and XSS attacks at the edge?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "AWS Shield" },
                { id: "b", text: "AWS WAF" },
                { id: "c", text: "Amazon GuardDuty" },
                { id: "d", text: "AWS Security Hub" },
              ],
              correctOptionId: "b",
              explanation: "AWS WAF (Web Application Firewall) filters HTTP/HTTPS traffic using rules to block SQL injection, XSS, and other OWASP Top 10 attacks. It integrates with CloudFront, ALB, and API Gateway. Shield provides DDoS protection. GuardDuty detects threats via log analysis. Security Hub aggregates findings.",
            },
          ],
        },
      ],
    },
    {
      id: "azure-az900",
      name: "Azure AZ-900: Microsoft Azure Fundamentals",
      description: "Foundational knowledge of cloud concepts and Microsoft Azure services. Covers core Azure services, pricing, governance, and security for cloud beginners.",
      passingScore: 70,
      durationMinutes: 65,
      challengeSets: [
        {
          id: "cs-azure-concepts",
          title: "Cloud Concepts",
          topic: "Cloud Fundamentals",
          xpReward: 50,
          questions: [
            {
              id: "q-az-cc1",
              text: "What is the primary benefit of cloud computing's 'pay-as-you-go' model?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "You pay a fixed monthly fee regardless of usage" },
                { id: "b", text: "You only pay for resources you consume, converting CapEx to OpEx" },
                { id: "c", text: "You receive a 100% discount on all services" },
                { id: "d", text: "You avoid all infrastructure management responsibilities" },
              ],
              correctOptionId: "b",
              explanation: "Pay-as-you-go converts capital expenditure (upfront hardware purchase) to operational expenditure (usage-based billing). This eliminates over-provisioning waste and aligns costs with actual consumption, improving financial flexibility.",
            },
            {
              id: "q-az-cc2",
              text: "Which cloud deployment model gives an organization complete control over infrastructure while still using cloud technology?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Public cloud" },
                { id: "b", text: "Hybrid cloud" },
                { id: "c", text: "Private cloud" },
                { id: "d", text: "Community cloud" },
              ],
              correctOptionId: "c",
              explanation: "A private cloud is dedicated to a single organization, hosted either on-premises or in a dedicated data center. It provides maximum control and customization but requires the organization to manage the infrastructure. Public cloud shares resources across customers.",
            },
            {
              id: "q-az-cc3",
              text: "True or False: In the IaaS model, the cloud provider manages the operating system, middleware, and application runtime.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "false",
              explanation: "In IaaS (Infrastructure as a Service), the cloud provider manages physical servers, networking, and storage (hypervisor layer). The customer is responsible for OS installation, patches, middleware, runtime, and applications. PaaS handles OS and runtime; SaaS handles everything.",
            },
            {
              id: "q-az-cc4",
              text: "What does 'scalability' mean in cloud computing?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "The ability to recover from disasters automatically" },
                { id: "b", text: "The ability to increase or decrease resources to match demand" },
                { id: "c", text: "The ability to run workloads in multiple geographic regions" },
                { id: "d", text: "The ability to use serverless functions" },
              ],
              correctOptionId: "b",
              explanation: "Scalability is the ability to adjust resource capacity up (scaling out/up) or down (scaling in/down) to match workload demand. Vertical scaling adds more power to existing resources; horizontal scaling adds more instances. This is a core cloud benefit over fixed on-premises capacity.",
            },
            {
              id: "q-az-cc5",
              text: "Which Azure feature guarantees a certain level of service availability expressed as a percentage (e.g. 99.9%)?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Azure SLA (Service Level Agreement)" },
                { id: "b", text: "Azure Policy" },
                { id: "c", text: "Azure Blueprints" },
                { id: "d", text: "Azure Cost Management" },
              ],
              correctOptionId: "a",
              explanation: "Azure SLAs define the guaranteed uptime and connectivity for each service. For example, Azure VMs have a 99.9% SLA for single instances with Premium SSD. If Azure fails to meet the SLA, customers receive service credits as compensation.",
            },
          ],
        },
        {
          id: "cs-azure-services",
          title: "Core Azure Services",
          topic: "Azure Services",
          xpReward: 60,
          questions: [
            {
              id: "q-az-s1",
              text: "Which Azure service provides serverless compute, allowing code to run without provisioning or managing servers?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Azure Virtual Machines" },
                { id: "b", text: "Azure Functions" },
                { id: "c", text: "Azure App Service" },
                { id: "d", text: "Azure Container Instances" },
              ],
              correctOptionId: "b",
              explanation: "Azure Functions is a serverless compute service that executes code in response to triggers (HTTP, timer, queue, etc.) without requiring server provisioning. You pay only for execution time. VMs require server management. App Service manages hosting but isn't serverless.",
            },
            {
              id: "q-az-s2",
              text: "What is the purpose of Azure Resource Groups?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "To group Azure regions for billing purposes" },
                { id: "b", text: "To logically organize Azure resources that share the same lifecycle" },
                { id: "c", text: "To define network boundaries between services" },
                { id: "d", text: "To set quotas and limits on resource creation" },
              ],
              correctOptionId: "b",
              explanation: "Resource Groups are logical containers for Azure resources. Resources in a group typically share the same lifecycle — deployed, managed, and deleted together. They also enable unified access control (RBAC), billing tracking, and tagging for all resources within the group.",
            },
            {
              id: "q-az-s3",
              text: "A company needs a managed relational database on Azure with automatic backups, patching, and high availability. Which service should they use?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "SQL Server on Azure Virtual Machine" },
                { id: "b", text: "Azure SQL Database" },
                { id: "c", text: "Azure Table Storage" },
                { id: "d", text: "Azure Cosmos DB" },
              ],
              correctOptionId: "b",
              explanation: "Azure SQL Database is a fully managed PaaS relational database that handles backups, patching, monitoring, and high availability automatically. SQL Server on VM is IaaS — you manage the OS and SQL Server. Table Storage and Cosmos DB are NoSQL services.",
            },
            {
              id: "q-az-s4",
              text: "True or False: Azure Active Directory (Azure AD / Entra ID) is primarily a domain controller replacement that requires on-premises infrastructure.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "false",
              explanation: "Azure AD (now Microsoft Entra ID) is a cloud-based identity and access management service. It is NOT a traditional Active Directory replacement — it uses REST APIs (OAuth 2.0, OIDC) rather than Kerberos/LDAP protocols. It requires no on-premises infrastructure and manages SaaS app access.",
            },
            {
              id: "q-az-s5",
              text: "Which Azure service provides content delivery with edge locations worldwide, reducing latency for static assets?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Azure Traffic Manager" },
                { id: "b", text: "Azure CDN (Content Delivery Network)" },
                { id: "c", text: "Azure Application Gateway" },
                { id: "d", text: "Azure Front Door" },
              ],
              correctOptionId: "b",
              explanation: "Azure CDN caches static content (images, CSS, JS, videos) at edge locations (Points of Presence) close to users, reducing latency and origin server load. Traffic Manager routes DNS traffic; Application Gateway is a layer-7 load balancer; Front Door combines CDN + global load balancing.",
            },
          ],
        },
        {
          id: "cs-azure-governance",
          title: "Pricing, Governance & Compliance",
          topic: "Azure Governance",
          xpReward: 50,
          questions: [
            {
              id: "q-az-g1",
              text: "Which Azure tool helps you estimate the monthly cost of an Azure solution before deploying it?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Azure Advisor" },
                { id: "b", text: "Azure Pricing Calculator" },
                { id: "c", text: "Azure Cost Management" },
                { id: "d", text: "Azure Monitor" },
              ],
              correctOptionId: "b",
              explanation: "The Azure Pricing Calculator lets you configure hypothetical Azure solutions and estimate monthly costs before deployment. Azure Cost Management tracks and analyzes actual spending after resources are deployed. Advisor provides recommendations. Monitor tracks performance.",
            },
            {
              id: "q-az-g2",
              text: "What is the purpose of Azure Policy?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "To define user access permissions for Azure resources" },
                { id: "b", text: "To enforce organizational rules and assess compliance across Azure resources" },
                { id: "c", text: "To create backup policies for Azure VMs" },
                { id: "d", text: "To manage software update schedules" },
              ],
              correctOptionId: "b",
              explanation: "Azure Policy creates rules (policies) that enforce or audit resource configurations. For example, 'All storage accounts must use HTTPS only' or 'VMs must be deployed in specific regions.' Policies assess compliance and can prevent or remediate non-compliant resources.",
            },
            {
              id: "q-az-g3",
              text: "True or False: The Azure Free tier provides $200 credit for the first 30 days plus select services free for 12 months.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "true",
              explanation: "Azure's free account includes $200 credit to explore any Azure service for the first 30 days, plus 55+ services free for 12 months (e.g., B1s VMs, 5 GB Blob Storage, Azure SQL Database). Some services remain permanently free (Azure Functions 1M executions/month).",
            },
            {
              id: "q-az-g4",
              text: "What is the Azure Trust Center used for?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Managing Azure subscriptions and billing accounts" },
                { id: "b", text: "Information about Microsoft's security, privacy, and compliance commitments" },
                { id: "c", text: "Monitoring Azure service health and outages" },
                { id: "d", text: "Creating and managing Azure Active Directory tenants" },
              ],
              correctOptionId: "b",
              explanation: "The Azure Trust Center (now part of Microsoft Trust Center) provides documentation on Microsoft's security practices, privacy commitments, compliance certifications (ISO 27001, SOC 2, GDPR, HIPAA), and data handling policies. It's used by compliance teams evaluating Azure.",
            },
            {
              id: "q-az-g5",
              text: "A company wants to prevent any Azure subscription from creating resources outside the EU regions. Which Azure feature enforces this?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Azure Blueprints" },
                { id: "b", text: "Azure Policy with 'Allowed locations' definition" },
                { id: "c", text: "Azure RBAC with geographic restrictions" },
                { id: "d", text: "Azure Management Groups with region locks" },
              ],
              correctOptionId: "b",
              explanation: "Azure Policy's built-in 'Allowed locations' policy definition restricts which Azure regions resources can be deployed to. Assigning this policy to a subscription prevents creation of resources in non-approved regions. RBAC controls who can do what, not where.",
            },
          ],
        },
      ],
    },
    {
      id: "scrum-psm-i",
      name: "Scrum PSM-I: Professional Scrum Master I",
      description: "Demonstrate your understanding of Scrum theory, practices, and principles as defined in the Scrum Guide. Covers Sprint events, roles, artifacts, and empirical process control.",
      passingScore: 85,
      durationMinutes: 60,
      challengeSets: [
        {
          id: "cs-scrum-theory",
          title: "Scrum Theory & Values",
          topic: "Scrum Fundamentals",
          xpReward: 50,
          questions: [
            {
              id: "q-scrum-t1",
              text: "Scrum is founded on three pillars of empirical process control. What are they?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Planning, Execution, Review" },
                { id: "b", text: "Transparency, Inspection, Adaptation" },
                { id: "c", text: "Commitment, Focus, Openness" },
                { id: "d", text: "Velocity, Capacity, Throughput" },
              ],
              correctOptionId: "b",
              explanation: "The three pillars of empiricism in Scrum are Transparency (making work and progress visible), Inspection (regularly checking progress toward goals), and Adaptation (adjusting when deviation is detected). These pillars enable empirical process control for complex work.",
            },
            {
              id: "q-scrum-t2",
              text: "Which of the following is NOT one of the five Scrum values?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Courage" },
                { id: "b", text: "Efficiency" },
                { id: "c", text: "Focus" },
                { id: "d", text: "Openness" },
              ],
              correctOptionId: "b",
              explanation: "The five Scrum values are Commitment, Courage, Focus, Openness, and Respect. 'Efficiency' is not a Scrum value. The values support trust and empiricism within the Scrum Team and guide decision-making throughout the Sprint.",
            },
            {
              id: "q-scrum-t3",
              text: "True or False: A Sprint can be extended if the Developers determine they need more time to meet the Sprint Goal.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "false",
              explanation: "Sprints have a fixed duration of one month or less and are never extended. If work cannot be completed, the Sprint Goal is still pursued with what was completed. The Sprint may be cancelled only by the Product Owner if the Sprint Goal becomes obsolete. Sprints have a consistent cadence.",
            },
            {
              id: "q-scrum-t4",
              text: "What is the maximum length of a Sprint in Scrum?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "2 weeks" },
                { id: "b", text: "4 weeks (1 month)" },
                { id: "c", text: "6 weeks" },
                { id: "d", text: "There is no maximum — the team decides" },
              ],
              correctOptionId: "b",
              explanation: "The Scrum Guide specifies Sprints are one month or less. Shorter Sprints generate more learning cycles and limit risk. Sprints longer than one month lose the benefits of frequent inspection and adaptation. The team should choose the shortest Sprint that delivers value consistently.",
            },
            {
              id: "q-scrum-t5",
              text: "Who is responsible for cancelling a Sprint?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "The Scrum Master" },
                { id: "b", text: "The Developers" },
                { id: "c", text: "The Product Owner" },
                { id: "d", text: "The stakeholders by majority vote" },
              ],
              correctOptionId: "c",
              explanation: "Only the Product Owner has the authority to cancel a Sprint, and only if the Sprint Goal becomes obsolete. This might happen due to a major business change making the goal irrelevant. Cancellation is rare and traumatic for the team. The Scrum Master or Developers cannot cancel a Sprint.",
            },
          ],
        },
        {
          id: "cs-scrum-events",
          title: "Scrum Events & Artifacts",
          topic: "Scrum Practices",
          xpReward: 60,
          questions: [
            {
              id: "q-scrum-e1",
              text: "What is the maximum timebox for Sprint Planning for a one-month Sprint?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "2 hours" },
                { id: "b", text: "4 hours" },
                { id: "c", text: "8 hours" },
                { id: "d", text: "16 hours" },
              ],
              correctOptionId: "c",
              explanation: "Sprint Planning is timeboxed to a maximum of 8 hours for a one-month Sprint. For shorter Sprints, the event is usually shorter proportionally (e.g., 4 hours for a 2-week Sprint). The Scrum Team collectively plans the Sprint Goal, selected Product Backlog items, and how to deliver the Increment.",
            },
            {
              id: "q-scrum-e2",
              text: "The Daily Scrum is timeboxed to 15 minutes. Who is it primarily for?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "The Product Owner to get a status update" },
                { id: "b", text: "The Scrum Master to remove impediments" },
                { id: "c", text: "The Developers to inspect progress toward the Sprint Goal and adapt their plan" },
                { id: "d", text: "All stakeholders to review progress" },
              ],
              correctOptionId: "c",
              explanation: "The Daily Scrum is a 15-minute event for the Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog as needed. The Scrum Master and Product Owner may attend but are not required. It is not a status meeting for management — it's for the Developers to plan their day.",
            },
            {
              id: "q-scrum-e3",
              text: "True or False: The Sprint Retrospective occurs before the Sprint Review.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "false",
              explanation: "The correct order of Sprint events is: Sprint Planning → (Daily Scrums during Sprint) → Sprint Review → Sprint Retrospective. The Sprint Review (what was built) comes before the Retrospective (how the team worked). The Retrospective is the last event before the next Sprint begins.",
            },
            {
              id: "q-scrum-e4",
              text: "What is the Definition of Done (DoD)?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "A checklist of acceptance criteria for each Product Backlog item" },
                { id: "b", text: "A formal quality standard that creates transparency about what work is complete" },
                { id: "c", text: "The Product Owner's approval of a feature before release" },
                { id: "d", text: "The list of items selected for the current Sprint" },
              ],
              correctOptionId: "b",
              explanation: "The Definition of Done is a formal description of what it means for an Increment to meet quality standards. It creates a shared understanding of 'done' for the entire Scrum Team. When a Product Backlog item meets the DoD, the Increment is born. DoD is different from per-item acceptance criteria.",
            },
            {
              id: "q-scrum-e5",
              text: "Who is accountable for the Product Backlog?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "The Scrum Master" },
                { id: "b", text: "The Developers" },
                { id: "c", text: "The Product Owner" },
                { id: "d", text: "The entire Scrum Team jointly" },
              ],
              correctOptionId: "c",
              explanation: "The Product Owner is solely accountable for managing the Product Backlog, including its content, availability, and ordering. While Developers may help refine items, the Product Owner has final authority over what is in the backlog and the ordering of items to maximize value.",
            },
          ],
        },
        {
          id: "cs-scrum-master-role",
          title: "Scrum Master Accountabilities",
          topic: "Scrum Master",
          xpReward: 70,
          questions: [
            {
              id: "q-scrum-sm1",
              text: "A new Scrum team has a manager who assigns tasks to Developers daily, bypassing the Sprint Backlog process. What should the Scrum Master do?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Accept this — management authority overrides Scrum" },
                { id: "b", text: "Coach the manager on Scrum and how this disrupts the team's self-management" },
                { id: "c", text: "Inform the Developers to ignore the manager" },
                { id: "d", text: "Remove the manager from all Scrum events" },
              ],
              correctOptionId: "b",
              explanation: "The Scrum Master serves the organization by coaching leaders to understand Scrum. Direct task assignment violates self-management — Developers should pull work from the Sprint Backlog themselves. The Scrum Master should coach the manager without creating conflict, helping them understand how their actions affect empiricism.",
            },
            {
              id: "q-scrum-sm2",
              text: "True or False: The Scrum Master manages the Scrum Team and makes technical decisions.",
              type: "TRUE_FALSE" as const,
              options: [
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ],
              correctOptionId: "false",
              explanation: "The Scrum Master is not a manager — they are a servant-leader who coaches the team on Scrum, facilitates events, removes impediments, and helps the organization adopt Scrum. Technical decisions are made by the Developers. The Scrum Master has no authority over team members.",
            },
            {
              id: "q-scrum-sm3",
              text: "During the Sprint Retrospective, the team identifies a recurring impediment that prevents them from completing quality work. What is the Scrum Master's primary responsibility?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Document the impediment and submit it to management in writing" },
                { id: "b", text: "Help the team create actionable improvement items and ensure they are addressed" },
                { id: "c", text: "Escalate the issue directly to the executive team" },
                { id: "d", text: "Determine the root cause independently and implement the fix" },
              ],
              correctOptionId: "b",
              explanation: "The Scrum Master helps the Scrum Team identify and implement improvements. During the Retrospective, this means facilitating actionable improvement planning and ensuring at least one improvement item is addressed in the next Sprint. The Scrum Master removes organizational impediments that the team cannot resolve themselves.",
            },
            {
              id: "q-scrum-sm4",
              text: "A Product Owner is frequently unavailable for Sprint Planning and Backlog refinement. How should the Scrum Master respond?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "Have the Developers proceed without the Product Owner" },
                { id: "b", text: "Coach the Product Owner on their accountability and the impact of absence on the team" },
                { id: "c", text: "Cancel all Scrum events until the PO is available" },
                { id: "d", text: "Take over Product Owner responsibilities temporarily" },
              ],
              correctOptionId: "b",
              explanation: "The Scrum Master serves the Product Owner by coaching them on effective backlog management and ensuring they understand their accountability. PO availability is critical for Sprint Planning and refinement — the Scrum Master should help the organization understand this and create conditions for the PO to be engaged.",
            },
            {
              id: "q-scrum-sm5",
              text: "What does 'self-managing' mean for a Scrum Team?",
              type: "MCQ" as const,
              options: [
                { id: "a", text: "The team has no Product Owner or Scrum Master" },
                { id: "b", text: "The team internally decides who does what, when, and how" },
                { id: "c", text: "Each Developer works independently without team coordination" },
                { id: "d", text: "The team selects its own Sprint duration" },
              ],
              correctOptionId: "b",
              explanation: "Self-managing means the Scrum Team (specifically the Developers) choose how best to accomplish their work — deciding who picks up which tasks, how to approach technical problems, and how to organize their day. This contrasts with being managed externally. The team is given a goal (Sprint Goal) and decides how to achieve it.",
            },
          ],
        },
      ],
    },
  ];

  for (const examData of additionalExams) {
    const { challengeSets: examChallengeSets, ...examInfo } = examData;

    const addlExam = await prisma.exam.upsert({
      where: { id: examInfo.id },
      update: {},
      create: examInfo,
    });

    console.log(`  Created exam: ${addlExam.name}`);

    for (const cs of examChallengeSets) {
      const { questions, ...csData } = cs;

      const challengeSet = await prisma.challengeSet.upsert({
        where: { id: csData.id },
        update: {},
        create: { ...csData, examId: addlExam.id },
      });

      console.log(`    Created challenge set: ${challengeSet.title}`);

      for (const q of questions) {
        await prisma.question.upsert({
          where: { id: q.id },
          update: {},
          create: {
            ...q,
            challengeSetId: challengeSet.id,
            examId: addlExam.id,
          },
        });
      }

      console.log(`      Seeded ${questions.length} questions`);
    }
  }

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
