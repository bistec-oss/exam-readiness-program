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

  // Scenario-based challenge sets from the official Claude Certified Architect exam guide
  const scenarioChallengeSets = [
    {
      id: "cs-customer-support-agent",
      title: "Customer Support Resolution Agent",
      topic: "Agentic Architecture",
      xpReward: 80,
      questions: [
        {
          id: "q-csa-1",
          text: "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name, occasionally leading to misidentified accounts and incorrect refunds. What change would most effectively address this reliability issue?",
          preamble: "Scenario: You are designing a customer support AI agent for a retail company. The agent handles order inquiries, refunds, and damage replacements using tools: get_customer, lookup_order, and process_refund.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID." },
            { id: "b", text: "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations." },
            { id: "c", text: "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details." },
            { id: "d", text: "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type." },
          ],
          correctOptionId: "a",
          explanation: "When a specific tool sequence is required for critical business logic (like verifying customer identity before processing refunds), programmatic enforcement provides deterministic guarantees that prompt-based approaches cannot. Options B and C rely on probabilistic LLM compliance, which is insufficient when errors have financial consequences. Option D addresses tool availability rather than tool ordering, which is not the actual problem.",
        },
        {
          id: "q-csa-2",
          text: "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., 'check my order #12345'), instead of calling lookup_order. Both tools have minimal descriptions ('Retrieves customer information' / 'Retrieves order details') and accept similar identifier formats. What's the most effective first step to improve tool selection reliability?",
          preamble: "Scenario: You are designing a customer support AI agent for a retail company. The agent handles order inquiries, refunds, and damage replacements using tools: get_customer, lookup_order, and process_refund.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples showing order-related queries routing to lookup_order." },
            { id: "b", text: "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools." },
            { id: "c", text: "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns." },
            { id: "d", text: "Consolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query." },
          ],
          correctOptionId: "b",
          explanation: "Tool descriptions are the primary mechanism LLMs use for tool selection. When descriptions are minimal, models lack the context to differentiate between similar tools. Option B directly addresses this root cause with a low-effort, high-leverage fix. Few-shot examples (A) add token overhead without fixing the underlying issue. A routing layer (C) is over-engineered and bypasses the LLM's natural language understanding. Consolidating tools (D) is a valid architectural choice but requires more effort than a 'first step' warrants when the immediate problem is inadequate descriptions.",
        },
        {
          id: "q-csa-3",
          text: "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions. What's the most effective way to improve escalation calibration?",
          preamble: "Scenario: You are designing a customer support AI agent for a retail company. The agent handles order inquiries, refunds, and damage replacements using tools: get_customer, lookup_order, and process_refund.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously." },
            { id: "b", text: "Have the agent self-report a confidence score (1-10) before each response and automatically route requests to humans when confidence falls below a threshold." },
            { id: "c", text: "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing." },
            { id: "d", text: "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold." },
          ],
          correctOptionId: "a",
          explanation: "Adding explicit escalation criteria with few-shot examples directly addresses the root cause: unclear decision boundaries. This is the proportionate first response before adding infrastructure. Option B fails because LLM self-reported confidence is poorly calibrated—the agent is already incorrectly confident on hard cases. Option C is over-engineered, requiring labeled data and ML infrastructure when prompt optimization hasn't been tried. Option D solves a different problem entirely; sentiment doesn't correlate with case complexity, which is the actual issue.",
        },
      ],
    },
    {
      id: "cs-claude-code-dev",
      title: "Code Generation with Claude Code",
      topic: "Claude Code Configuration",
      xpReward: 80,
      questions: [
        {
          id: "q-ccd-1",
          text: "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository. Where should you create this command file?",
          preamble: "Scenario: Your team uses Claude Code for developer productivity. You are configuring Claude Code for a shared repository used by multiple developers.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "In the .claude/commands/ directory in the project repository" },
            { id: "b", text: "In ~/.claude/commands/ in each developer's home directory" },
            { id: "c", text: "In the CLAUDE.md file at the project root" },
            { id: "d", text: "In a .claude/config.json file with a commands array" },
          ],
          correctOptionId: "a",
          explanation: "Project-scoped custom slash commands should be stored in the .claude/commands/ directory within the repository. These commands are version-controlled and automatically available to all developers when they clone or pull the repo. Option B (~/.claude/commands/) is for personal commands that aren't shared via version control. Option C (CLAUDE.md) is for project instructions and context, not command definitions. Option D describes a configuration mechanism that doesn't exist in Claude Code.",
        },
        {
          id: "q-ccd-2",
          text: "You've been assigned to restructure the team's monolithic application into microservices. This will involve changes across dozens of files and requires decisions about service boundaries and module dependencies. Which approach should you take?",
          preamble: "Scenario: Your team uses Claude Code for developer productivity. You are configuring Claude Code for a shared repository used by multiple developers.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes." },
            { id: "b", text: "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries." },
            { id: "c", text: "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured." },
            { id: "d", text: "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation." },
          ],
          correctOptionId: "a",
          explanation: "Plan mode is designed for complex tasks involving large-scale changes, multiple valid approaches, and architectural decisions—exactly what monolith-to-microservices restructuring requires. It enables safe codebase exploration and design before committing to changes. Option B risks costly rework when dependencies are discovered late. Option C assumes you already know the right structure without exploring the code. Option D ignores that the complexity is already stated in the requirements, not something that might emerge later.",
        },
        {
          id: "q-ccd-3",
          text: "Your codebase has distinct areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow a repository pattern. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx), and you want all tests to follow the same conventions regardless of location. What's the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
          preamble: "Scenario: Your team uses Claude Code for developer productivity. You are configuring Claude Code for a shared repository used by multiple developers.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths" },
            { id: "b", text: "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies" },
            { id: "c", text: "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files" },
            { id: "d", text: "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions" },
          ],
          correctOptionId: "a",
          explanation: "Option A is correct because .claude/rules/ with glob patterns (e.g., **/*.test.tsx) allows conventions to be automatically applied based on file paths regardless of directory location—essential for test files spread throughout the codebase. Option B relies on inference rather than explicit matching, making it unreliable. Option C requires manual skill invocation or relies on Claude choosing to load them, contradicting the need for deterministic 'automatic' application based on file paths. Option D can't easily handle files spread across many directories since CLAUDE.md files are directory-bound.",
        },
      ],
    },
    {
      id: "cs-multi-agent-research",
      title: "Multi-Agent Research System",
      topic: "Multi-Agent Orchestration",
      xpReward: 90,
      questions: [
        {
          id: "q-mar-1",
          text: "After running the system on the topic 'impact of AI on creative industries,' you observe that each subagent completes successfully: the web search agent finds relevant articles, the document analysis agent summarizes papers correctly, and the synthesis agent produces coherent output. However, the final reports cover only visual arts, completely missing music, writing, and film production. When you examine the coordinator's logs, you see it decomposed the topic into three subtasks: 'AI in digital art creation,' 'AI in graphic design,' and 'AI in photography.' What is the most likely root cause?",
          preamble: "Scenario: You are building a multi-agent research system with a coordinator agent that delegates to specialized subagents: a web search agent, a document analysis agent, and a synthesis agent.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents." },
            { id: "b", text: "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic." },
            { id: "c", text: "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors." },
            { id: "d", text: "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria." },
          ],
          correctOptionId: "b",
          explanation: "The coordinator's logs reveal the root cause directly: it decomposed 'creative industries' into only visual arts subtasks (digital art, graphic design, photography), completely omitting music, writing, and film. The subagents executed their assigned tasks correctly—the problem is what they were assigned. Options A, C, and D incorrectly blame downstream agents that are working correctly within their assigned scope.",
        },
        {
          id: "q-mar-2",
          text: "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent. Which error propagation approach best enables intelligent recovery?",
          preamble: "Scenario: You are building a multi-agent research system with a coordinator agent that delegates to specialized subagents: a web search agent, a document analysis agent, and a synthesis agent.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches." },
            { id: "b", text: "Implement automatic retry logic with exponential backoff within the subagent, returning a generic 'search unavailable' status only after all retries are exhausted." },
            { id: "c", text: "Catch the timeout within the subagent and return an empty result set marked as successful." },
            { id: "d", text: "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow." },
          ],
          correctOptionId: "a",
          explanation: "Structured error context gives the coordinator the information it needs to make intelligent recovery decisions—whether to retry with a modified query, try an alternative approach, or proceed with partial results. Option B's generic status hides valuable context from the coordinator, preventing informed decisions. Option C suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs. Option D terminates the entire workflow unnecessarily when recovery strategies could succeed.",
        },
        {
          id: "q-mar-3",
          text: "During testing, you observe that the synthesis agent frequently needs to verify specific claims while combining findings. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Your evaluation shows that 85% of these verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?",
          preamble: "Scenario: You are building a multi-agent research system with a coordinator agent that delegates to specialized subagents: a web search agent, a document analysis agent, and a synthesis agent.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator." },
            { id: "b", text: "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once." },
            { id: "c", text: "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator." },
            { id: "d", text: "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify." },
          ],
          correctOptionId: "a",
          explanation: "Option A applies the principle of least privilege by giving the synthesis agent only what it needs for the 85% common case (simple fact verification) while preserving the existing coordination pattern for complex cases. Option B's batching approach creates blocking dependencies since synthesis steps may depend on earlier verified facts. Option C over-provisions the synthesis agent, violating separation of concerns. Option D relies on speculative caching that cannot reliably predict what the synthesis agent will need to verify.",
        },
      ],
    },
    {
      id: "cs-claude-code-cicd",
      title: "Claude Code for Continuous Integration",
      topic: "CI/CD Automation",
      xpReward: 90,
      questions: [
        {
          id: "q-ccci-1",
          text: "Your pipeline script runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input. What's the correct approach to run Claude Code in an automated pipeline?",
          preamble: "Scenario: Your team uses Claude Code to automate code review and analysis in your CI/CD pipeline. You need to integrate Claude Code into GitHub Actions workflows.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add the -p flag: claude -p \"Analyze this pull request for security issues\"" },
            { id: "b", text: "Set the environment variable CLAUDE_HEADLESS=true before running the command" },
            { id: "c", text: "Redirect stdin from /dev/null: claude \"Analyze this pull request for security issues\" < /dev/null" },
            { id: "d", text: "Add the --batch flag: claude --batch \"Analyze this pull request for security issues\"" },
          ],
          correctOptionId: "a",
          explanation: "The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input—exactly what CI/CD pipelines require. The other options reference non-existent features (CLAUDE_HEADLESS environment variable, --batch flag) or use Unix workarounds that don't properly address Claude Code's command syntax.",
        },
        {
          id: "q-ccci-2",
          text: "Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?",
          preamble: "Scenario: Your team uses Claude Code to automate code review and analysis in your CI/CD pipeline. You need to integrate Claude Code into GitHub Actions workflows.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks." },
            { id: "b", text: "Switch both workflows to batch processing with status polling to check for completion." },
            { id: "c", text: "Keep real-time calls for both workflows to avoid batch result ordering issues." },
            { id: "d", text: "Switch both to batch processing with a timeout fallback to real-time if batches take too long." },
          ],
          correctOptionId: "a",
          explanation: "The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA. This makes it unsuitable for blocking pre-merge checks where developers wait for results, but ideal for overnight batch jobs like technical debt reports. Option B is wrong because relying on 'often faster' completion isn't acceptable for blocking workflows. Option C reflects a misconception—batch results can be correlated using custom_id fields. Option D adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case.",
        },
        {
          id: "q-ccci-3",
          text: "A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback—flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?",
          preamble: "Scenario: Your team uses Claude Code to automate code review and analysis in your CI/CD pipeline. You need to integrate Claude Code into GitHub Actions workflows.",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow." },
            { id: "b", text: "Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs." },
            { id: "c", text: "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass." },
            { id: "d", text: "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs." },
          ],
          correctOptionId: "a",
          explanation: "Splitting reviews into focused passes directly addresses the root cause: attention dilution when processing many files at once. File-by-file analysis ensures consistent depth, while a separate integration pass catches cross-file issues. Option B shifts burden to developers without improving the system. Option C misunderstands that larger context windows don't solve attention quality issues. Option D would actually suppress detection of real bugs by requiring consensus on issues that may only be caught intermittently.",
        },
      ],
    },
  ];

  for (const cs of scenarioChallengeSets) {
    const { questions, ...csData } = cs;

    const challengeSet = await prisma.challengeSet.upsert({
      where: { id: csData.id },
      update: {},
      create: { ...csData, examId: exam.id },
    });

    console.log(`  Created scenario challenge set: ${challengeSet.title}`);

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

    console.log(`    Seeded ${questions.length} scenario questions`);
  }

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
