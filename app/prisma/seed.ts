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

  // Additional scenario-based challenge sets (v2 question set expansion)
  const scenarioChallengeSetsV2 = [
    {
      id: "cs-v2-scenario-1-customer-support-agent",
      title: "Customer Support Agent — Reliability & Idempotency",
      topic: "Customer Support Agent — Reliability & Idempotency",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s1-1",
          preamble: "Scenario: You maintain a customer support agent built on the Claude Agent SDK. It handles returns, billing disputes, and account questions through tools including get_customer, lookup_order, process_refund, and escalate_to_human, and is expected to resolve most contacts without human involvement.",
          text: "A customer's message says: 'My last order arrived damaged, and while you're at it can you also update my shipping address for future orders?' The agent processes the refund request but silently drops the address-change request, leaving the customer to notice later that nothing changed. What's the best fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the agent explicitly enumerate each distinct request in the message and confirm resolution (or a follow-up step) for every one before ending the turn." },
            { id: "b", text: "Add a rule that the agent may only act on the first request in any multi-part message, and ask the customer to resend every other request in a separate follow-up." },
            { id: "c", text: "Increase the agent's max_tokens so it has enough room to respond to every request." },
            { id: "d", text: "Have the agent always send a single combined confirmation message regardless of how many requests were embedded in it." },
          ],
          correctOptionId: "a",
          explanation: "Silently dropping part of a multi-concern request is a decomposition failure — the fix is explicit tracking and confirmation of every sub-request, not limiting customers to one ask per message (B) or hoping more tokens fixes attention (C). A single generic confirmation (D) doesn't guarantee every concern was actually handled.",
        },
        {
          id: "q-v2-s1-2",
          preamble: "Scenario: You maintain a customer support agent built on the Claude Agent SDK. It handles returns, billing disputes, and account questions through tools including get_customer, lookup_order, process_refund, and escalate_to_human, and is expected to resolve most contacts without human involvement.",
          text: "get_customer successfully returns a verified customer ID, and the agent then calls lookup_order with an order number the customer typed in. The order happens to belong to a different customer account than the one just verified, and the agent proceeds to process a refund on it. What control was missing?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A retry policy that automatically re-runs get_customer whenever the very first call is slow, times out, or returns any kind of transient network error." },
            { id: "b", text: "A check, after lookup_order returns, that the order's owning customer ID matches the verified customer ID before any mutating action is allowed." },
            { id: "c", text: "A rule requiring the agent to ask for the customer's date of birth in addition to their name." },
            { id: "d", text: "A confidence score threshold before process_refund can be called." },
          ],
          correctOptionId: "b",
          explanation: "Verifying that get_customer ran isn't the same as verifying the customer owns the specific order being acted on. The missing control is an explicit ownership check comparing the order's customer ID to the verified identity before any mutating tool call. Extra identity questions (C) or confidence thresholds (D) don't close this specific authorization gap, and retrying get_customer (A) doesn't address order ownership at all.",
        },
        {
          id: "q-v2-s1-3",
          preamble: "Scenario: You maintain a customer support agent built on the Claude Agent SDK. It handles returns, billing disputes, and account questions through tools including get_customer, lookup_order, process_refund, and escalate_to_human, and is expected to resolve most contacts without human involvement.",
          text: "A customer provides a name and email, but get_customer returns zero matching accounts — the spelling might be off, or the customer might be using a different email than the one on file. What should the agent do next?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Create a new customer record automatically so the conversation can continue." },
            { id: "b", text: "Proceed with process_refund using only the order number, since get_customer already ran once successfully earlier in the same conversation." },
            { id: "c", text: "Ask for an alternative identifier (e.g., order number or phone number) and retry the lookup rather than guessing or proceeding unverified." },
            { id: "d", text: "Escalate to a human immediately without attempting any further lookup." },
          ],
          correctOptionId: "c",
          explanation: "Zero matches usually mean a typo or a different identifier on file, not that the account doesn't exist — the proportionate response is to ask for another identifier and retry, the same logic used when a lookup returns duplicate matches. Fabricating a new record (A) or proceeding unverified (B) breaks identity verification entirely, and jumping straight to escalation (D) skips a simple resolution step a human agent would also try first.",
        },
        {
          id: "q-v2-s1-4",
          preamble: "Scenario: You maintain a customer support agent built on the Claude Agent SDK. It handles returns, billing disputes, and account questions through tools including get_customer, lookup_order, process_refund, and escalate_to_human, and is expected to resolve most contacts without human involvement.",
          text: "process_refund times out with no response — the agent doesn't know if the refund actually posted before the connection dropped. The agent's retry logic simply calls process_refund again with the same parameters, and in production the customer twice received two refunds for one order. What should the retry logic do instead?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Increase the timeout duration so the call has more time to complete before retrying." },
            { id: "b", text: "Skip the retry entirely and tell the customer refunds cannot be processed today." },
            { id: "c", text: "Retry with a longer delay between attempts to give the backend time to recover." },
            { id: "d", text: "Check the order's current refund status (or use an idempotency key) before retrying, so a successful-but-unacknowledged call can't be duplicated." },
          ],
          correctOptionId: "d",
          explanation: "A timeout doesn't tell you whether the mutating call actually succeeded server-side, so blind retries risk duplicate refunds. The safe pattern is to check current state (or use an idempotency key) before retrying a mutating action. Longer timeouts (A) or delays (C) don't address the ambiguity of an already-sent request, and refusing to retry at all (B) is an overcorrection that blocks legitimate cases.",
        },
        {
          id: "q-v2-s1-5",
          preamble: "Scenario: You maintain a customer support agent built on the Claude Agent SDK. It handles returns, billing disputes, and account questions through tools including get_customer, lookup_order, process_refund, and escalate_to_human, and is expected to resolve most contacts without human involvement.",
          text: "A customer requests a refund for an item explicitly marked non-refundable in policy, with no ambiguity about the circumstances. The agent still escalates the request to a human queue 'to be safe,' adding delay for a case with an obvious answer. What's the better design?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "When policy clearly denies a request, decline directly with a clear explanation, reserving escalation for genuinely ambiguous or policy-silent cases." },
            { id: "b", text: "Escalate every refund denial to a human as a blanket safety measure, regardless of how clear or unambiguous the underlying policy language is." },
            { id: "c", text: "Have the agent approve the refund anyway to avoid a negative customer interaction." },
            { id: "d", text: "Have the agent ask the customer to argue their case before deciding whether to escalate." },
          ],
          correctOptionId: "a",
          explanation: "Escalation exists for ambiguity, not for every denial — when policy is unambiguous, the agent should decline directly and explain why, saving human review for genuinely unclear cases (contrast with policy-silent requests, which do warrant escalation). Blanket escalation (B) defeats the purpose of automation, approving anyway (C) violates policy, and asking the customer to argue (D) doesn't change a clear-cut policy outcome.",
        },
      ],
    },
    {
      id: "cs-v2-scenario-2-code-generation",
      title: "Claude Code Session & Context Management",
      topic: "Claude Code Session & Context Management",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s2-1",
          preamble: "Scenario: Your team relies on Claude Code for day-to-day development — generating new code, refactoring, debugging, and writing documentation across a shared repository.",
          text: "Developers occasionally ask Claude Code to commit changes before running the test suite, and a broken commit lands on main. The team's CLAUDE.md already says 'always run tests before committing,' but the instruction is followed inconsistently. What's the most reliable fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Repeat the instruction in bold at the top of CLAUDE.md so it's harder to miss." },
            { id: "b", text: "Add a PreToolUse hook that blocks the git commit command unless the test suite has run and passed." },
            { id: "c", text: "Ask Claude to double-check with the developer before every commit." },
            { id: "d", text: "Move the instruction into a slash command that developers run before committing." },
          ],
          correctOptionId: "b",
          explanation: "CLAUDE.md instructions are probabilistic — a PreToolUse hook gives a deterministic, code-level gate on the commit tool itself, which is the reliable fix when compliance with a written instruction is inconsistent. Repeating the instruction (A) or asking Claude to double-check (C) are still prompt-based and can be skipped, and a slash command (D) still depends on someone remembering to invoke it.",
        },
        {
          id: "q-v2-s2-2",
          preamble: "Scenario: Your team relies on Claude Code for day-to-day development — generating new code, refactoring, debugging, and writing documentation across a shared repository.",
          text: "A long Claude Code session has useful mid-session findings about the codebase's module boundaries, but the early exploration is now irrelevant and the context window is filling up. Running /clear would erase everything, including the useful findings. What should the developer do instead?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Run /clear anyway, since discarding stale exploration is more important than preserving findings." },
            { id: "b", text: "Do nothing and let the context window fill up naturally until the session errors out." },
            { id: "c", text: "Run /compact so the session is summarized and condensed instead of erased." },
            { id: "d", text: "Start a brand-new session and manually re-explain the module boundaries from memory." },
          ],
          correctOptionId: "c",
          explanation: "/compact summarizes and condenses a session's context rather than discarding it outright, which is exactly what's needed when some earlier content is still valuable. /clear (A) throws away everything including the useful findings, doing nothing (B) risks hitting the context limit, and starting over (D) wastes the exploration work already done.",
        },
        {
          id: "q-v2-s2-3",
          preamble: "Scenario: Your team relies on Claude Code for day-to-day development — generating new code, refactoring, debugging, and writing documentation across a shared repository.",
          text: "A developer asks Claude Code to add the same boilerplate error-handling wrapper to 20 independent API handler files. Doing this in the main conversation fills the context with repetitive diffs and slows down later requests in the same session. What's a better approach?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Ask Claude to skip some of the files to keep the session shorter." },
            { id: "b", text: "Increase the model's context window setting before starting." },
            { id: "c", text: "Do the edits one file at a time across 20 separate sessions, closing and reopening each time." },
            { id: "d", text: "Dispatch the edits to subagents via the Task tool so the diffs don't bloat the main context." },
          ],
          correctOptionId: "d",
          explanation: "Delegating repetitive, independent edits to subagents keeps the verbose diffs out of the main context, preserving it for higher-level decisions. Skipping files (A) doesn't complete the task, there's no user-facing 'context window setting' to increase (B), and closing/reopening a session per file (C) is slow and loses continuity without solving the context bloat.",
        },
        {
          id: "q-v2-s2-4",
          preamble: "Scenario: Your team relies on Claude Code for day-to-day development — generating new code, refactoring, debugging, and writing documentation across a shared repository.",
          text: "A developer wants Claude Code to always use their preferred test runner flags on their machine, without pushing that preference into the shared repo config that every teammate uses. Where should this preference go?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "In .claude/settings.local.json, which is personal and excluded from version control." },
            { id: "b", text: "In the shared .claude/settings.json, since flags are a small change." },
            { id: "c", text: "In the root CLAUDE.md, under a new 'personal preferences' section." },
            { id: "d", text: "In ~/.claude/commands/, as a new slash command every teammate can run." },
          ],
          correctOptionId: "a",
          explanation: "settings.local.json is the personal, git-ignored counterpart to the shared settings.json — exactly the place for machine-specific preferences that shouldn't propagate to teammates. Putting it in settings.json (B) or CLAUDE.md (C) pushes a personal preference onto the whole team, and a shared command (D) doesn't scope the preference to just this developer.",
        },
        {
          id: "q-v2-s2-5",
          preamble: "Scenario: Your team relies on Claude Code for day-to-day development — generating new code, refactoring, debugging, and writing documentation across a shared repository.",
          text: "Claude Code's first attempt at fixing an intermittent race condition just adds a delay that masks the symptom rather than fixing the underlying ordering problem. The developer wants Claude to reason more carefully about the root cause before proposing a fix. What helps most?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Ask Claude to try five different fixes in a row and pick whichever one happens to compile without errors." },
            { id: "b", text: "Enable extended thinking so Claude reasons through the root cause before proposing a fix." },
            { id: "c", text: "Reduce the prompt to a single sentence so Claude responds faster." },
            { id: "d", text: "Switch to a smaller, faster model so more attempts can be tried per minute." },
          ],
          correctOptionId: "b",
          explanation: "Extended thinking gives the model more room to reason step-by-step through a subtle root cause before committing to a fix, which is what a masked-symptom bug like this needs. Trying many fixes at random (A) doesn't diagnose the cause, a terser prompt (C) removes useful context, and a smaller/faster model (D) trades reasoning depth for speed on exactly the wrong axis.",
        },
      ],
    },
    {
      id: "cs-v2-scenario-3-multi-agent-research",
      title: "Multi-Agent Coordinator Reliability",
      topic: "Multi-Agent Coordinator Reliability",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s3-1",
          preamble: "Scenario: You operate a multi-agent research system where a coordinator delegates topic subtasks to specialized subagents (web search, document analysis, synthesis, report generation) and assembles their outputs into a cited report.",
          text: "For the topic 'remote work trends,' the coordinator assigns the entire topic as one subtask to a single subagent rather than breaking it into narrower subtopics. The resulting report is broad but shallow, with only a sentence or two on any given trend. What's the likely fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Give the subagent a longer timeout so it can research more thoroughly." },
            { id: "b", text: "Ask the synthesis agent to expand each sentence into a paragraph afterward." },
            { id: "c", text: "Split the topic into narrower subtopics, one per subagent." },
            { id: "d", text: "Merge the coordinator and subagent into a single agent to simplify the pipeline." },
          ],
          correctOptionId: "c",
          explanation: "An overly broad subtask produces shallow coverage because one subagent can't go deep on every angle at once — the fix is finer-grained decomposition, the mirror image of assigning subtasks too narrowly. A longer timeout (A) doesn't add depth by itself, padding sentences after the fact (B) manufactures length without research, and collapsing the pipeline (D) removes the specialization that depth requires.",
        },
        {
          id: "q-v2-s3-2",
          preamble: "Scenario: You operate a multi-agent research system where a coordinator delegates topic subtasks to specialized subagents (web search, document analysis, synthesis, report generation) and assembles their outputs into a cited report.",
          text: "For a broad topic, the coordinator emits 40 parallel Task calls in a single response. The run hits API rate limits and several subagents fail outright. What should the coordinator do differently?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Retry every failed subagent immediately with the same 40-way fan-out." },
            { id: "b", text: "Switch all subagents to a cheaper model so failures matter less." },
            { id: "c", text: "Remove the coordinator and let each subagent run independently, unmanaged." },
            { id: "d", text: "Cap concurrent subagents and run the remaining work in waves." },
          ],
          correctOptionId: "d",
          explanation: "Spawning far more subagents than the API can sustain at once causes rate-limit failures — the fix is bounding concurrency and running the work in batches rather than one massive fan-out. Retrying the same fan-out (A) reproduces the failure, a cheaper model (B) doesn't address rate limits, and removing coordination (C) loses the ability to manage load at all.",
        },
        {
          id: "q-v2-s3-3",
          preamble: "Scenario: You operate a multi-agent research system where a coordinator delegates topic subtasks to specialized subagents (web search, document analysis, synthesis, report generation) and assembles their outputs into a cited report.",
          text: "A subagent's finding cites a source URL that, on inspection, was never actually retrieved during that subagent's search — the citation looks plausible but doesn't correspond to real evidence. What should the system's instructions require?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Require subagents to cite only sources they actually retrieved and flag unsupported claims instead of fabricating one." },
            { id: "b", text: "Have subagents cite whichever authoritative-sounding source they can recall, even if it was never actually retrieved during the search." },
            { id: "c", text: "Have the synthesis agent silently remove any citation that looks suspicious." },
            { id: "d", text: "Increase the number of search results returned so subagents have more sources to choose from." },
          ],
          correctOptionId: "a",
          explanation: "Fabricated citations are a hallucination risk unique to source-grounded work — the guardrail is requiring subagents to cite only sources they actually retrieved and to flag unsupported claims instead of inventing plausible ones. Citing an 'authoritative-sounding' source from memory (B) is the exact failure mode, silently stripping suspicious citations (C) hides the underlying gap instead of flagging it, and more search results (D) doesn't stop a subagent from fabricating in the first place.",
        },
        {
          id: "q-v2-s3-4",
          preamble: "Scenario: You operate a multi-agent research system where a coordinator delegates topic subtasks to specialized subagents (web search, document analysis, synthesis, report generation) and assembles their outputs into a cited report.",
          text: "The coordinator's gap-filling loop (re-delegate, then re-synthesize) works well for most reports, but for one topic a subtopic simply has no available sources, and the loop keeps re-delegating the same query without ever converging. What should bound this loop?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Nothing — let it run until the API call limit for the whole session is reached." },
            { id: "b", text: "A stopping condition, like a max pass count, after which the gap is reported instead of retried forever." },
            { id: "c", text: "Switch the stuck subtopic to a higher-temperature search to try to find something new." },
            { id: "d", text: "Have the synthesis agent invent plausible-sounding content for the missing subtopic so the refinement loop can finally end." },
          ],
          correctOptionId: "b",
          explanation: "Iterative refinement needs an explicit stopping condition — a max pass count (or a 'no sources found' outcome) — so a genuinely unavailable subtopic gets reported as a gap instead of looping forever. Relying on the whole session's call limit (A) is a blunt, late backstop, higher temperature (C) doesn't create sources that don't exist, and inventing content (D) fabricates information to force closure.",
        },
        {
          id: "q-v2-s3-5",
          preamble: "Scenario: You operate a multi-agent research system where a coordinator delegates topic subtasks to specialized subagents (web search, document analysis, synthesis, report generation) and assembles their outputs into a cited report.",
          text: "The coordinator sometimes assigns fact-gathering subtasks to the document-analysis subagent instead of the web-search subagent, because both are described only as 'research the topic.' What fixes the misassignment?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Reduce the number of subagents to one so there's nothing left to misassign." },
            { id: "b", text: "Have the coordinator flip a coin between the two subagents when uncertain." },
            { id: "c", text: "Give each subagent a distinct, specific description (e.g., 'search the live web' vs. 'analyze provided documents')." },
            { id: "d", text: "Ask the synthesis agent to detect and re-route any misassigned findings after the fact, once the report is nearly complete." },
          ],
          correctOptionId: "c",
          explanation: "Vague, near-identical subagent descriptions cause the same kind of selection ambiguity as vague tool descriptions — the fix is distinct, specific role descriptions the coordinator can use to route correctly up front. Collapsing to one subagent (A) loses specialization, randomizing the choice (B) doesn't fix ambiguity, and post-hoc re-routing (D) is a workaround rather than a fix.",
        },
      ],
    },
    {
      id: "cs-v2-scenario-4-developer-productivity",
      title: "Developer Productivity with Claude",
      topic: "Developer Productivity with Claude",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s4-1",
          preamble: "Scenario: Claude Code helps engineers explore unfamiliar codebases, trace legacy logic, generate boilerplate, and automate repetitive tasks using built-in tools (Read, Write, Bash, Grep, Glob) alongside MCP servers.",
          text: "An engineer wants to find every file that calls a specific deprecated function name across the codebase, regardless of file location. They ask Claude to use Glob with the function name as the pattern, and it returns no results. What went wrong?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Glob only searches within the current working directory by default, unless it is given an absolute path pattern to start from." },
            { id: "b", text: "The function name needs to be wrapped in wildcards for Glob to match it." },
            { id: "c", text: "Glob requires the file extension to be specified explicitly." },
            { id: "d", text: "Glob matches file paths, not contents — finding a function call needs Grep, which searches contents." },
          ],
          correctOptionId: "d",
          explanation: "Glob finds files by path/name pattern; it has no visibility into file contents, so searching for a function call needs Grep instead. The other options misdiagnose the problem as a syntax or scope issue with Glob rather than a fundamental mismatch between what Glob and Grep each search.",
        },
        {
          id: "q-v2-s4-2",
          preamble: "Scenario: Claude Code helps engineers explore unfamiliar codebases, trace legacy logic, generate boilerplate, and automate repetitive tasks using built-in tools (Read, Write, Bash, Grep, Glob) alongside MCP servers.",
          text: "Assigned to fix a bug in an unfamiliar 200-file codebase, an engineer asks Claude Code to read every file before doing anything else, which burns a large amount of context before any actual work starts. What's a more effective exploration strategy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Grep for likely entry points, then Read only the files needed to trace the logic." },
            { id: "b", text: "Read the files in alphabetical order until the bug is found." },
            { id: "c", text: "Skip exploration entirely and guess at a fix based on the bug report alone." },
            { id: "d", text: "Ask a teammate to summarize the entire codebase from memory before starting." },
          ],
          correctOptionId: "a",
          explanation: "Incremental exploration — grepping for relevant entry points or symbols, then reading only the files that trace the actual logic path — uses far less context than reading everything upfront, and still finds what's needed. Reading alphabetically (B) is essentially the same untargeted approach, guessing without exploration (C) risks a wrong fix, and relying on a teammate's memory (D) isn't reliable or necessary when the tools can search directly.",
        },
        {
          id: "q-v2-s4-3",
          preamble: "Scenario: Claude Code helps engineers explore unfamiliar codebases, trace legacy logic, generate boilerplate, and automate repetitive tasks using built-in tools (Read, Write, Bash, Grep, Glob) alongside MCP servers.",
          text: "An engineer needs to rename a single exported symbol across roughly 300 call sites that all follow an identical, mechanical pattern. Asking Claude to open and Edit each file individually would take dozens of tool calls and burn significant context. What's a better approach for this specific case?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Increase max_tokens so more individual Edit calls fit into a single turn." },
            { id: "b", text: "Have Claude write and run a single scripted command (e.g., via Bash) that applies the mechanical rename across all matching files at once." },
            { id: "c", text: "Ask Claude to memorize the pattern and apply it purely from memory without touching any files." },
            { id: "d", text: "Split the 300 call sites across ten separate Claude Code sessions, each one run one after another and each starting fresh with its own new context." },
          ],
          correctOptionId: "b",
          explanation: "For a purely mechanical, pattern-based change across hundreds of files, a single scripted command is far more efficient and reliable than dozens of individual Edit calls or splitting the work across many sessions. More max_tokens (A) doesn't reduce the number of calls needed, memorization without touching files (C) doesn't actually make the change, and ten sequential sessions (D) adds overhead without matching the efficiency of one scripted pass.",
        },
        {
          id: "q-v2-s4-4",
          preamble: "Scenario: Claude Code helps engineers explore unfamiliar codebases, trace legacy logic, generate boilerplate, and automate repetitive tasks using built-in tools (Read, Write, Bash, Grep, Glob) alongside MCP servers.",
          text: "While debugging a primary issue, an engineer notices a suspicious pattern in an unrelated module and wants Claude to investigate it thoroughly without derailing the main debugging session's context with a long tangential exploration. What's the best way to handle the tangent?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Immediately switch the same session's full attention to the tangent, pausing the original debugging task." },
            { id: "b", text: "Ignore the tangent entirely so it doesn't distract from the main task." },
            { id: "c", text: "Dispatch the tangent to a subagent via the Task tool, keeping the main session on the original issue." },
            { id: "d", text: "Run /compact to summarize the current session before looking at the tangent." },
          ],
          correctOptionId: "c",
          explanation: "Delegating a tangential, self-contained investigation to a subagent keeps the primary session's context focused on the original task while still following up on the side finding. Pausing the main session for the tangent (A) derails the original work, ignoring it (B) risks missing something important, and compacting (D) addresses context size but doesn't actually isolate the tangent from the main thread.",
        },
        {
          id: "q-v2-s4-5",
          preamble: "Scenario: Claude Code helps engineers explore unfamiliar codebases, trace legacy logic, generate boilerplate, and automate repetitive tasks using built-in tools (Read, Write, Bash, Grep, Glob) alongside MCP servers.",
          text: "A developer configures a local pre-commit Git hook that calls Claude Code to regenerate a module's documentation on every commit. This adds 10-20 seconds of latency to every single commit and occasionally produces slightly different wording between runs. What's a better automation design?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Keep it in the pre-commit hook but retry automatically whenever the generated wording is inconsistent between runs." },
            { id: "b", text: "Remove the hook and require developers to manually update docs, with no automation at all." },
            { id: "c", text: "Make the hook run twice per commit and average the two outputs." },
            { id: "d", text: "Move the documentation generation out of the blocking pre-commit path into a separate, periodic or on-demand job." },
          ],
          correctOptionId: "d",
          explanation: "A blocking Git hook is the wrong place for a non-deterministic, multi-second LLM call on every single commit — moving generation to a periodic or on-demand job removes the latency and variability from the critical path most developers hit constantly. Retrying in place (A) doesn't remove the latency, dropping automation entirely (B) overcorrects, and averaging two non-deterministic outputs (C) doesn't produce a more correct result.",
        },
      ],
    },
    {
      id: "cs-v2-scenario-5-cicd",
      title: "Claude Code for CI/CD",
      topic: "Claude Code for CI/CD",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s5-1",
          preamble: "Scenario: Your team runs Claude Code inside GitHub Actions to perform automated code review, generate test cases, and post PR feedback as part of the CI/CD pipeline.",
          text: "An automated PR-review job runs Claude Code with full default tool access. During one run, while investigating an issue, it also edits a source file directly and that edit gets included in the PR's diff — something the review job was never meant to do. What should be changed?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Restrict the review job to read-only tools (Read, Grep, Glob), disallowing Write, Edit, and Bash." },
            { id: "b", text: "Add a comment in the prompt asking Claude not to make any edits during review." },
            { id: "c", text: "Run the review job twice and discard whichever run made changes." },
            { id: "d", text: "Give the review job admin-level repository permissions so it can automatically revert its own unintended changes." },
          ],
          correctOptionId: "a",
          explanation: "Automated review jobs should be scoped to read-only tools at the permission level, so a modification simply isn't possible — a deterministic guarantee. A prompt-level request not to edit (B) is probabilistic and exactly what already failed here, running twice and hoping one is clean (C) doesn't prevent the problem, and granting admin access (D) increases risk rather than reducing it.",
        },
        {
          id: "q-v2-s5-2",
          preamble: "Scenario: Your team runs Claude Code inside GitHub Actions to perform automated code review, generate test cases, and post PR feedback as part of the CI/CD pipeline.",
          text: "A CI review step runs Claude Code and prints findings as plain text to the log, but the pipeline always exits 0 regardless of what was found, so critical issues never actually block a merge — a human has to remember to read the log. What should the pipeline do instead?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Print the findings in a larger, bolded font in the CI log so they are harder for a reviewer to miss." },
            { id: "b", text: "Have Claude Code emit severity-tagged output and fail the pipeline step when high-severity issues are found." },
            { id: "c", text: "Email the findings to the team lead after every run." },
            { id: "d", text: "Increase the log retention period so findings aren't lost over time." },
          ],
          correctOptionId: "b",
          explanation: "For findings to actually gate a merge, the pipeline step needs to fail based on structured, severity-tagged output rather than relying on a human noticing free text in a log. Formatting the log (A), emailing findings (C), and retaining logs longer (D) all still depend on a human catching the issue after the fact instead of the pipeline enforcing it.",
        },
        {
          id: "q-v2-s5-3",
          preamble: "Scenario: Your team runs Claude Code inside GitHub Actions to perform automated code review, generate test cases, and post PR feedback as part of the CI/CD pipeline.",
          text: "A new team member sets up a Claude Code review workflow in GitHub Actions by pasting the Anthropic API key directly into the workflow YAML file so the job can authenticate. A teammate flags this in review. What's the correct approach?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Leave the key in the workflow file but rotate it every time the workflow runs to limit exposure." },
            { id: "b", text: "Move the key into a comment at the top of the workflow file instead of a step." },
            { id: "c", text: "Store the key as an encrypted GitHub Actions secret, referenced via an environment variable." },
            { id: "d", text: "Leave it as-is since the repository is private." },
          ],
          correctOptionId: "c",
          explanation: "Credentials belong in the platform's encrypted secret store, referenced via environment variable — never committed in plaintext to a workflow file, even in a private repo. Rotating a key that's still committed in plaintext (A) doesn't fix the exposure, moving it to a comment (B) is still plaintext in version control, and repository privacy (D) doesn't prevent leakage through history or forks.",
        },
        {
          id: "q-v2-s5-4",
          preamble: "Scenario: Your team runs Claude Code inside GitHub Actions to perform automated code review, generate test cases, and post PR feedback as part of the CI/CD pipeline.",
          text: "A code-review CI job occasionally runs for over 20 minutes and consumes far more tokens than expected, because the agent keeps exploring tangential files without any bound. Costs and CI runtime both become unpredictable. What control addresses this directly?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Switch to a smaller, less capable model so each individual call ends up being cheaper." },
            { id: "b", text: "Reduce the number of files in the PR being reviewed." },
            { id: "c", text: "Run the job less frequently, e.g., only once per day." },
            { id: "d", text: "Set an explicit turn/token budget cap on the invocation to bound exploration." },
          ],
          correctOptionId: "d",
          explanation: "An unbounded agentic loop needs an explicit cap — a turn or token budget — enforced at the invocation level so a single run can't run away in cost or time. A smaller model (A) reduces per-call cost but not the number of unbounded calls, shrinking the PR (B) doesn't fix jobs that are already reasonably sized, and running less often (C) doesn't bound any individual run's cost.",
        },
        {
          id: "q-v2-s5-5",
          preamble: "Scenario: Your team runs Claude Code inside GitHub Actions to perform automated code review, generate test cases, and post PR feedback as part of the CI/CD pipeline.",
          text: "A CI workflow uses Claude Code to auto-generate new test cases for uncovered code paths and commits them directly to the PR branch without running them first. One generated test turns out to assert incorrect expected behavior, and it merges alongside the code it was supposed to guard. What should the workflow do differently?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Run generated tests against the code first, and commit only the ones that pass and reflect correct behavior." },
            { id: "b", text: "Generate more tests per code path so a few incorrect ones matter less." },
            { id: "c", text: "Skip test generation for any code path that's hard to test." },
            { id: "d", text: "Have Claude Code generate tests using a lower internal confidence threshold so it produces fewer false assertions overall." },
          ],
          correctOptionId: "a",
          explanation: "Generated tests are still just a proposal — they need to be executed and verified before being committed, the same way any other automated code change should be validated before merging. Generating more tests (B) dilutes but doesn't prevent the problem, skipping hard cases (C) reduces coverage instead of fixing verification, and a lower 'confidence threshold' (D) isn't a real, well-defined safeguard against an incorrect assertion slipping through.",
        },
      ],
    },
    {
      id: "cs-v2-scenario-6-structured-data-extraction",
      title: "Structured Data Extraction",
      topic: "Structured Data Extraction",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-s6-1",
          preamble: "Scenario: An extraction pipeline pulls structured fields out of unstructured documents (invoices, contracts, forms), validates the output against a JSON schema, and feeds it downstream while aiming to minimize both fabricated values and missed data.",
          text: "Currently, if any single field in an extracted document falls below a confidence threshold, the entire document is routed to a human reviewer — even when 19 of 20 fields were extracted with high confidence. This creates a large human-review backlog. What's a more efficient design?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Lower the confidence threshold so fewer documents qualify for review." },
            { id: "b", text: "Route only the low-confidence fields to review, auto-accepting the high-confidence ones." },
            { id: "c", text: "Stop using confidence scores altogether and review every document manually." },
            { id: "d", text: "Route the whole document to review only if more than half of its extracted fields fall below the confidence threshold." },
          ],
          correctOptionId: "b",
          explanation: "Per-field confidence routing sends only the uncertain fields to a human, instead of discarding the value of 19 correctly-extracted fields just because one field was uncertain — this scales human review effort to where it's actually needed. Lowering the threshold (A) just hides uncertainty, reviewing everything manually (C) doesn't scale, and a document-level majority rule (D) still wastes review effort on fields that were already high-confidence.",
        },
        {
          id: "q-v2-s6-2",
          preamble: "Scenario: An extraction pipeline pulls structured fields out of unstructured documents (invoices, contracts, forms), validates the output against a JSON schema, and feeds it downstream while aiming to minimize both fabricated values and missed data.",
          text: "A source document contains the date '03/04/2024' with nothing else indicating whether it's US (March 4) or international (April 3) format. The extraction model silently picks one interpretation and returns it as a normalized ISO date with no indication that it guessed. What should the schema/prompt design require instead?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Always default to US date format, since it's the more common convention in the training data." },
            { id: "b", text: "Round the date to the nearest month so the ambiguity matters less." },
            { id: "c", text: "Return the raw string alongside the normalized value, flagged as ambiguous when the format is unclear." },
            { id: "d", text: "Drop the date field entirely whenever the format is unclear." },
          ],
          correctOptionId: "c",
          explanation: "When a date format is genuinely ambiguous from context, silently normalizing it risks a confidently wrong value — preserving the raw string and flagging the ambiguity lets downstream consumers or a human resolve it correctly. Defaulting to one convention (A) guesses exactly as silently as before, rounding away precision (B) doesn't resolve the ambiguity, and dropping the field (D) treats ambiguous-but-present data the same as genuinely absent data.",
        },
        {
          id: "q-v2-s6-3",
          preamble: "Scenario: An extraction pipeline pulls structured fields out of unstructured documents (invoices, contracts, forms), validates the output against a JSON schema, and feeds it downstream while aiming to minimize both fabricated values and missed data.",
          text: "Downstream systems already consume the extraction pipeline's output against a fixed schema. The team wants to start capturing a new 'tax_jurisdiction' field on invoices without breaking any existing consumer that doesn't expect it. What's the right schema change?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Replace the schema entirely with a new version and require all consumers to migrate before the upcoming release." },
            { id: "b", text: "Add the field as required, so every extraction must populate it going forward." },
            { id: "c", text: "Rename an existing unused field to repurpose it for tax jurisdiction data." },
            { id: "d", text: "Add the field as optional/nullable so existing consumers are unaffected and new ones can opt in." },
          ],
          correctOptionId: "d",
          explanation: "An additive, optional field preserves backward compatibility — existing consumers that don't look for it are unaffected, while new consumers can read it once they're updated. A breaking full-schema replacement (A) forces a hard migration, making it required (B) fails whenever the source document doesn't actually contain jurisdiction info, and repurposing an existing field (C) risks silently corrupting whatever previously relied on it.",
        },
        {
          id: "q-v2-s6-4",
          preamble: "Scenario: An extraction pipeline pulls structured fields out of unstructured documents (invoices, contracts, forms), validates the output against a JSON schema, and feeds it downstream while aiming to minimize both fabricated values and missed data.",
          text: "A 150-page contract exceeds what can be reliably extracted in a single pass. The team splits it into chunks and extracts fields from each chunk independently, but the same field (e.g., 'effective date') sometimes comes back with slightly different values from different chunks that both reference it. What should the pipeline do?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Reconcile values across chunks — prefer the most complete mention, or flag a conflict when chunks genuinely disagree." },
            { id: "b", text: "Only extract from the first chunk, since most key terms appear near the beginning." },
            { id: "c", text: "Concatenate all chunk outputs into one long string without deduplication." },
            { id: "d", text: "Increase the chunk size repeatedly until the entire 150-page contract fits within a single extraction call every time." },
          ],
          correctOptionId: "a",
          explanation: "Splitting a long document into chunks means the same field can legitimately be mentioned in more than one chunk, so the pipeline needs an explicit reconciliation step — preferring the most complete mention or flagging real disagreement — rather than just taking whatever the last chunk returned. Reading only the first chunk (B) risks missing later authoritative mentions, unreconciled concatenation (C) leaves the conflict unresolved, and growing the chunk size indefinitely (D) reintroduces the original context-limit problem the chunking was meant to solve.",
        },
        {
          id: "q-v2-s6-5",
          preamble: "Scenario: An extraction pipeline pulls structured fields out of unstructured documents (invoices, contracts, forms), validates the output against a JSON schema, and feeds it downstream while aiming to minimize both fabricated values and missed data.",
          text: "An extraction pipeline passed its initial accuracy evaluation and has been running in production for six months. The source documents' format has since changed slightly (a vendor updated their invoice template), and accuracy has quietly degraded, but nobody has re-run a full evaluation. What practice would have caught this sooner?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Re-run the full manual evaluation once a year regardless of any other signal." },
            { id: "b", text: "Track per-field validation-failure and null rates in production as an early signal of source-format drift." },
            { id: "c", text: "Increase the extraction model's temperature periodically to keep results fresh." },
            { id: "d", text: "Only re-evaluate accuracy when a downstream consumer files a complaint." },
          ],
          correctOptionId: "b",
          explanation: "Per-field validation-failure and null rates are a cheap, continuous signal that something changed in the source data, catching drift long before a scheduled annual review or a downstream complaint would surface it. An annual check (A) is too infrequent to catch a mid-year template change quickly, temperature (C) doesn't relate to detecting drift at all, and waiting for a complaint (D) means damage has already occurred by the time it's noticed.",
        },
      ],
    },
  ];

  for (const cs of scenarioChallengeSetsV2) {
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

  // Additional domain-based challenge sets (v2 question set expansion)
  const domainChallengeSetsV2 = [
    {
      id: "cs-v2-domain-1-agentic-orchestration",
      title: "Agentic Architecture and Orchestration",
      topic: "Agentic Architecture and Orchestration",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-d1-1",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "You're registering a new subagent type for a documentation-writing pipeline so other engineers can reuse it without re-explaining its role each time. Beyond a name, what does the subagent's AgentDefinition need to specify for it to be a properly scoped, reusable type?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A description, a system prompt defining its role, and the tool restrictions that apply to that subagent type." },
            { id: "b", text: "Only a system prompt — the coordinator's own tool list and description automatically carry over to every subagent type." },
            { id: "c", text: "A one-off prompt passed inline at invocation time, with no persistent configuration stored anywhere." },
            { id: "d", text: "A transcript of past conversations for the subagent to imitate, with unrestricted tool access by default." },
          ],
          correctOptionId: "a",
          explanation: "An AgentDefinition packages the description, system prompt, and tool restrictions for a subagent type so it can be reused consistently. Assuming automatic inheritance from the coordinator (B) is wrong — subagents don't inherit configuration or context automatically. Inline-only prompting (C) isn't reusable, and unrestricted tool access (D) skips the scoping an AgentDefinition is meant to enforce.",
        },
        {
          id: "q-v2-d1-2",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "A coordinator's prompt to a synthesis subagent spells out, step by step, exactly which paragraph order to use and which transition phrases to write. When the input findings vary in structure from run to run, the subagent produces awkward, rigid output because it can't adapt. What's the better way to prompt it?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add more explicit steps to the procedure so the subagent has no ambiguity left to resolve on its own." },
            { id: "b", text: "Hard-code a single template with fixed placeholders that every set of findings must be reshaped to fit." },
            { id: "c", text: "Describe the goal and quality criteria for the synthesis — coherence, coverage, appropriate structure — and let the subagent adapt its approach to the findings it receives." },
            { id: "d", text: "Remove the coordinator's prompt entirely and let the subagent decide its own goal for each run." },
          ],
          correctOptionId: "c",
          explanation: "Coordinator prompts work best when they specify goals and quality criteria rather than rigid step-by-step procedures, preserving the subagent's ability to adapt its approach to varying input. Adding more steps (A) or a fixed template (B) makes the rigidity worse, and removing all direction (D) abandons the coordinator's role of setting the objective.",
        },
        {
          id: "q-v2-d1-3",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "A developer resumes a named Claude Code session the next morning to continue a refactor, after another teammate merged unrelated changes to several of the same files overnight. The developer just runs --resume and asks Claude to continue where it left off. What's missing from this resumption?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Nothing — resumed sessions automatically detect and reconcile any files that changed since the session was last active." },
            { id: "b", text: "The developer should have used fork_session instead, since fork_session is required whenever any file in the repo has changed, not just the specific files touched by this refactor." },
            { id: "c", text: "The developer should discard the session and re-explore the entire codebase from scratch before continuing." },
            { id: "d", text: "The developer needs to explicitly tell the agent which files changed overnight — resuming doesn't make the agent aware of edits made outside the session." },
          ],
          correctOptionId: "d",
          explanation: "Resuming a session doesn't give the agent automatic awareness of changes made outside it — when resuming after code changes, you must explicitly tell the agent what files changed. Assuming automatic detection (A) is false, fork_session (B) is for branching from a shared baseline, not for reconciling external edits, and a full re-exploration (C) is a bigger reset than the situation calls for.",
        },
        {
          id: "q-v2-d1-4",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "A Claude Code session has run for hours and accumulated dozens of now-irrelevant tool call results from earlier dead-end investigations. The developer wants to continue the work with a clean, reliable context rather than dragging all that stale output forward. What's the recommended approach?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Keep resuming the same session indefinitely, since more accumulated history improves the agent's reliability." },
            { id: "b", text: "Start a new session and give it a structured summary of what's been learned so far, instead of resuming a session full of stale tool results." },
            { id: "c", text: "Resume the session and ask the agent to mentally ignore everything before the last 10 messages." },
            { id: "d", text: "Switch to a larger context window model so the stale results stop mattering." },
          ],
          correctOptionId: "b",
          explanation: "A new session seeded with a structured summary of key findings is more reliable than resuming a session cluttered with stale tool results, since it carries forward only what matters. Endless resumption (A) compounds the clutter, asking the agent to 'ignore' history (C) is unreliable prompt-based suppression, and a bigger context window (D) doesn't fix attention quality on irrelevant content.",
        },
        {
          id: "q-v2-d1-5",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "For a triage agent that routes incoming tickets to one of a dozen possible categories, the team is deciding between hard-coding a fixed decision tree of if/else rules versus letting the model decide the next action based on ticket content within the agentic loop. Ticket phrasing is highly varied and new categories get added periodically. Which approach fits better here?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The fixed decision tree, because it removes all ambiguity about which category applies." },
            { id: "b", text: "Neither — triage should be handled entirely outside the agentic loop, by a separate non-LLM keyword matcher that gets manually retrained every time a new category is added." },
            { id: "c", text: "Model-driven decisions within the loop, since varied phrasing and evolving categories are exactly the kind of judgment calls a rigid decision tree handles poorly." },
            { id: "d", text: "A decision tree that gets manually rewritten by an engineer every time ticket phrasing shifts." },
          ],
          correctOptionId: "c",
          explanation: "Model-driven decisions suit cases with varied inputs and evolving categories, where a rigid pre-configured decision tree would need constant rewriting and still misses unanticipated phrasing. A fixed tree (A) can't flex to new phrasing, a keyword matcher (B) reintroduces the same rigidity outside the loop, and constant manual rewrites (D) don't scale.",
        },
        {
          id: "q-v2-d1-6",
          preamble: "Scenario: You are the architect for an agentic system that decides its own next actions across single-agent loops and coordinator/subagent pipelines, built on the Claude Agent SDK.",
          text: "A single customer message raises three distinct issues: a billing dispute, a shipping delay, and a request to update their email preference. The agent decomposes this into three separate items but then investigates them one at a time in sequence, each investigation forgetting what the other two turned up, and takes noticeably longer than it should. What would fix the inefficiency without losing per-issue clarity?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Merge the three issues back into one investigation so nothing is lost between them." },
            { id: "b", text: "Drop the two lower-priority issues and only resolve the billing dispute this turn." },
            { id: "c", text: "Investigate all three sequentially exactly as before, but summarize each investigation's findings more aggressively before moving on to save time." },
            { id: "d", text: "Investigate the three decomposed items in parallel, sharing relevant context across them, then synthesize a single unified response." },
          ],
          correctOptionId: "d",
          explanation: "Multi-concern requests should be decomposed into distinct items, investigated in parallel with shared context, and synthesized into one unified response — sequential, context-forgetting investigation is what created the slowdown. Merging back into one (A) loses the clarity decomposition provided, dropping issues (B) fails to resolve the request, and just summarizing harder (C) doesn't address the sequential bottleneck.",
        },
      ],
    },
    {
      id: "cs-v2-domain-2-tool-mcp-design",
      title: "Tool Design and MCP Integration",
      topic: "Tool Design and MCP Integration",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-d2-1",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "A support agent has both send_refund and send_notification tools. After adding a system-prompt line that says 'always send a message to the customer confirming any action taken,' the agent starts calling send_notification even for read-only lookups that took no action, seemingly triggered by the word 'send' appearing near tool names in its instructions. What's the most likely explanation, and the fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The tools are fundamentally incompatible with one another in this configuration, and one of the two conflicting tools should be permanently removed from the agent's available tool list entirely." },
            { id: "b", text: "The system prompt's wording created an unintended keyword association between 'send' and the send_* tools; the fix is to audit and reword the prompt to avoid accidental associations." },
            { id: "c", text: "The model is malfunctioning and a different model version should be tried instead." },
            { id: "d", text: "tool_choice should be set to 'none' so the agent can no longer call any tools." },
          ],
          correctOptionId: "b",
          explanation: "System prompt wording can create unintended keyword-based associations that bias tool selection — here, 'send' priming send_notification even when no action occurred. The fix is to audit and reword the prompt, not to remove a needed tool (A), blame the model itself (C), or disable tool use altogether (D).",
        },
        {
          id: "q-v2-d2-2",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "Your agent has three MCP servers configured — one for Jira, one for GitHub, one for internal docs. A developer asks whether the agent can only use one MCP server's tools per conversation turn, requiring the servers to be swapped in and out depending on the task. What's actually true about how MCP server tools become available to the agent?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Only one MCP server can ever be active at a time, so the developer must manually swap configuration between different tasks throughout the day." },
            { id: "b", text: "MCP servers must be manually enabled per turn via a flag before their tools appear." },
            { id: "c", text: "The agent must call a special activate_server tool before any other server's tools become visible." },
            { id: "d", text: "All configured MCP servers' tools are discovered at connection and available simultaneously — no swapping needed." },
          ],
          correctOptionId: "d",
          explanation: "Once MCP servers are configured, their tools are all discovered at connection time and available together in the same conversation — there's no need to swap servers in and out or manually activate them per task. Options A, B, and C all describe activation mechanisms that don't exist in how MCP tool discovery works.",
        },
        {
          id: "q-v2-d2-3",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "A function get_user_profile is wrapped and re-exported under different names in three different modules (fetchProfile, loadUser, getUserData) before its actual call sites are reached. An engineer wants Claude to find every place this function's behavior is actually invoked, not just literal calls to get_user_profile. What's the right search strategy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "First find all the exported wrapper names for the function, then Grep the codebase for each of those names individually." },
            { id: "b", text: "Grep only for the literal string get_user_profile, since re-exports preserve the original name in a code comment placed directly above every wrapper definition." },
            { id: "c", text: "Use Glob to search file contents for any file that imports from the module defining get_user_profile." },
            { id: "d", text: "Ask Claude to guess likely call sites based on the function's name alone, without running any searches." },
          ],
          correctOptionId: "a",
          explanation: "Tracing a wrapped function requires first identifying all its exported names across wrapper modules, then Grep-ing each one codebase-wide — a single Grep on the original name misses every call site that only sees a wrapper's name. Grepping only the original name (B) misses the wrappers, Glob (C) matches file paths rather than contents, and guessing without searching (D) risks missing real call sites.",
        },
        {
          id: "q-v2-d2-4",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "An MCP inventory-lookup tool returns zero items for a given SKU. The agent needs to know whether this means the SKU genuinely has no matching inventory record, or whether the lookup itself failed to reach the inventory service. Right now both cases come back as the same empty array, and the agent can't tell them apart. What should the tool's response distinguish?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Nothing needs to change — an empty array is unambiguous and means no inventory exists for that SKU." },
            { id: "b", text: "The tool should retry automatically a fixed number of times and only ever return a populated array or an exception." },
            { id: "c", text: "The response should separate a valid empty result (genuinely no matches) from an access failure needing a retry decision." },
            { id: "d", text: "The tool should log the failure server-side only, since the agent doesn't need failure detail to keep functioning." },
          ],
          correctOptionId: "c",
          explanation: "Valid empty results (a successful query that legitimately found nothing) and access failures (a broken or timed-out connection) look identical if both collapse to an empty array — the response needs to distinguish them so the agent can decide whether a retry makes sense. Treating empty as always valid (A) hides real failures, forced retries with no visibility (B) doesn't inform the agent, and server-only logging (D) leaves the agent blind.",
        },
        {
          id: "q-v2-d2-5",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "A subagent's MCP search tool times out on the first attempt. The subagent's current design immediately reports the timeout up to the coordinator without trying anything else itself. The team wants fewer unnecessary escalations for errors the subagent could plausibly resolve on its own. What should change?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Nothing needs to change — every tool failure, transient or not, should be reported straight to the coordinator the instant it occurs, with no attempt at any local recovery whatsoever." },
            { id: "b", text: "The subagent should attempt one bounded local retry for the transient error first, escalating only if it remains unresolved, with what was tried and any partial results." },
            { id: "c", text: "The subagent should silently swallow the timeout and return whatever partial data it has, marked as a successful complete result." },
            { id: "d", text: "The coordinator should poll every subagent continuously so it detects timeouts before the subagent even reports them." },
          ],
          correctOptionId: "b",
          explanation: "Transient errors are good candidates for local recovery within the subagent itself; only unresolved errors should propagate up, along with what was attempted and any partial results, so the coordinator isn't overwhelmed with noise it can't act on differently. Escalating everything immediately (A) creates noise, silently marking a partial result as fully successful (C) hides the failure, and constant coordinator polling (D) doesn't address where recovery should actually happen.",
        },
        {
          id: "q-v2-d2-6",
          preamble: "Scenario: You are designing and maintaining the tool and MCP-server surface for a fleet of Claude agents, including both custom tools and third-party integrations.",
          text: "A compliance-tagging step must always run the tag_compliance_category tool, never a different tool and never plain text, regardless of how many other tools are available to the agent at that point. Which tool_choice configuration guarantees this specific outcome?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "tool_choice: \"auto\", which allows the model to decide whether to call a tool or respond with text." },
            { id: "b", text: "tool_choice: \"any\", which forces some tool call but lets the model pick freely among all available tools." },
            { id: "c", text: "Omitting tool_choice entirely and relying on the system prompt to insist on tag_compliance_category." },
            { id: "d", text: "Forcing tool_choice to name tag_compliance_category specifically, which guarantees exactly that tool gets called." },
          ],
          correctOptionId: "d",
          explanation: "Only a forced tool_choice that names the specific tool guarantees that exact tool gets called; \"auto\" (A) permits plain text, \"any\" (B) forces a tool call but lets the model choose which one, and relying on prompt wording alone (C) is probabilistic, not guaranteed.",
        },
      ],
    },
    {
      id: "cs-v2-domain-3-claude-code-config",
      title: "Claude Code Configuration and Workflows",
      topic: "Claude Code Configuration and Workflows",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-d3-1",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "A developer wants to tweak a shared team skill's behavior (a different commit-message format) for their own use, without changing what the rest of the team gets when they invoke the same skill name. What's the right way to do this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Edit the shared skill file directly in .claude/skills/, since personal tweaks are expected to apply to everyone." },
            { id: "b", text: "Ask every teammate to manually override the skill's behavior in their own prompts each time they invoke it." },
            { id: "c", text: "Create a personal variant under a new name in ~/.claude/skills/, leaving the shared team skill untouched." },
            { id: "d", text: "Delete the shared skill and replace it with a slash command that only the developer can access." },
          ],
          correctOptionId: "c",
          explanation: "A personal variant of a shared skill should get a new name in ~/.claude/skills/ so it doesn't affect teammates who invoke the original shared skill. Editing the shared file (A) changes it for everyone, per-invocation manual overrides (B) don't scale, and deleting the shared skill (D) removes it for the whole team.",
        },
        {
          id: "q-v2-d3-2",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "While debugging, a developer wants Claude to survey a large, unfamiliar directory structure to understand how a feature is wired together, without filling the main conversation with dozens of intermediate Read and Grep results. What's the recommended way to do this survey?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Dispatch the survey to the Explore subagent, which isolates the verbose discovery output and returns a summary to the main conversation." },
            { id: "b", text: "Have the main session Read every file in the directory sequentially and then manually delete the irrelevant results from the conversation transcript afterward." },
            { id: "c", text: "Ask Claude to describe the directory structure from its training data instead of actually inspecting the files." },
            { id: "d", text: "Run /clear before starting the survey so there's more room for the discovery output." },
          ],
          correctOptionId: "a",
          explanation: "The Explore subagent isolates verbose discovery output and returns a condensed summary, preserving the main conversation's context — exactly suited to broad, exploratory surveys. Reading everything in the main session (B) is the problem being described, guessing from training data (C) risks inaccuracy on an unfamiliar codebase, and clearing context upfront (D) doesn't stop the survey itself from being verbose.",
        },
        {
          id: "q-v2-d3-3",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "A developer asks Claude Code to implement a tricky parsing function purely from a prose description. The first attempt handles the common case but silently mishandles several edge cases the developer didn't think to describe up front. What iteration strategy would have caught this earlier?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Ask Claude to write the parsing function twice and pick whichever version looks more concise." },
            { id: "b", text: "Provide an even longer prose description covering every edge case the developer can think of in advance." },
            { id: "c", text: "Lower the temperature so the implementation is more literal and less likely to miss cases." },
            { id: "d", text: "Write tests, including edge cases, first, then iterate by sharing the specific test failures instead of only prose requirements." },
          ],
          correctOptionId: "d",
          explanation: "Test-driven iteration — writing tests first and then iterating by sharing concrete failures — surfaces edge cases that prose descriptions alone tend to miss, since failures are specific and unambiguous. A coin-flip between two attempts (A) doesn't address correctness, an ever-longer prose description (B) still relies on the developer anticipating every case up front, and temperature (C) doesn't affect edge-case coverage.",
        },
        {
          id: "q-v2-d3-4",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "A code review surfaces two findings on the same function that interact with each other (fixing one changes the correct fix for the other), plus a third, completely unrelated typo in a different file. How should these be batched into requests to Claude Code?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Send all three findings in three separate messages, one per finding, regardless of whether they interact." },
            { id: "b", text: "Batch the two interacting findings into one message so they're fixed together; handle the unrelated typo separately." },
            { id: "c", text: "Combine all three findings into a single message, since more context in one request is better." },
            { id: "d", text: "Fix the unrelated typo first, then wait for that to be reviewed before mentioning the two interacting findings at all." },
          ],
          correctOptionId: "b",
          explanation: "Interacting issues should be batched into one detailed message so the fix accounts for both at once, while independent issues (like an unrelated typo) are better handled as separate, sequential fixes. Splitting the interacting pair into separate messages (A) risks a fix for one contradicting the other, lumping everything together including the unrelated typo (C) mixes unrelated context, and needlessly sequencing the unrelated typo first (D) adds delay without benefit.",
        },
        {
          id: "q-v2-d3-5",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "A CI job asks Claude Code to generate additional test coverage for a module. Without being shown what tests already exist, it repeatedly generates near-duplicate tests for scenarios the existing suite already covers, while missing genuinely untested paths. What should the job provide to avoid this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A larger token budget so Claude can generate more tests overall, diluting the duplicate ratio." },
            { id: "b", text: "Instructions to write 'only new tests,' without showing what the existing suite actually covers." },
            { id: "c", text: "The existing test files as context, so generation can target genuinely uncovered paths instead of re-covering what's already tested." },
            { id: "d", text: "A random sample of the codebase's other unrelated modules, provided purely for general style reference rather than actual coverage information." },
          ],
          correctOptionId: "c",
          explanation: "Providing the existing test files as context lets generation identify what's already covered and target genuinely untested paths, rather than guessing blind and duplicating existing scenarios. More tokens (A) doesn't fix the blind spot, a prose instruction without showing the existing suite (B) is exactly the situation that failed here, and unrelated modules (D) don't inform test coverage for this module.",
        },
        {
          id: "q-v2-d3-6",
          preamble: "Scenario: You administer Claude Code configuration and workflows for an engineering team that relies on it daily across a shared, multi-package repository.",
          text: "A CI workflow implements PR review by resuming the exact same Claude Code session ID that was used earlier in the pipeline to auto-generate the PR's code changes, on the theory that it saves setup time. What's the problem with this wiring, specific to CI review pipelines?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The review inherits the same reasoning context that generated the code, missing the blind spots an independent instance would catch." },
            { id: "b", text: "Resuming a session ID in CI fails outright, since --resume is not supported outside interactive terminals." },
            { id: "c", text: "The review will run twice as slowly, since resumed sessions replay their entire tool-call history before responding." },
            { id: "d", text: "Nothing is wrong with this wiring; reusing the session is simply a performance optimization with no downside." },
          ],
          correctOptionId: "a",
          explanation: "Reviewing with the same session that generated the code means the review inherits the generation's reasoning context and is less likely to catch its own mistakes — an independent review instance without that baggage is more reliable. Resuming sessions in CI is technically possible (B is false), there's no inherent doubling of runtime from resumption (C), and this isn't a harmless optimization (D) — it's the specific wiring mistake being asked about.",
        },
      ],
    },
    {
      id: "cs-v2-domain-4-prompt-structured-output",
      title: "Prompt Engineering and Structured Output",
      topic: "Prompt Engineering and Structured Output",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-d4-1",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "An extraction pipeline pulls phone numbers from scanned forms where the source formatting varies wildly — some written as (555) 123-4567, others as 555.123.4567, others as plain digit strings with no separators. Downstream systems require a single consistent format. What should the extraction prompt include to produce that consistency?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A note asking the model to 'format phone numbers nicely,' trusting it to pick a sensible convention on its own." },
            { id: "b", text: "Nothing in the prompt at all — normalization should happen later on in a completely separate downstream service after extraction, not as part of the extraction step itself, under this design." },
            { id: "c", text: "An enum field listing every phone format the model might encounter as a fixed set of choices." },
            { id: "d", text: "Explicit format-normalization rules in the prompt (e.g., strip separators, output as a fixed digit pattern) so inconsistent source formatting converges on one output format." },
          ],
          correctOptionId: "d",
          explanation: "Including explicit format-normalization rules in the prompt lets inconsistent source formatting converge on a single, predictable output format at extraction time. A vague instruction to format 'nicely' (A) doesn't specify the target format, deferring normalization entirely downstream (B) is a valid architecture but doesn't answer what the prompt itself should do, and an enum of formats (C) doesn't apply to a free-form value like a phone number.",
        },
        {
          id: "q-v2-d4-2",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "A code-review category has a persistently high false-positive rate, and the team wants to understand systematically why developers dismiss so many of its findings, rather than just guessing. What should each finding record to support that analysis?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Only a plain binary flag recording whether the developer dismissed the finding that specific time, with absolutely no further contextual detail recorded anywhere alongside it." },
            { id: "b", text: "A detected_pattern field capturing what specific pattern triggered the finding, so dismissals can be analyzed systematically against the pattern that caused them." },
            { id: "c", text: "The reviewer's confidence score at generation time, with no link back to what pattern was matched." },
            { id: "d", text: "A timestamp of when the finding was generated, so stale findings can be filtered out over time." },
          ],
          correctOptionId: "b",
          explanation: "Tracking a detected_pattern field on each finding lets the team analyze dismissals against the specific pattern that triggered them, revealing which patterns are systematically over-firing. A bare dismissal flag (A) has no diagnostic detail, a confidence score alone (C) doesn't identify the pattern, and a timestamp (D) addresses staleness, not false-positive causes.",
        },
        {
          id: "q-v2-d4-3",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "An invoice extraction pipeline sometimes finds the header section and a line-item table disagreeing about the vendor's tax ID. The team wants this kind of internal inconsistency to be visible downstream instead of silently picking one value. What schema addition addresses this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Remove the tax ID field from the schema entirely, since it's prone to disagreement between sections." },
            { id: "b", text: "Have the model trust the header section value and discard whatever the line-item table says." },
            { id: "c", text: "Add a conflict_detected boolean alongside the extracted values, flagged whenever the header and line-item sections disagree." },
            { id: "d", text: "Round or truncate the tax ID so minor formatting differences between sections stop registering as conflicts." },
          ],
          correctOptionId: "c",
          explanation: "A conflict_detected boolean, set whenever internally inconsistent source data disagrees (like the header vs. line-item tax ID), makes the inconsistency visible downstream rather than silently resolved. Removing the field (A) loses the data, always trusting one section (B) silently picks a value without flagging the disagreement, and truncating for false agreement (D) masks a real inconsistency rather than surfacing it.",
        },
        {
          id: "q-v2-d4-4",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "A verification pass re-checks a large batch of extracted findings before they reach a human reviewer. The team wants to route the reviewer's limited time toward the findings most likely to be wrong, without re-litigating every single one from scratch. What's an appropriate use of the model here?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the verification pass self-report a confidence score per finding, and route human review effort toward the lower-confidence findings first." },
            { id: "b", text: "Have the verification pass self-report a single overall confidence score for the entire batch, and skip human review entirely whenever that batch-level score comes back high." },
            { id: "c", text: "Skip verification entirely and route every finding to human review in the original order they were generated." },
            { id: "d", text: "Use sentiment analysis on the finding's wording to guess which ones the reviewer will find frustrating to check." },
          ],
          correctOptionId: "a",
          explanation: "In a verification pass, self-reported confidence per finding is a reasonable way to route limited human review effort toward the findings most likely to need it — distinct from using self-reported confidence as an autonomous escalation trigger, which is unreliable. A single batch-level score (B) loses per-finding granularity, skipping verification (C) doesn't prioritize review time, and sentiment analysis (D) doesn't correlate with extraction correctness.",
        },
        {
          id: "q-v2-d4-5",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "Two runs of the same review prompt label a similar off-by-one bug as 'critical' in one PR and 'minor' in another, with no clear pattern to the inconsistency. The prompt currently just says to assign a severity of low, medium, or high. What would make severity classification more consistent?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Remove severity labels entirely and let every finding be treated with equal urgency." },
            { id: "b", text: "Add a fourth severity level so there's a finer-grained scale to choose from." },
            { id: "c", text: "Randomize which findings get flagged so reviewers don't over-rely on the severity label." },
            { id: "d", text: "Define explicit criteria per severity level with concrete code examples, instead of leaving classification to case-by-case judgment." },
          ],
          correctOptionId: "d",
          explanation: "Explicit severity-level definitions paired with concrete code examples per level give the model consistent boundaries to classify against, instead of an ad hoc judgment call each time. Removing severity (A) loses useful triage information, adding more levels without defining them (B) doesn't fix the ambiguity, and randomizing findings (C) doesn't address the labeling inconsistency at all.",
        },
        {
          id: "q-v2-d4-6",
          preamble: "Scenario: You design prompts and structured-output pipelines for Claude-based review and extraction systems that must produce consistent, schema-valid results.",
          text: "A team wants to move a workflow to the Message Batches API where each request in the batch needs to call a tool, inspect the result, and then call a second tool based on that result — a multi-turn tool-calling exchange within a single logical task. Is this workflow a good fit for a single batched request?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Yes, as long as tool_choice is set to \"any\" for every request in the batch." },
            { id: "b", text: "No — batch requests don't support multi-turn tool calling within a single entry." },
            { id: "c", text: "Yes, since the Batches API's 24-hour window gives each request enough time to complete multiple turns." },
            { id: "d", text: "No — batch requests can only use MCP tools, not custom-defined ones, so tool exchanges must happen outside the batch." },
          ],
          correctOptionId: "b",
          explanation: "A single Message Batches API request doesn't support multi-turn tool calling — there's no back-and-forth within one batched entry, so a workflow that needs to call a tool, inspect the result, and call a follow-up tool within the same task isn't a fit for a single batch request as designed. tool_choice (A) doesn't grant multi-turn capability, the 24-hour window (C) is about overall processing time, not in-request turns, and the MCP-vs-custom-tool distinction (D) isn't the actual limitation.",
        },
      ],
    },
    {
      id: "cs-v2-domain-5-context-reliability",
      title: "Context Management and Reliability",
      topic: "Context Management and Reliability",
      xpReward: 80,
      questions: [
        {
          id: "q-v2-d5-1",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "An upstream research subagent returns its findings as several paragraphs of flowing prose with embedded reasoning about why each source seemed reliable. The downstream synthesis agent, which is already working with a large aggregated input near its context budget, has to re-parse all that prose just to extract the handful of facts and citations it actually needs. What would ease the downstream agent's burden?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the upstream agent return structured facts, citations, and relevance scores instead of verbose prose and reasoning, when the downstream agent has a tight context budget." },
            { id: "b", text: "Have the downstream agent request the upstream agent's findings twice, once for facts and once for citations." },
            { id: "c", text: "Increase the downstream agent's context window so the extra prose stops being a problem." },
            { id: "d", text: "Remove only the embedded reasoning from the upstream agent's output, but keep the exact same flowing-prose paragraph format for presenting the facts themselves to the downstream agent." },
          ],
          correctOptionId: "a",
          explanation: "When the downstream agent has a tight context budget, structured facts, citations, and relevance scores are more efficient for it to consume than verbose prose carrying embedded reasoning — the reasoning was useful for the upstream agent's own process, not for what the downstream agent needs. Requesting findings twice (B) doubles the round trips, a bigger context window (C) doesn't reduce the parsing burden, and only trimming reasoning while keeping prose format (D) still leaves an unstructured format to parse.",
        },
        {
          id: "q-v2-d5-2",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "A customer's tone is clearly annoyed, but their actual request — checking on a delayed order — is straightforward and something the agent can resolve on its own without any policy exception. The customer hasn't asked to speak to a human. What's the appropriate response?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Escalate immediately to a human agent, since visible frustration on an otherwise straightforward case is itself sufficient reason to hand off the conversation." },
            { id: "b", text: "Ignore the tone entirely and respond exactly as if the customer sounded neutral." },
            { id: "c", text: "Acknowledge the frustration, resolve the straightforward request, and escalate only if the customer reiterates wanting a human." },
            { id: "d", text: "Ask the customer to calm down before continuing with the order lookup." },
          ],
          correctOptionId: "c",
          explanation: "For a straightforward issue, the right response is to acknowledge the customer's frustration while still proceeding to resolve it — reserving escalation for cases where the customer reiterates that they want a human, not for tone alone. Escalating purely on detected frustration (A) uses an unreliable signal (sentiment doesn't correlate with actual complexity), ignoring the tone (B) misses an easy acknowledgment, and asking the customer to calm down (D) is dismissive and doesn't move the request forward.",
        },
        {
          id: "q-v2-d5-3",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "A subagent's structured output includes the extracted facts and citations but leaves out when each source was published and what methodology (survey vs. estimate vs. official statistic) produced a given figure. Downstream, the synthesis agent has no way to explain why two numbers differ or how much weight each deserves. What should the subagent's output include?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Nothing extra — citations alone are sufficient for downstream synthesis to weigh and explain figures correctly." },
            { id: "b", text: "Metadata such as publication/collection dates, source, and methodology alongside each fact, so downstream synthesis can accurately weigh and explain discrepancies." },
            { id: "c", text: "A single aggregate reliability score covering the subagent's entire batch of output, replacing any need for individual per-fact source detail recorded alongside each figure." },
            { id: "d", text: "The subagent's own confidence level in each fact, with no further source detail attached." },
          ],
          correctOptionId: "b",
          explanation: "Requiring subagents to include metadata — dates, source, methodology — in their structured output for each fact gives downstream synthesis what it needs to accurately weigh figures and explain discrepancies, rather than treating differing numbers as unexplained noise. Citations alone (A) omit the context needed to judge conflicting figures, one aggregate score (C) loses per-fact nuance, and a bare confidence level (D) doesn't identify why sources differ.",
        },
        {
          id: "q-v2-d5-4",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "A synthesis report cites two sources giving different unemployment figures for the same country. On closer inspection, one source is from two years ago and the other is current — the numbers differ because the economy changed, not because the sources disagree. Without dates in the structured output, the synthesis agent had flagged this as a contradiction. What would have prevented the false flag?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A rule telling the synthesis agent to trust whichever source has the higher figure." },
            { id: "b", text: "A rule telling the synthesis agent to trust whichever source is cited more often elsewhere." },
            { id: "c", text: "Merging the two figures into a single averaged number so no contradiction needs to be flagged." },
            { id: "d", text: "Requiring publication or collection dates in the output, so a real temporal change isn't misread as a contradiction." },
          ],
          correctOptionId: "d",
          explanation: "Requiring publication or collection dates in structured outputs lets synthesis distinguish a genuine temporal change from an actual disagreement between sources describing the same point in time. Trusting the higher figure (A) or the more-cited source (B) are arbitrary tie-breakers unrelated to the real cause, and averaging away the difference (C) discards the real information that the economy changed.",
        },
        {
          id: "q-v2-d5-5",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "A synthesis report forces every kind of content into the same paragraph-of-prose format — a table of quarterly financial figures gets rewritten as a paragraph describing each number in a sentence, making the actual figures hard to scan and compare. What would improve the report's structure?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Rendering content in its natural form — tables, prose, or lists as fits the content — instead of one uniform format." },
            { id: "b", text: "Convert everything in the report, including narrative prose findings and technical lists, into one single large table for the sake of visual consistency across sections." },
            { id: "c", text: "Shorten every section to a single sentence regardless of content type, to keep the report uniform." },
            { id: "d", text: "Remove the financial figures from the report since they don't fit the prose format well." },
          ],
          correctOptionId: "a",
          explanation: "Rendering content in its natural form — tables for financial data, prose for narrative findings, lists for technical items — preserves scannability instead of forcing every content type into one uniform shape. Converting everything to a table (B) misfits narrative content just as badly, uniform single-sentence shortening (C) loses detail regardless of type, and dropping the figures (D) removes information instead of formatting it appropriately.",
        },
        {
          id: "q-v2-d5-6",
          preamble: "Scenario: You are responsible for context management and reliability across long-running Claude sessions and multi-agent synthesis pipelines that feed a human-facing report or conversation.",
          text: "An extraction system routes only low-confidence outputs to human review, on the assumption that high-confidence outputs are essentially always correct. Over time, a systematic error specific to a rare document layout goes undetected because it always scored high confidence. What sampling practice would have caught this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Increase the confidence threshold so more outputs get routed to review." },
            { id: "b", text: "Review only outputs where the model itself flags uncertainty in its reasoning text." },
            { id: "c", text: "Stratified random sampling of high-confidence extractions, to catch novel error patterns invisible to low-confidence-only routing." },
            { id: "d", text: "Stop using confidence scores altogether and route every single extraction output, high or low, straight to human review from now on." },
          ],
          correctOptionId: "c",
          explanation: "Stratified random sampling of high-confidence extractions catches novel, systematic error patterns that a confidence-only routing strategy misses entirely, since a consistently miscalibrated case can still score high confidence every time. Raising the threshold (A) still relies on the same miscalibrated scores, checking only self-flagged uncertainty in reasoning text (B) doesn't surface confidently-wrong cases, and reviewing everything (D) doesn't scale and abandons the routing signal instead of supplementing it.",
        },
      ],
    },
  ];

  for (const cs of domainChallengeSetsV2) {
    const { questions, ...csData } = cs;

    const challengeSet = await prisma.challengeSet.upsert({
      where: { id: csData.id },
      update: {},
      create: { ...csData, examId: exam.id },
    });

    console.log(`  Created domain challenge set: ${challengeSet.title}`);

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

    console.log(`    Seeded ${questions.length} domain questions`);
  }

  const extendedChallengeSetsV2 = [
    {
      id: "cs-ext-multiagent-research-import",
      title: "Multi-Agent Research & Reliability — Extended Set",
      topic: "Multi-Agent Research & Reliability — Extended Set",
      xpReward: 80,
      questions: [
        {
          id: "q-ext-mar-1",
          text: "After the web search agent and document analysis agent complete their tasks, the coordinator invokes the synthesis agent. However, the synthesis agent responds that it cannot complete the task because no research findings were provided. What is the most likely cause of this issue?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The coordinator did not include the outputs from the previous agents in the synthesis agent's prompt." },
            { id: "b", text: "The synthesis agent needs tools that can fetch results directly from the other agents' conversation histories." },
            { id: "c", text: "The synthesis agent's context window is not large enough to hold the combined outputs from both previous agents." },
            { id: "d", text: "The subagents need to share a single API connection to enable automatic context sharing between invocations." },
          ],
          correctOptionId: "a",
          explanation: "The synthesis agent can only act on the information provided in its prompt. If prior outputs are not passed, it will report missing research findings. B (“The synthesis agent needs tools that can fetch results directly from t...”) is wrong — Agents do not require direct access to each other’s histories. Proper orchestration passes outputs explicitly via prompts. C (“The synthesis agent's context window is not large enough to hold the c...”) is wrong — If this were the issue, the agent would receive truncated data, not no data at all. The error indicates missing inputs entirely. D (“The subagents need to share a single API connection to enable automati...”) is wrong — Agent communication does not depend on shared API connections. Context must be explicitly passed by the coordinator.",
        },
        {
          id: "q-ext-mar-2",
          text: "When researching \"renewable energy adoption,\" the web search agent returns recent statistics (2024: 35% adoption) while the document analysis agent extracts data from internal reports (2022: 18% adoption). The synthesis agent incorrectly flags these as contradictory sources rather than recognizing the data shows growth over time. What change would best enable the synthesis agent to correctly interpret such temporal differences?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Instruct the synthesis agent to always treat the most recent data as authoritative and place older findings in a separate historical appendix." },
            { id: "b", text: "Require subagents to include publication or data collection dates in their structured outputs." },
            { id: "c", text: "Add a conflict resolution agent that automatically discards older data when newer data exists for the same metric." },
            { id: "d", text: "Configure the web search agent to only return results from the past 6 months" },
          ],
          correctOptionId: "b",
          explanation: "Providing timestamps allows the synthesis agent to understand that the figures refer to different points in time, enabling it to interpret the data as a trend (growth) rather than a contradiction. A (“Instruct the synthesis agent to always treat the most recent data as a...”) is wrong — This approach hides useful context and does not help the agent understand relationships between data points over time. C (“Add a conflict resolution agent that automatically discards older data...”) is wrong — Discarding older data removes valuable historical insight and prevents trend analysis. D (“Configure the web search agent to only return results from the past 6...”) is wrong — Limiting recency reduces context and does not address the core issue of interpreting time-based differences.",
        },
        {
          id: "q-ext-mar-3",
          text: "Users report that final reports sometimes lack depth on specific subtopics. Investigation shows that the document analysis agent frequently identifies gaps—for instance, noting \"the retrieved sources discuss API authentication but lack details on token refresh patterns\"—but under the current strict pipeline, this insight isn't actionable since search has already completed. What is the most effective architectural change?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add a research planning agent before the search phase that decomposes topics into specific sub-questions." },
            { id: "b", text: "Have the synthesis agent attach confidence scores to each section and flag areas with insufficient coverage for manual review." },
            { id: "c", text: "Have the analysis agent report specific gaps to the coordinator, which triggers targeted searches and re-invokes analysis until sufficient." },
            { id: "d", text: "Have the coordinator review analysis output for gap indicators and re-invoke search with gap-informed queries when gaps are detected." },
          ],
          correctOptionId: "c",
          explanation: "This introduces a dynamic, agentic loop (or reflection pattern) into the workflow. Instead of a rigid, linear pipeline where steps cannot be retraced, the system can now adapt based on what it discovers.The Analysis Agent is the Expert: The document analysis agent is the one actively reading the text and identifying exactly what is missing (e.g., \"missing token refresh patterns\").The Coordinator Manages the Flow: By reporting these specific gaps back to the coordinator, the coordinator can intelligently route the workflow back to the search agent with a highly targeted query, then pass the new findings back to the analysis agent to close the loop.",
        },
        {
          id: "q-ext-mar-4",
          text: "Your multi-agent research pipeline crashed after processing 12 of 28 documents. The web search agent had identified relevant sources, the document analyzer had partially completed extraction, and the synthesizer had begun pattern identification. You need to resume processing without repeating work or losing fidelity of prior findings. What state management approach best balances information fidelity with context efficiency when restoring agent state?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Persist the coordinator's conversation log containing all task delegations and responses, providing this to agents when resuming." },
            { id: "b", text: "Have each agent maintain its own persistent state file and reload it independently at the start of each session." },
            { id: "c", text: "Index all agent outputs in a shared vector store. When resuming each agent queries the store using semantic search to retrieve relevant prior findings." },
            { id: "d", text: "Have each agent persist a structured export to a known location. On resume, the coordinator loads the manifest and injects relevant state into agent prompts." },
          ],
          correctOptionId: "d",
          explanation: "This provides high information fidelity (structured, complete outputs) while maintaining context efficiency (only relevant pieces are re-injected into prompts). The coordinator remains in control of what each agent needs, avoiding unnecessary bloat and duplication. A (“Persist the coordinator's conversation log containing all task delegat...”) is wrong — Conversation logs are often verbose and unstructured, leading to context overload and inefficient prompt usage without guaranteed clarity. B (“Have each agent maintain its own persistent state file and reload it i...”) is wrong — This decentralizes control and can lead to inconsistencies and coordination issues, especially when agents need shared or aligned context. C (“Index all agent outputs in a shared vector store. When resuming each a...”) is wrong — Vector stores are useful for retrieval, but they introduce probabilistic recall and may miss or distort critical structured state, reducing fidelity during recovery.",
        },
        {
          id: "q-ext-mar-5",
          text: "The synthesis agent completes its initial pass but flags that three key research questions remain unanswered because the web search and document analysis agents didn't find relevant information on those specific subtopics. The coordinator currently proceeds directly to report generation, producing reports with incomplete coverage. What change would most effectively improve research completeness?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the coordinator evaluate synthesis output for gaps, then re-delegate to web search and document analysis with targeted queries before Invoking synthesis again." },
            { id: "b", text: "Increase the initial breadth of queries sent to web search and document analysis to reduce the probability of missing relevant information." },
            { id: "c", text: "Have the report generation agent note which research questions couldn't be answered, so users understand the limitations of the final output." },
            { id: "d", text: "Give the synthesis agent direct access to web search tools so it can autonomously fill knowledge gaps without returning control to the coordinator." },
          ],
          correctOptionId: "a",
          explanation: "This introduces an iterative feedback loop, where identified gaps are actively addressed. The coordinator maintains control and ensures completeness before final report generation. B (“Increase the initial breadth of queries sent to web search and documen...”) is wrong — Broader queries may help coverage but are inefficient and still won’t guarantee that specific gaps discovered later are filled. C (“Have the report generation agent note which research questions couldn'...”) is wrong — This improves transparency but does not solve the completeness problem. D (“Give the synthesis agent direct access to web search tools so it can a...”) is wrong — This breaks separation of concerns and reduces system control. The coordinator should manage task delegation, not the synthesis agent.",
        },
        {
          id: "q-ext-mar-6",
          text: "When analyzing complex legal cases that cite multiple precedents, the document analysis subagent processes each sequentially. A landmark case citing 12 precedents takes over 3 minutes to analyze completely. What's the most effective way to reduce this latency while preserving the coordinator's ability to monitor and debug the system?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Enable the document analysis subagent to spawn its own specialized subagents dynamically when it encounters cases with many citations" },
            { id: "b", text: "Have the coordinator spawn parallel document analysis subagents, each handling a subset of precedents, then aggregate results before synthesis" },
            { id: "c", text: "Implement a message queue where precedent analysis tasks are processed asynchronously by a pool of worker agents" },
            { id: "d", text: "Create a recursive agent hierarchy where analysis agents subdivide work among child agents until reading single-precedent granularity" },
          ],
          correctOptionId: "b",
          explanation: "This enables parallel processing to reduce latency while keeping orchestration centralized. The coordinator retains full visibility, making monitoring and debugging easier. A (“Enable the document analysis subagent to spawn its own specialized sub...”) is wrong — This decentralizes orchestration and makes the system harder to monitor and debug. The coordinator loses visibility into dynamically spawned agents. C (“Implement a message queue where precedent analysis tasks are processed...”) is wrong — While this improves scalability, it introduces infrastructure complexity and reduces transparency for debugging at the coordinator level. D (“Create a recursive agent hierarchy where analysis agents subdivide wor...”) is wrong — This further complicates the architecture and makes tracing execution paths difficult, reducing observability and control.",
        },
        {
          id: "q-ext-mar-7",
          text: "Introduction monitoring shows the research phase takes longer than expected. Analysis reveals the coordinator invokes the web search subagent, waits for its response, then invokes the document analysis subagent and waits again. These tasks are independent - neither requires the other's output. How should you modify the system to run these subagents concurrently?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Switch both subagents to use a Haiku tier model instead of to reduce their individual execution time." },
            { id: "b", text: "Create an async orchestration layer outside the agent that spawns parallel threads, each running a separate coordinator subagent pair, then aggregates results." },
            { id: "c", text: "Structure the coordinator to emit both Task tool calls (for web search and document analysis) in a single response message rather than across separate conversation turns." },
            { id: "d", text: "Add detailed instructions to the coordinator's system prompt explaining the performance benefits of parallel execution and requesting it invoke both subagents at the same" },
          ],
          correctOptionId: "c",
          explanation: "Issuing both tool calls in one response enables true parallel execution, since the system can run them concurrently instead of waiting for one to finish before starting the other. A (“Switch both subagents to use a Haiku tier model instead of to reduce t...”) is wrong — This may reduce latency per task, but it does not address the core issue of sequential execution vs. parallelism. B (“Create an async orchestration layer outside the agent that spawns para...”) is wrong — This overcomplicates the architecture and duplicates coordinators unnecessarily instead of fixing concurrency within the existing flow. D (“Add detailed instructions to the coordinator's system prompt explainin...”) is wrong — Instructions alone are not reliable for enforcing concurrency. Execution behavior depends on how tool calls are structured, not just prompt wording.",
        },
        {
          id: "q-ext-mar-8",
          text: "Production reviews reveal inconsistent handling of uncertainty in final reports. Sometimes conflicting subagent findings get synthesized into a single overconfident statement; other times reports over-hedge with excessive qualifications, becoming unhelpful. When the web search agent returns \"industry analysts estimate a $50B market size (methodology varies)\" and the document analysis agent returns \"a peer-reviewed study estimates $35B (95% CI: $30B–$40B),\" the coordinator either picks one number arbitrarily or produces a vague statement like \"the market is somewhere between $30B and $50B depending on the source.\" What systematic approach best addresses this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Configure subagents to only report findings meeting a high confidence threshold, filtering uncertain information before it reaches the coordinator." },
            { id: "b", text: "Add a verification subagent that cross-references findings across sources, only passing claims to synthesis that are corroborated by at least two independent sources." },
            { id: "c", text: "Implement a confidence calibration layer that normalizes subagent uncertainty expressions to standardized probability scores (0.0-1.0), then weight-average findings by their calculated reliability scores to produce a statistically grounded synthesis." },
            { id: "d", text: "Instruct the synthesis agent to structure reports with explicit sections distinguishing well-established findings from contested ones, preserving original source characterization and methodological context." },
          ],
          correctOptionId: "d",
          explanation: "This directly addresses inconsistent handling of uncertainty by making it explicit and structured, allowing users to understand both consensus and disagreement without losing context. A (“Configure subagents to only report findings meeting a high confidence...”) is wrong — This suppresses potentially valuable but uncertain insights and introduces bias by hiding ambiguity rather than managing it. B (“Add a verification subagent that cross-references findings across sour...”) is wrong — While useful for validation, this approach still filters out uncertainty instead of representing it, and may discard novel or emerging insights. C (“Implement a confidence calibration layer that normalizes subagent unce...”) is wrong — This introduces artificial precision and may oversimplify complex, qualitative uncertainty, potentially misleading users.",
        },
        {
          id: "q-ext-mar-9",
          text: "A user is expanding the research system beyond its single web search agent by adding specialized data sources. They add a financial API agent that returns structured JSON with margins and growth rates; a news monitoring agent that returns prose summaries of recent developments; and a patent analysis agent that returns structured lists of relevant patents. The synthesis agent combines these into executive briefings. Currently, it converts everything to bullet points, causing financial comparisons to lose tabular clarity and news summaries to lose their narrative flow. What change would most improve briefing quality?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Update the synthesis agent to render each content type appropriately—financial data as tables, news as prose, and technical lists as structured points." },
            { id: "b", text: "Add a format conversion layer between subagents and synthesis that transforms all outputs to a common intermediate representation (such as Markdown) to facilitate more flexible rendering." },
            { id: "c", text: "Standardize all subagent outputs to JSON with fields for every data type to ensure programmatic consistency across the pipeline." },
            { id: "d", text: "Standardize all subagent outputs to prose summaries with a uniform character to maintain a consistent executive voice regardless of the source material." },
          ],
          correctOptionId: "a",
          explanation: "This preserves the natural structure and strengths of each data type, improving clarity, readability, and usefulness of the final briefing. B (“Add a format conversion layer between subagents and synthesis that tra...”) is wrong — While helpful for consistency, this does not guarantee appropriate presentation of different content types and may still lead to generic formatting. C (“Standardize all subagent outputs to JSON with fields for every data ty...”) is wrong — This improves structure but shifts complexity to the synthesis stage and does not inherently improve human-readable output quality. D (“Standardize all subagent outputs to prose summaries with a uniform cha...”) is wrong — This sacrifices important structure (like tables and lists), reducing clarity and effectiveness for data-heavy content.",
        },
        {
          id: "q-ext-mar-10",
          text: "The coordinator agent has AgentDefinitions configured for all four specialized subagents, each with appropriate descriptions, prompts, and tool restrictions. During testing, you notice the coordinator correctly reasons about when to delegate—it generates messages like “I’ll ask the web search agent to find sources on this topic”—but no subagent execution ever occurs. The coordinator then proceeds as if the delegation happened and continues with incomplete information. Logs show no errors. What is the most likely cause?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Subagent context isolation means task descriptions from the coordinator don’t automatically reach subagents; you need to configure explicit context forwarding in Claude AgentOptions." },
            { id: "b", text: "The coordinator’s allowed Tools configuration doesn’t include “Task”, so while it can reason about delegation, cannot invoke the tool required to spawn subagents." },
            { id: "c", text: "The coordinator’s max_tokens setting is too low, causing the Task tool invocation to be truncated before the subagent type parameter can be specified." },
            { id: "d", text: "The AgentDefinitions are configured correctly, but the coordinator’s system prompt doesn’t explicitly list the available subagent types, preventing the model from knowing they can be invoked." },
          ],
          correctOptionId: "b",
          explanation: "The coordinator can plan and describe delegation, but without the Task tool enabled, it cannot actually execute subagent calls—resulting in no errors but no execution. A (“Subagent context isolation means task descriptions from the coordinato...”) is wrong — Even with context isolation, subagents would still be invoked—the issue here is that no invocation happens at all, not that context is missing. C (“The coordinator’s max_tokens setting is too low, causing the Task tool...”) is wrong — Token limits might truncate responses, but this would typically produce malformed outputs or errors—not silent absence of any tool calls. D (“The AgentDefinitions are configured correctly, but the coordinator’s s...”) is wrong — While listing agents can help, the model already demonstrates awareness (“I’ll ask the web search agent…”). The problem is execution capability, not awareness.",
        },
        {
          id: "q-ext-mar-11",
          text: "In production, final reports frequently contain claims without proper source attribution. Investigation shows that while the web search and document analysis agents correctly attach citations to their outputs, the synthesis agent loses track of which sources support which conclusions when combining findings. What's the most effective architectural change?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add a verification step where the report generator uses semantic similarity matching against original sources to reconstruct which claims came from which documents." },
            { id: "b", text: "Have the coordinator inject source identifier prefixes into text before each handoff, then parse these prefixes at report generation to reconstruct citations." },
            { id: "c", text: "Require all subagents to output structured claim-source mappings that the synthesis agent must preserve and merge when combining findings from multiple sources." },
            { id: "d", text: "Maintain complete transcripts of all subagent interactions and add a citation-resolution agent to analyze logs and determine attributions before report generation." },
          ],
          correctOptionId: "c",
          explanation: "This ensures end-to-end attribution fidelity by keeping claim-to-source relationships explicit and structured throughout the pipeline, preventing loss during synthesis. A (“Add a verification step where the report generator uses semantic simil...”) is wrong — This relies on post-hoc inference, which is error-prone and can misattribute claims due to semantic ambiguity. B (“Have the coordinator inject source identifier prefixes into text befor...”) is wrong — This is a fragile, text-based workaround that can break during transformations and doesn’t scale well. D (“Maintain complete transcripts of all subagent interactions and add a c...”) is wrong — This adds unnecessary complexity and still depends on indirect reconstruction rather than preserving attribution explicitly.",
        },
        {
          id: "q-ext-mar-12",
          text: "After the web search and document analysis subagents complete their tasks, the coordinator needs to spawn the synthesis subagent to synthesize the findings. What is the correct approach for providing the synthesis subagent with the information it needs?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Provide the subagent with tool definitions that allow it to request outputs from other subagents via callbacks" },
            { id: "b", text: "Include the complete findings from both subagents directly in the synthesis subagent's prompt" },
            { id: "c", text: "Spawn the subagent with only a brief task description, relying on automatic context inheritance from the coordinator" },
            { id: "d", text: "Pass reference identifiers and give it read access to the shared store other subagents wrote to." },
          ],
          correctOptionId: "d",
          explanation: "This is the most scalable and production-ready approach. It preserves information fidelity while avoiding context bloat, allowing the synthesis agent to retrieve exactly what it needs. A (“Provide the subagent with tool definitions that allow it to request ou...”) is wrong — This introduces unnecessary coupling and complexity. Subagents shouldn’t need to actively fetch data from others. B (“Include the complete findings from both subagents directly in the synt...”) is wrong — While simple, this approach does not scale well for large outputs and can exceed context limits, reducing efficiency. C (“Spawn the subagent with only a brief task description, relying on auto...”) is wrong — There is no automatic context inheritance—without explicit data access, the synthesis agent cannot function properly.",
        },
        {
          id: "q-ext-mar-13",
          text: "The web search agent has gathered several relevant sources for a research topic. The document analysis agent now needs to examine these sources. How does information flow between these two specialized subagents?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "\"The coordinator agent receives the web search agent's output and includes relevant findings in the prompt when invoking the document analysis agent." },
            { id: "b", text: "The agents communicate through an event-driven message queue, with the document analysis agent subscribing to web search completion events." },
            { id: "c", text: "The web search agent directly invokes the document analysis agent, using the discovered sources as parameters." },
            { id: "d", text: "Both agents access a shared memory store where the web search agent writes findings and the document analysis agent reads them." },
          ],
          correctOptionId: "a",
          explanation: "This follows the standard orchestration pattern where the coordinator manages all data flow, explicitly passing outputs between subagents. B (“The agents communicate through an event-driven message queue, with the...”) is wrong — This introduces unnecessary infrastructure complexity and is not the typical agent orchestration model. C (“The web search agent directly invokes the document analysis agent, usi...”) is wrong — Subagents should not invoke each other directly; this breaks centralized control and observability. D (“Both agents access a shared memory store where the web search agent wr...”) is wrong — While possible in advanced systems, this is not the standard or simplest approach; it adds complexity without clear necessity in typical pipelines.",
        },
        {
          id: "q-ext-mar-14",
          text: "After the web search agent finds 25 sources (120K tokens of raw content), the document analysis agent extracts key insights (15K tokens), and the synthesis agent produces a coherent narrative draft (3K tokens), the coordinator must pass context to the report generation agent for the final output with proper source citations. What context-passing strategy provides the best balance of completeness and efficiency?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Pass only the synthesis draft and have a separate post-processing pipeline match claims to sources and insert citations after the report is generated." },
            { id: "b", text: "Pass the synthesis draft along with a structured source index that maps key claims to their source URLs and ant Irant excerpts." },
            { id: "c", text: "Pass the full accumulated context from all prior agents." },
            { id: "d", text: "Pass a condensed summary of all prior stages that preserves the main findings and attributes them to sources by name only." },
          ],
          correctOptionId: "b",
          explanation: "This provides the best balance of completeness and efficiency—retaining precise attribution while keeping context size manageable. A (“Pass only the synthesis draft and have a separate post-processing pipe...”) is wrong — This relies on post-hoc reconstruction, which is error-prone and can lead to incorrect or missing citations. C (“Pass the full accumulated context from all prior agents.”) is wrong — This ensures completeness but is highly inefficient (120K+ tokens) and risks exceeding context limits. D (“Pass a condensed summary of all prior stages that preserves the main f...”) is wrong — This loses granularity and makes precise citation mapping difficult, reducing attribution fidelity.",
        },
        {
          id: "q-ext-mar-15",
          text: "Your search products tool queries an external catalog API that returns paginated results (50 items per request). Production logs show queries frequently match 200+ products, and the design that auto-fetches all pages causes 15-20 second delays. How should you redesign the pagination handling?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Create separate search products and fetch more results tools for pagination." },
            { id: "b", text: "Implement server-side relevance ranking and return only the top 50 most relevant items." },
            { id: "c", text: "Return the first page with total match count and cursor for additional pages." },
            { id: "d", text: "Add a max pages parameter (default: 2) that controls how many pages are fetched internally." },
          ],
          correctOptionId: "c",
          explanation: "This enables lazy loading and explicit control, allowing the agent to fetch more results only when needed—balancing performance and completeness. A (“Create separate search products and fetch more results tools for pagin...”) is wrong — This exposes pagination mechanics to the agent, increasing complexity and coupling tool usage with control flow. B (“Implement server-side relevance ranking and return only the top 50 mos...”) is wrong — While this reduces latency, it removes access to the full result set, limiting flexibility when more results are actually needed. D (“Add a max pages parameter (default: 2) that controls how many pages ar...”) is wrong — This is an improvement over fetching everything, but it still hides pagination control inside the tool and may fetch unnecessary data.",
        },
        {
          id: "q-ext-mar-16",
          text: "Your search Flights tool calls an external airline API that occasionally returns a 503 Service Unavailable error. What is the most effective way to handle this error in your tool implementation?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Return an empty flight list as if the search succeeded but found no matching flights." },
            { id: "b", text: "Log the error internally and return an empty response, letting the model continue without the flight data." },
            { id: "c", text: "Return an error message in the tool result explaining the service is temporarily unavailable." },
            { id: "d", text: "Automatically retry the request up to five times with exponential backoff before returning results to the agent." },
          ],
          correctOptionId: "d",
          explanation: "This is the most effective approach—handles transient failures gracefully, improves reliability, and only surfaces errors if retries fail. A (“Return an empty flight list as if the search succeeded but found no ma...”) is wrong — This hides the failure and misleads the system into thinking no flights exist, which can lead to incorrect conclusions. B (“Log the error internally and return an empty response, letting the mod...”) is wrong — This still suppresses the failure signal, preventing the agent from taking corrective action. C (“Return an error message in the tool result explaining the service is t...”) is wrong — While transparent, this alone doesn’t attempt recovery and may degrade user experience unnecessarily.",
        },
        {
          id: "q-ext-mar-17",
          text: "Your MCP server implements a check_availability tool that queries an external calendar API. During testing, you encounter three error conditions:(1) the tool is called with a malformed request, missing the required user_email parameter(2) the calendar API returns a 404 because the specified user doesn't exist in the calendar system(3) the calendar API returns a 503 because the service is temporarily unavailable.How should each error be reported according to MCP's error handling design?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Report error 1 as a JSON-RPC protocol error, report errors 2 and 3 as tool results with isError: true" },
            { id: "b", text: "Report all three as tool results with isError: true" },
            { id: "c", text: "Report errors 1 and 2 as JSON-RPC protocol errors, report error 3 as a tool result with isError: true" },
            { id: "d", text: "Report all three as JSON-RPC protocol errors." },
          ],
          correctOptionId: "a",
          explanation: "Error 1 (malformed request) → JSON-RPC protocol error (invalid input)Error 2 (user not found) → Tool result with isError: true (valid execution, meaningful failure)Error 3 (service unavailable) → Tool result with isError: true (transient external failure). B (“Report all three as tool results with isError: true”) is wrong — Malformed requests (error 1) are protocol-level issues, not tool execution results, so they should not be reported this way. C (“Report errors 1 and 2 as JSON-RPC protocol errors, report error 3 as a...”) is wrong — A 404 (error 2) is a valid tool execution outcome (the user doesn’t exist), not a protocol error. D (“Report all three as JSON-RPC protocol errors.”) is wrong — Only malformed requests should be protocol errors; external API responses are tool-level outcomes, not protocol failures.",
        },
        {
          id: "q-ext-mar-18",
          text: "Your documents (query) tool returns results as \"Found 3 documents: Q2 Budget Proposal, Q2 Budget Forecast, Annual Review.\" You want the agent to be able to open a specific one of these documents in a later step (e.g., \"open the Q2 Budget Forecast\") without re-searching from scratch. What return format would best enable these multi-step workflows?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "URLs that users can click to open the document in their browser." },
            { id: "b", text: "Structured data containing document IDs and metadata for each result." },
            { id: "c", text: "A JSON array of document titles extracted from the search results." },
            { id: "d", text: "More detailed human-readable descriptions including the size and authors." },
          ],
          correctOptionId: "b",
          explanation: "This enables the agent to programmatically reference specific documents (via IDs) across multiple steps, making workflows like follow-up queries or document retrieval precise and reliable. A (“URLs that users can click to open the document in their browser.”) is wrong — URLs are useful for users, but not ideal for agents performing multi-step workflows that require reliable referencing and further operations. C (“A JSON array of document titles extracted from the search results.”) is wrong — Titles alone are ambiguous and not stable identifiers, making it difficult for agents to reliably act on specific documents. D (“More detailed human-readable descriptions including the size and autho...”) is wrong — Helpful for users, but still unstructured and not suitable for precise multi-step agent operations.",
        },
        {
          id: "q-ext-mar-19",
          text: "Your agent has access to 50+ specialized API connectors for different external services. As the connector library grew, tool selection accuracy dropped to 58%. You design a search_connectors(description) tool that finds matching connectors, but in testing agents frequently skip searching and call connectors directly (often incorrectly), or search select wrong connectors from the filtered results.How should you design the tool composition pattern to address both issues?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Design connectors with built-in compatibility validation that return descriptive errors for mismatched requests." },
            { id: "b", text: "Design a find_and_execute(description, params) composite tool that searches and immediately executes the best matching connector." },
            { id: "c", text: "Design search_connectors to dynamically add matched connectors to the agent's available tools. Connectors start unavailable and persist once discovered." },
            { id: "d", text: "Enhance all connector descriptions with detailed usage samples, edge cases, and input requirements. Add few-shot examples showing the correct search-then-use workflow." },
          ],
          correctOptionId: "c",
          explanation: "This enforces the search-first pattern by limiting available tools initially and reducing the decision space, improving both discovery and correct selection. A (“Design connectors with built-in compatibility validation that return d...”) is wrong — This helps with error handling after a wrong choice is made, but does not improve initial tool selection accuracy. B (“Design a find_and_execute(description, params) composite tool that sea...”) is wrong — This removes transparency and control, making debugging harder and preventing the agent from reasoning about tool choice. D (“Enhance all connector descriptions with detailed usage samples, edge c...”) is wrong — While helpful, this still relies on the agent to follow instructions and does not enforce correct behavior, especially at scale with 50+ tools.",
        },
        {
          id: "q-ext-mar-20",
          text: "Your publish article tool calls an external CMS API that occasionally returns transient errors (network timeouts, 503s) and non-transient errors (403 permission denied, 422 validation failure).Currently, every error is returned directly to the agent, which leads to the agent retrying non-transient errors and wasting turns on failures that will never succeed. How should you partition error-handling responsibility between the tool implementation and the agent?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Handle all errors inside the tool: Implement retries with exponential backoff for every error type, and only surface a failure to the agent after a fixed number of retry attempts have been exhausted." },
            { id: "b", text: "Surface all errors to the agent immediately with detailed context, and let the agent decide which errors to retry and how many times-keeping the tool implementation stateless and simple." },
            { id: "c", text: "Implement a universal error handler that catches all exceptions and returns a generic \"tool unavailable-try again later\" message, shielding the agent from error complexity." },
            { id: "d", text: "Retry transient errors (timeouts, 503s) automatically inside the tool; surface non-transient errors (permission denied, validation failures) to the agent with a descriptive message." },
          ],
          correctOptionId: "d",
          explanation: "This cleanly separates responsibility:Tool handles recoverable/transient issues automaticallyAgent receives actionable errors it can fix (permissions, input validation). A (“Handle all errors inside the tool: Implement retries with exponential...”) is wrong — This wastes time retrying non-transient errors (e.g., 403, 422) that will never succeed and hides useful feedback from the agent. B (“Surface all errors to the agent immediately with detailed context, and...”) is wrong — This pushes retry logic to the agent, leading to inefficient behavior and wasted turns. C (“Implement a universal error handler that catches all exceptions and re...”) is wrong — This removes critical detail, preventing the agent from taking corrective actions when possible.",
        },
        {
          id: "q-ext-mar-21",
          text: "Your remove_team_member tool uses a dry_run: boolean parameter for previewing impacts before execution. Production monitoring shows the agent bypasses the preview step in 15% of calls by calling with dry_run=false directly. You need to ensure every removal is preceded by a preview that the user explicitly confirms. What is the most reliable approach?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Replace with two tools: preview_remove_member returns impact details and a single-use confirmation token; execute_remove_member requires that token, binding execution to the specific previewed action." },
            { id: "b", text: "Add server-side validation that permits dry_run=false only when a dry_run=true call with identical parameters occurred within the past 60 seconds." },
            { id: "c", text: "Annotate the tool as requiring confirmation and configure the orchestration layer to prompt the user for approval before forwarding any calls to annotated tools." },
            { id: "d", text: "Add detailed instructions and few-shot examples to the tool description requiring the agent to always call with dry_run=true first and wait for user confirmation before calling with dry_run=false." },
          ],
          correctOptionId: "a",
          explanation: "This enforces the correct workflow at the system level by requiring a valid preview step and tying execution to an explicit confirmation, making bypass impossible. B (“Add server-side validation that permits dry_run=false only when a dry_...”) is wrong — This approach is brittle because it depends on timing and does not guarantee that the user actually reviewed or confirmed the preview. C (“Annotate the tool as requiring confirmation and configure the orchestr...”) is wrong — This depends on orchestration behavior and is not strictly enforced, so it can still be bypassed or misconfigured. D (“Add detailed instructions and few-shot examples to the tool descriptio...”) is wrong — Instruction-based approaches are not reliable for enforcement, as demonstrated by the existing bypass rate.",
        },
        {
          id: "q-ext-mar-22",
          text: "Your expense reimbursement agent processes employee requests using a process_reimbursement tool. Company policy requires that reimbursements above $500 must be approved before funds are disbursed. The agent handles hundreds of requests daily, and you need the threshold enforcement to be tamper-proof regardless of how the agent is prompted. What design ensures the $500 approval threshold cannot be bypassed?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The process reimbursement tool accepts an approved by manager parameter. The system prompt instructs the agent to only set this to true after confirming that a manager approved the request. A nightly audit script reviews all reimbursements where approved by manager was set to true." },
            { id: "b", text: "The process reimbursement tool accepts amount and details, and internally enforces the threshold; amounts <$500 are auto-disbursed and the tool returns a success confirmation. Amounts >$500 cause the tool to create a pending approval request and return a status indicating manager review is pending." },
            { id: "c", text: "Provide two tools: auto reimburse (hard-coded limit of $500) and manager approval. Include detailed system prompt instructions telling the agent to check the amount and use the appropriate tool. Add a Post ToolUse hook that logs which tool was called for auditing." },
            { id: "d", text: "Implement the threshold check in a PreToolUse hook that inspects the amount parameter before process reimbursement executes. If the amount exceeds $500, the hook modifies the context to add a requires approval: true flag, which the tool checks before disbursing." },
          ],
          correctOptionId: "b",
          explanation: "This enforces the rule inside the tool itself, making it impossible to bypass regardless of how the agent is prompted. A (“The process reimbursement tool accepts an approved by manager paramete...”) is wrong — This relies on the agent following instructions and post-hoc auditing, which is not tamper-proof and allows bypass at execution time. C (“Provide two tools: auto reimburse (hard-coded limit of $500) and manag...”) is wrong — Again depends on agent behavior and correct tool selection. Logging helps auditing but does not prevent misuse. D (“Implement the threshold check in a PreToolUse hook that inspects the a...”) is wrong — PreToolUse hooks can be bypassed or misconfigured and still rely on downstream logic. Enforcement should reside directly within the tool for full reliability.",
        },
        {
          id: "q-ext-mar-23",
          text: "Your order management system requires tools for three distinct operations: issuing refunds (requires amount and reason), canceling orders (requires reason), and reshipping orders (requires shipping address). Each operation shares an order_id parameter but has different additional requirements. You notice during testing that your current tool design frequently omits required parameters or includes irrelevant ones. What design change will most effectively improve parameter accuracy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Keep one unified tool with all parameters marked optional, but add few-shot examples in the system prompt showing correct parameter combinations for each operation." },
            { id: "b", text: "Keep one unified tool but add JSON Schema if-then-else conditionals to enforce that parameters like amount are required only when the operation type is \"refund\"." },
            { id: "c", text: "Split into three separate tools (each defining only the parameters required for that specific operation." },
            { id: "d", text: "Keep one unified tool with a nested operation object parameter whose internal structure varies by operation type, documented in the tool description." },
          ],
          correctOptionId: "c",
          explanation: "This reduces ambiguity and ensures the agent only sees relevant parameters per operation, leading to much higher accuracy. A (“Keep one unified tool with all parameters marked optional, but add few...”) is wrong — Examples help, but the schema remains ambiguous, so errors will still occur. B (“Keep one unified tool but add JSON Schema if-then-else conditionals to...”) is wrong — While technically valid, this increases complexity and is less reliable than simply separating tools. D (“Keep one unified tool with a nested operation object parameter whose i...”) is wrong — This adds complexity and cognitive load, making it harder for the agent to consistently provide correct parameters.",
        },
        {
          id: "q-ext-mar-24",
          text: "Your portfolio value tool returns the total value of a user's investment portfolio. You're deciding between returning a structured JSON object with explicit fields versus returning information as a formatted text string. What is the primary advantage of using structured output with defined fields?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Structured JSON consumes significantly fewer tokens than natural language, substantially reducing API costs." },
            { id: "b", text: "Structured JSON is processed deterministically by the model, significantly improving accuracy when extracting values." },
            { id: "c", text: "JSON schemas automatically validate that the underlying API returned correct data before the agent processes it." },
            { id: "d", text: "The agent can reliably extract specific values without parsing free form text, reducing errors in subsequent operations." },
          ],
          correctOptionId: "d",
          explanation: "Structured output provides clear, predictable fields, making it easy for the agent to use the data accurately in downstream steps. A (“Structured JSON consumes significantly fewer tokens than natural langu...”) is wrong — Token usage depends on the content; JSON is not inherently more compact than text and may sometimes use more tokens. B (“Structured JSON is processed deterministically by the model, significa...”) is wrong — The model is still probabilistic; JSON improves structure, but not deterministic processing. C (“JSON schemas automatically validate that the underlying API returned c...”) is wrong — Schemas define structure, but they do not guarantee correctness of the actual data returned by the API.",
        },
        {
          id: "q-ext-mar-25",
          text: "Your scheduling agent uses get_available_slots(date, provider_id) to retrieve open appointment times, then book_appointment(provider_id, slot_time, patient_id) to reserve a slot. Support tickets show that 15% of booking attempts fail with \"slot no longer available\" because another user booked the slot between the availability check and the booking call. How should you redesign these tools?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Combine both tools into a single find_and_book_appointment that atomically checks availability and books, returning either the confirmed booking or available alternatives." },
            { id: "b", text: "Modify book_appointment to return detailed failure information including currently available alternative slots when the requested slot is unavailable, enabling the agent to retry with a di time." },
            { id: "c", text: "Keep both tools but add retry logic to the agent's system prompt, instructing it to call get_available_slots again and select a different time if booking fails." },
            { id: "d", text: "Add a hold_slot(provider_id, slot_time) tool that creates a 60 second temporary reservation, requiring the agent to call it between checking availability and booking." },
          ],
          correctOptionId: "a",
          explanation: "This eliminates the race condition by making the operation atomic, ensuring consistency and reliability. B (“Modify book_appointment to return detailed failure information includi...”) is wrong — This improves recovery but does not fix the race condition between availability check and booking. C (“Keep both tools but add retry logic to the agent's system prompt, inst...”) is wrong — This still suffers from the same race condition and relies on agent behavior rather than fixing the underlying issue. D (“Add a hold_slot(provider_id, slot_time) tool that creates a 60 second...”) is wrong — This reduces the issue but introduces additional complexity and still requires multiple steps that can fail.",
        },
        {
          id: "q-ext-mar-26",
          text: "Your agent has a log_workout tool that accepts exercise_type (string), value (number), and measurement (string). Production monitoring shows the agent frequently passes mismatched combinations-using measurement: \"reps\" for cardio exercises like running, or measurement: \"miles\" for strength exercises like bench press. Your exercises naturally divide into two categories: cardio (measured in time or distance) and strength (measured in reps and sets). 23% of tool calls have invalid combinations. What approach would most effectively reduce these errors?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Implement server-side validation returning descriptive errors for invalid combinations, allowing the agent to retry with corrections." },
            { id: "b", text: "Split into log_cardio_workout (with duration_minutes or distance_miles parameters) and log_strength_workout (with reps and sets parameters)." },
            { id: "c", text: "Add enum constraints on measurement limiting values to \"minutes\", \"miles\", \"reps\", or \"sets\" to prevent arbitrary measurement strings." },
            { id: "d", text: "Add explicit examples to the tool description showing valid combinations (e.g., \"For running: use minutes or miles. For push-ups: use reps\") with constraints for each exercise category." },
          ],
          correctOptionId: "b",
          explanation: "This enforces correctness at the schema level by eliminating invalid parameter combinations entirely, significantly reducing errors. A (“Implement server-side validation returning descriptive errors for inva...”) is wrong — This catches errors after they occur but does not prevent them, leading to wasted turns and inefficiency. C (“Add enum constraints on measurement limiting values to \"minutes\", \"mil...”) is wrong — This restricts values but does not prevent invalid combinations (e.g., still allows \"miles\" for bench press). D (“Add explicit examples to the tool description showing valid combinatio...”) is wrong — Helpful guidance, but not enforceable—agents can still make mistakes.",
        },
        {
          id: "q-ext-mar-27",
          text: "Your MCP server includes archive_file(file_id) and delete_file(file_id) tools. Production logs show the agent calls delete_file when users ask to \"remove old backups,\" policy requires archiving backup files. Both tools currently have minimal descriptions: \"Archives a file\" and \"Deletes a file.\" Which change most directly improves tool selection?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add a confirmation step that requires users to type \"CONFIRM DELETE\" before delete_file executes." },
            { id: "b", text: "Implement server-side validation that rejects delete_file calls for files tagged as backups, returning an error message suggesting archive_file." },
            { id: "c", text: "Expand tool descriptions to clarify use cases, adding guidance like \"Do not use for backup files\" to delete_file." },
            { id: "d", text: "Add few-shot examples to the system prompt demonstrating that requests involving \"backup\" or \"old\" should use archive_file." },
          ],
          correctOptionId: "c",
          explanation: "Clear, specific descriptions directly influence the agent’s tool selection reasoning, making it less likely to choose the wrong tool. A (“Add a confirmation step that requires users to type \"CONFIRM DELETE\" b...”) is wrong — This prevents accidental execution but does not improve the agent’s tool selection decision. B (“Implement server-side validation that rejects delete_file calls for fi...”) is wrong — This enforces policy after the wrong choice is made but does not directly improve initial selection. D (“Add few-shot examples to the system prompt demonstrating that requests...”) is wrong — Helpful, but less direct and less reliable than improving the tool descriptions themselves.",
        },
        {
          id: "q-ext-mar-28",
          text: "Your CRM agent's delete_contact tool handles requests like \"delete the duplicate entry for Acme Corp.\" The database contains similarly named records (e.g., \"Acme Corp,\" \"Acme Corporation,\" \"ACME Corp Inc.\"), and analytics show 8% of deletions are reversed within 24 hours due to misidentified records. Users have also complained that the current multi-step confirmation flow adds too much friction to routine cleanup tasks. Which approach most effectively reduces the error rate while maintaining workflow efficiency?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Require users to supply the exact record ID from the CRM Interface rather than using natural language references to contact names." },
            { id: "b", text: "Deploy automated duplicate detection that identifies and merges probable duplicates, removing the need for manual deletion requests." },
            { id: "c", text: "Implement soft-delete with a 30-day recovery window so users can undo mistakes without slowing down the deletion workflow." },
            { id: "d", text: "Present matched records with differentiating fields and require single-click confirmation of the intended target before executing deletion." },
          ],
          correctOptionId: "d",
          explanation: "This directly addresses ambiguity by showing clear distinctions between similar records while keeping the workflow fast with a lightweight confirmation step. A (“Require users to supply the exact record ID from the CRM Interface rat...”) is wrong — This reduces errors but adds significant friction and hurts usability for routine tasks. B (“Deploy automated duplicate detection that identifies and merges probab...”) is wrong — Helpful as a separate improvement, but it doesn’t solve incorrect deletions during manual requests. C (“Implement soft-delete with a 30-day recovery window so users can undo...”) is wrong — This mitigates impact after errors occur but does not reduce the error rate itself.",
        },
        {
          id: "q-ext-mar-29",
          text: "After implementing tool use with strict schema definitions, JSON syntax errors are eliminated, but 5% of extractions still have valid JSON with empty arrays or null values for required fields like citations and methodology. Spot-checking reveals that source documents contain this information, but in varied formats — inline citations vs. bibliographies, methodology sections vs. details embedded in introductions. What's the most effective way to address these failures?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add few-shot examples showing extractions from varied document structures — different citation formats and methodology placements." },
            { id: "b", text: "Modify your schema to make citations and methodology optional, and flag Incomplete records for manual review rather than falling validation." },
            { id: "c", text: "Build a regex-based post-processing layer that scans source documents for citation patterns and methodology keywords, populating empty fields when the model falls to extract." },
            { id: "d", text: "Implement retry logic that re-sends requests when validation detects empty required fields." },
          ],
          correctOptionId: "a",
          explanation: "This directly improves the model’s ability to generalize across diverse document formats, addressing the root cause of missed extractions. B (“Modify your schema to make citations and methodology optional, and fla...”) is wrong — This lowers data quality standards and avoids solving the extraction problem. C (“Build a regex-based post-processing layer that scans source documents...”) is wrong — Regex approaches are brittle and unreliable across varied formats, especially for complex structures like methodology. D (“Implement retry logic that re-sends requests when validation detects e...”) is wrong — Retries without improving guidance will likely produce the same incomplete outputs.",
        },
        {
          id: "q-ext-mar-30",
          text: "The system processes product reviews using tool use with a defined schema: rating (integer 1-5), pros (string array), cons (string array), and overall_sentiment (enum: positive, neutral, negative). Testing reveals two issues with brief or ambiguous reviews (~20% of the dataset): (1) for reviews like \"Great product!\", Claude fabricates specific pros and cons rather than indicating that information isn't explicitly stated, and (2) for sarcastic reviews like \"Well, that was... interesting,\" Claude picks a sentiment arbitrarily since there's no option for ambiguous cases. What schema modification best addresses both issues?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Make pros and cons optional fields, and add \"neutral\" and \"unclear\" to the sentiment enum" },
            { id: "b", text: "Allow empty arrays for pros/cons as valid output, and add \"unclear\" ss the sentiment enum" },
            { id: "c", text: "Add an extraction_confidence field (0.0-1.0) for each value, and filter outputs where any confidence falls below a threshold." },
            { id: "d", text: "Allow null values for pros/cons, and add \"unclear\" to the sentiment earum." },
          ],
          correctOptionId: "b",
          explanation: "This prevents fabrication by allowing explicitly empty outputs when no details are present, and “unclear” handles ambiguous or sarcastic sentiment appropriately. A (“Make pros and cons optional fields, and add \"neutral\" and \"unclear\" to...”) is wrong — Making fields optional can lead to inconsistent outputs, and “neutral” doesn’t solve ambiguity—it’s different from “unclear”. C (“Add an extraction_confidence field (0.0-1.0) for each value, and filte...”) is wrong — This adds complexity but doesn’t prevent fabrication or resolve ambiguity in outputs. D (“Allow null values for pros/cons, and add \"unclear\" to the sentiment ea...”) is wrong — Nulls are less consistent than empty arrays for structured outputs and can complicate downstream processing.",
        },
        {
          id: "q-ext-mar-31",
          text: "Your extraction system implements automatic retries when validation fails. On each retry, the specific validation error is appended to the prompt. This retry-with-error-feedback approach resolves most failures within 2-3 attempts. For which failure pattern would additional retries be LEAST effective?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The model extracts citation counts as locale-formatted strings (\"1234\") when the schema requires integers" },
            { id: "b", text: "The model extracts dates as ISO 8601 datetime strings (\"2003-03-15T00:00:00Z\") when the schema requires only the date portion." },
            { id: "c", text: "The model extracts \"et al.\" for co-authors when the full list exists only in an external document not in the input" },
            { id: "d", text: "The model extracts keywords as a nested object organized by category when the schema requires a flat array of strings" },
          ],
          correctOptionId: "c",
          explanation: "Retries won’t help because the required information is not present in the input context. The model cannot recover missing data through repeated attempts. A (“The model extracts citation counts as locale-formatted strings (\"1234\"...”) is wrong — This is a formatting issue that can be corrected through retries with validation feedback. B (“The model extracts dates as ISO 8601 datetime strings (\"2003-03-15T00:...”) is wrong — Also a format mismatch, which retries can fix easily. D (“The model extracts keywords as a nested object organized by category w...”) is wrong — This is a structural mismatch that can typically be corrected with retry feedback.",
        },
        {
          id: "q-ext-mar-32",
          text: "Your invoice extraction uses tool use with strict JSON schemas. JSON syntax errors never occur, but 12% of extractions fail semantic validation — for example, line item amounts don't sum to the extracted total, or vendor IDs don't match valid formats. These failures currently route to manual review. What's the most effective approach to reduce manual review volume while maintaining accuracy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Retry the extraction up to 3 times when validation fallis, accepting the first result that passes validation." },
            { id: "b", text: "Implement post-processing logic that automatically corrects common amors, such as recalculating totais from line items when sums don't match." },
            { id: "c", text: "Add stricter schema constraints with detailed field descriptions to prevent the model from generating invalid values initially." },
            { id: "d", text: "When validation falls, make a follow-up request with the document, extraction, and validation errors for model correction." },
          ],
          correctOptionId: "d",
          explanation: "This provides targeted feedback, enabling the model to fix specific issues, significantly reducing manual review while maintaining accuracy. A (“Retry the extraction up to 3 times when validation fallis, accepting t...”) is wrong — Retries without targeted feedback often repeat the same mistakes and don’t reliably fix semantic inconsistencies. B (“Implement post-processing logic that automatically corrects common amo...”) is wrong — While useful for specific cases, this is narrow and brittle, and doesn’t address broader validation failures like incorrect IDs. C (“Add stricter schema constraints with detailed field descriptions to pr...”) is wrong — Schema improvements help upfront, but they cannot fully prevent semantic errors like mismatched totals.",
        },
        {
          id: "q-ext-mar-33",
          text: "Your team is extracting structured data from 50,000 legacy legal contracts under a two-week deadline. Initial testing with 500 sample documents shows 82% pass JSON schema validation on the first attempt, while the remaining 18% fail due to diverse issues — missing required fields, malformed dates, and incorrectly identified parties. Documents that fail typically need refinements targeting their specific failure modes before extraction succeeds. Which batch processing strategy is the most cost-efficient while still meeting the deadline?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Submit all 50,000 documents via batch API, then submit failed extractions in successive batches—refining prompts between each batch—until all documents pass validation." },
            { id: "b", text: "Split documents into 10 sequential batches of 5,000 each, analysing results and refining prompts between batches to improve extraction quality progressively." },
            { id: "c", text: "Use the real-time API for all 50,000 documents since the batch API's 24-hour processing window creates unacceptable deadline risk." },
            { id: "d", text: "Process 2,000 sample documents via real time API to identify failure patterns and refine prompts, then batch process all 50,000 with the optimized prompts." },
          ],
          correctOptionId: "a",
          explanation: "This maximizes throughput and parallelism upfront, ensuring the deadline is met. Then it uses targeted iterative refinement only on failures, making it cost-efficient while handling diverse failure modes effectively. B (“Split documents into 10 sequential batches of 5,000 each, analysing re...”) is wrong — This introduces unnecessary sequential delays and reduces throughput, risking the deadline. C (“Use the real-time API for all 50,000 documents since the batch API's 2...”) is wrong — This is unnecessarily expensive and not required given batch processing capabilities. D (“Process 2,000 sample documents via real time API to identify failure p...”) is wrong — While proactive, this assumes failure patterns generalize well, which the scenario suggests they don’t—since failures are diverse and require case-specific refinements.",
        },
        {
          id: "q-ext-mar-34",
          text: "Your extraction pipeline processes contracts that frequently include amendments. When a contract contains both original terms and later amendments (e.g., original clause specifies \"30-day payment terms\" while Amendment 1 changes this to \"45 days\"), the model inconsistently extracts one value or the other with no indication of which applies. What's the most effective approach to improve extraction accuracy for documents with amendments?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Preprocess documents with a classifier that identifies and removes superseded sections before the main extraction step." },
            { id: "b", text: "Redesign the schema so amended fields capture multiple values, each with source location and effective date." },
            { id: "c", text: "Implement post-extraction validation using pattern matching to detect amendments and flag those extractions for manual review." },
            { id: "d", text: "Add prompt instructions to always extract the most recent amendment value and ignore superseded original terms." },
          ],
          correctOptionId: "b",
          explanation: "This preserves both original and amended values with context, enabling accurate interpretation and avoiding ambiguity about which value applies. A (“Preprocess documents with a classifier that identifies and removes sup...”) is wrong — This is brittle and risky—accurately identifying and removing superseded clauses is complex and may lead to loss of important context. C (“Implement post-extraction validation using pattern matching to detect...”) is wrong — This increases manual review but does not improve extraction accuracy or resolve ambiguity. D (“Add prompt instructions to always extract the most recent amendment va...”) is wrong — This relies on model judgment, which is inconsistent, and loses traceability of how values changed over time.",
        },
        {
          id: "q-ext-mar-35",
          text: "Your system must extract event details from calendar invitations and output JSON that strictly conforms to a schema with fields for title, date, time, location, and attendees. Downstream systems reject any malformed or non-conformant JSON. What approach provides the most reliable schema compliance?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Pre-fill Claude's response with an opening brace to force JSON output, then complete and parse the response." },
            { id: "b", text: "Append instructions like \"Output only valid JSON matching the schema exactly\" and implement retry logic to re-prompt when JSON parsing fails." },
            { id: "c", text: "Define a tool with your target schema as input parameters and have Claude call it with the extracted data." },
            { id: "d", text: "Include detailed JSON formatting instructions and the target schema in your prompt, then parse Claude's text response as JSON." },
          ],
          correctOptionId: "c",
          explanation: "Tool use enforces strict schema compliance at generation time, ensuring valid, structured JSON that downstream systems can reliably consume. A (“Pre-fill Claude's response with an opening brace to force JSON output,...”) is wrong — This is a fragile workaround and does not guarantee valid or schema-compliant JSON. B (“Append instructions like \"Output only valid JSON matching the schema e...”) is wrong — Helpful but not reliable—models can still produce malformed or non-conformant JSON. D (“Include detailed JSON formatting instructions and the target schema in...”) is wrong — Prompt-based formatting alone cannot guarantee strict compliance, especially in edge cases.",
        },
        {
          id: "q-ext-mar-36",
          text: "Your schema includes a skills: string[] field. Production monitoring reveals three consistency issues: (1) compound phrases like \"Python and SQL\" are sometimes kept as one entry, sometimes split; (2) implied but unstated skills occasionally appear in extractions; (3) similar documents produce wildly different array lengths (5-10 vs 40+ entries). Your prompt currently says \"Extract skills mentioned.\" What's the most effective improvement?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Add constraints: \"Extract 10-20 skills maximum, one skill per entry, only explicitly named skills.\"" },
            { id: "b", text: "Add post-extraction normalization that maps skills to a canonical taxonomy and deduplicates similar entries." },
            { id: "c", text: "Enrich the schema with additional fields to capture extraction metadata." },
            { id: "d", text: "Add few-shot examples showing compound-phrase handling, explicit-mention criteria, and entry granularity." },
          ],
          correctOptionId: "d",
          explanation: "Examples directly guide the model on how to split, what to include, and the expected level of detail, addressing all three issues effectively. A (“Add constraints: \"Extract 10-20 skills maximum, one skill per entry, o...”) is wrong — This enforces limits but is arbitrary and may exclude valid skills or still leave ambiguity in how to split phrases. B (“Add post-extraction normalization that maps skills to a canonical taxo...”) is wrong — Helpful downstream, but it does not fix inconsistent extraction behavior at the source. C (“Enrich the schema with additional fields to capture extraction metadat...”) is wrong — Adds complexity but does not directly address inconsistency in skill identification and formatting.",
        },
        {
          id: "q-ext-mar-37",
          text: "Your pipeline uses a tool called extract_metadata with a JSON schema for paper details. You've also defined lookup_citations and verify_doi tools for enrichment. During testing, you notice that when users include requests like \"extract the metadata and tell me how cited it is,\" Claude sometimes calls lookup_citations first, which fails because it needs the DOI that extract_metadata would provide. What's the most effective way to ensure structured metadata extraction happens first?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Set tool choice to (\"type\": \"tool\", \"name\": \"extract_metadata\") and process the enrichment requests in subsequent turns after receiving the extracted metadata." },
            { id: "b", text: "Set tool choice to \"any\" so Claude must use a tool, combined with system prompt instructions prioritizing extract_metadata." },
            { id: "c", text: "Set tool choice to (\"type\": \"tool\", \"name\": \"extract_metadata\") for every API call in the pipeline, ensuring Claude always extracts metadata before any enrichment can occur." },
            { id: "d", text: "Set tool choice to \"auto\" and reorder the tool definitions so extract_metadata appears first in the tools array, since Claude prioritizes earlier-listed tools." },
          ],
          correctOptionId: "a",
          explanation: "This enforces the correct execution order, ensuring required data (like DOI) is available before dependent tools are called. B (“Set tool choice to \"any\" so Claude must use a tool, combined with syst...”) is wrong — This does not guarantee ordering—Claude may still choose the wrong tool first. C (“Set tool choice to (\"type\": \"tool\", \"name\": \"extract_metadata\") for ev...”) is wrong — This is too rigid and prevents legitimate use of other tools in later steps. D (“Set tool choice to \"auto\" and reorder the tool definitions so extract_...”) is wrong — Tool ordering does not reliably control selection or execution order.",
        },
        {
          id: "q-ext-mar-38",
          text: "Your system has been operating with 100% human review for 3 months. Analysis shows that extractions with model confidence >90% have 97% accuracy overall. To reduce reviewer workload, you plan to automate high-confidence extractions. Before deploying, what validation step is most critical?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Verify that 97% accuracy meets requirements for all downstream systems that consume the extracted data." },
            { id: "b", text: "Analyze accuracy by document type and field to verify high-confidence extractions perform consistently across all segments, not just in aggregate." },
            { id: "c", text: "Compare accuracy at different confidence thresholds (85%, 90%, 95%) to find the optimal cutoff that maximizes automation while minimizing errors." },
            { id: "d", text: "Run a two-week pilot routing 25% of high-confidence extractions directly to downstream systems and monitor error reports." },
          ],
          correctOptionId: "b",
          explanation: "Aggregate accuracy can hide weak spots. You need to ensure confidence >90% is trustworthy across all segments, otherwise automation may introduce systematic errors. A (“Verify that 97% accuracy meets requirements for all downstream systems...”) is wrong — Important, but it doesn’t ensure the confidence signal is reliable across different cases—it only checks overall acceptability. C (“Compare accuracy at different confidence thresholds (85%, 90%, 95%) to...”) is wrong — Useful for tuning, but only after confirming the confidence signal is consistent and reliable across segments. D (“Run a two-week pilot routing 25% of high-confidence extractions direct...”) is wrong — A pilot is valuable, but deploying without validating segment-level reliability first introduces avoidable risk.",
        },
        {
          id: "q-ext-mar-39",
          text: "Your extraction system uses tool_use with a JSON schema containing 12 fields and detailed descriptions, totaling approximately 2,500 tokens for the complete tool definition. Processing documents under 150K tokens yields 98% accuracy. For documents between 175-190K tokens, accuracy drops to 71%, with information from the final third consistently missed. The model's context window is 200K tokens. What is the most likely cause?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Very long documents exceed the model's effective attention span regardless of context limits, causing accuracy degradation for content farther from the prompt instructions." },
            { id: "b", text: "The model distributes attention proportionally across input length, causing fields mentioned only once near the document's end to receive insufficient processing focus." },
            { id: "c", text: "Tool definitions consume input context tokens. Combined with system prompts and document content, the total approaches the context limit, degrading end-of-document processing." },
            { id: "d", text: "Schemas exceeding 8-10 fields increase decision complexity during parameter generation, reducing extraction accuracy independent of document length." },
          ],
          correctOptionId: "c",
          explanation: "The tool schema (~2,500 tokens) plus system prompts and large documents push total input close to the 200K context limit, causing truncation or reduced attention to the final portion—hence missed information in the last third. A (“Very long documents exceed the model's effective attention span regard...”) is wrong — While attention can vary, the sharp drop near the context boundary strongly indicates a context limit issue, not general attention decay. B (“The model distributes attention proportionally across input length, ca...”) is wrong — This is a weaker effect and does not explain the consistent failure in the final third tied to document size thresholds. D (“Schemas exceeding 8-10 fields increase decision complexity during para...”) is wrong — Schema size is constant across cases; it does not explain why accuracy drops only for longer documents.",
        },
        {
          id: "q-ext-mar-40",
          text: "Your extraction pipeline processes invoices and extracts line items, subtotals, tax amounts, and grand totals. During evaluation, you discover that in 18% of extractions, the sum of extracted line item amounts doesn't match the extracted grand total—sometimes due to OCR errors in the source document, sometimes due to extraction mistakes by the model. Downstream accounting systems reject records with mismatched totals. What's the most effective approach to improve extraction reliability?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Extract line items and totals independently, then use a separate validation model to reconcile discrepancies by determining which extracted values are most likely correct." },
            { id: "b", text: "Add few-shot examples demonstrating invoices where extracted line items sum correctly to the stated total, encouraging the model to produce mathematically consistent extractions." },
            { id: "c", text: "Implement post-processing that automatically adjusts line item amounts proportionally when their sum doesn't match the stated total." },
            { id: "d", text: "Add a \"calculated total\" field where the model sums extracted line items alongside a \"stated_total\" field. Flag records for human review when values differ." },
          ],
          correctOptionId: "d",
          explanation: "This preserves both sources of truth and enables reliable validation. Discrepancies can be flagged explicitly, improving accuracy without silently altering financial data. A (“Extract line items and totals independently, then use a separate valid...”) is wrong — This adds complexity and uncertainty—“guessing” which value is correct can introduce errors in financial data. B (“Add few-shot examples demonstrating invoices where extracted line item...”) is wrong — Helpful but insufficient—does not handle OCR errors or real inconsistencies in source documents. C (“Implement post-processing that automatically adjusts line item amounts...”) is wrong — This modifies financial data artificially, which is risky and unacceptable for accounting accuracy.",
        },
      ],
    },
  ];

  for (const cs of extendedChallengeSetsV2) {
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
    // ── Practice Set B: additional synthetic questions per domain ──────────────
    {
      id: "cca-d1b-agentic-orchestration",
      title: "Domain 1 · Agentic Architecture & Orchestration — Practice Set B",
      topic: "Agentic Orchestration",
      xpReward: 80,
      questions: [
        {
          id: "cca-d1b-q1",
          text: "Different MCP tools return timestamps in incompatible formats (Unix epoch, ISO 8601, numeric status codes), confusing the agent's reasoning. Which Agent SDK mechanism best normalizes these before the model sees them?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A PostToolUse hook that transforms tool results into a consistent format before the model processes them" },
            { id: "b", text: "A longer system prompt instructing the model to mentally convert formats" },
            { id: "c", text: "Raising max_tokens so the model has room to reason about formats" },
            { id: "d", text: "Asking each tool's owner to standardize, with no code change on your side" },
          ],
          correctOptionId: "a",
          explanation:
            "PostToolUse hooks intercept tool results for transformation before the model processes them — ideal for normalizing heterogeneous formats (Unix vs ISO 8601 vs numeric codes). Prompt instructions (B) are probabilistic, token limits (C) are irrelevant, and (D) isn't always possible.",
        },
        {
          id: "cca-d1b-q2",
          text: "Policy says refunds above $500 require human approval. Relying on the system prompt, the agent still occasionally issues larger refunds. What gives a deterministic guarantee?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A tool-call interception hook that blocks process_refund above $500 and redirects to human escalation" },
            { id: "b", text: "A stronger system-prompt warning in bold text" },
            { id: "c", text: "Few-shot examples of correctly declining large refunds" },
            { id: "d", text: "Lowering temperature so the model follows the policy more reliably" },
          ],
          correctOptionId: "a",
          explanation:
            "When business rules require guaranteed compliance, use hooks over prompt-based enforcement. A tool-call interception hook can deterministically block policy-violating actions (refunds > $500) and redirect. Prompt warnings, few-shot, and temperature are all probabilistic.",
        },
        {
          id: "cca-d1b-q3",
          text: "Your support agent escalates a case to a human who has no access to the conversation transcript. What should the agent compile to make the handoff effective?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "A link to the raw model logs" },
            { id: "b", text: "A structured handoff summary: customer ID, root-cause analysis, refund amount, and recommended action" },
            { id: "c", text: "Just the customer's last message" },
            { id: "d", text: "A confidence score for the escalation decision" },
          ],
          correctOptionId: "b",
          explanation:
            "Mid-process escalation needs a structured handoff (customer ID, root cause, refund amount, recommended action) because the human agent lacks the conversation transcript. Raw logs, a single message, or a confidence score don't convey the actionable case state.",
        },
        {
          id: "cca-d1b-q4",
          text: "You want to compare two refactoring approaches that both start from the same completed codebase analysis, without re-running the analysis. Which session mechanism fits?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "fork_session to create independent branches from the shared analysis baseline" },
            { id: "b", text: "--resume on the same named session for both approaches sequentially" },
            { id: "c", text: "Start two fresh sessions and re-run the analysis in each" },
            { id: "d", text: "Use /compact to split the session in two" },
          ],
          correctOptionId: "a",
          explanation:
            "fork_session creates independent branches from a shared baseline, ideal for exploring divergent approaches (e.g., two refactoring strategies) without redoing the analysis. Resuming the same session (B) entangles the branches, fresh sessions (C) waste the analysis, and /compact (D) only reduces context.",
        },
        {
          id: "cca-d1b-q5",
          text: "A research coordinator always routes every query through its full pipeline (search → analyze → synthesize → report) even for simple lookups, wasting time. What's the better coordinator design?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have the coordinator analyze query requirements and dynamically select which subagents to invoke" },
            { id: "b", text: "Hard-code the four-stage pipeline but run the stages in parallel" },
            { id: "c", text: "Give every subagent all tools so any one can answer simple queries alone" },
            { id: "d", text: "Skip the coordinator and let subagents call each other directly" },
          ],
          correctOptionId: "a",
          explanation:
            "A good coordinator decomposes the task and dynamically selects which subagents to invoke based on query complexity, rather than always routing through the full pipeline. Parallelizing a fixed pipeline (B) still over-processes, over-provisioning tools (C) invites misuse, and removing the coordinator (D) loses observability and controlled flow.",
        },
        {
          id: "cca-d1b-q6",
          text: "For an automated code review, you want predictable, repeatable coverage of multiple aspects. For an open-ended 'add comprehensive tests to a legacy codebase' task, the right subtasks aren't known up front. How should you choose a decomposition strategy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use prompt chaining (fixed sequential passes) for the predictable review; use dynamic, adaptive decomposition for the open-ended testing task" },
            { id: "b", text: "Use dynamic decomposition for both, since it is always more thorough" },
            { id: "c", text: "Use a single mega-prompt for both to keep everything in one context" },
            { id: "d", text: "Use fixed prompt chaining for both for consistency" },
          ],
          correctOptionId: "a",
          explanation:
            "Match decomposition to the workflow: prompt chaining (fixed sequential steps) suits predictable, multi-aspect reviews; dynamic adaptive decomposition suits open-ended investigation where subtasks emerge from discoveries. Neither pattern fits both cases (B, D), and a single mega-prompt (C) dilutes attention.",
        },
        {
          id: "cca-d1b-q7",
          text: "After a synthesis pass, the coordinator notices the report has gaps in certain subtopics. What is the recommended orchestration response?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Run an iterative refinement loop: re-delegate targeted queries to search/analysis subagents, then re-invoke synthesis until coverage is sufficient" },
            { id: "b", text: "Ship the report as-is and note it may be incomplete" },
            { id: "c", text: "Restart the whole pipeline from scratch with the same query" },
            { id: "d", text: "Increase max_tokens on the synthesis agent and rerun once" },
          ],
          correctOptionId: "a",
          explanation:
            "The coordinator should evaluate synthesis output for gaps and iteratively re-delegate targeted queries, re-invoking synthesis until coverage is sufficient. Shipping gaps (B), a blind full restart (C), or merely raising token limits (D) don't close the specific coverage gaps.",
        },
        {
          id: "cca-d1b-q8",
          text: "Two subagents are assigned overlapping research scope and return largely duplicate findings. What coordinator practice minimizes this duplication?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Partition research scope across subagents (distinct subtopics or source types per agent)" },
            { id: "b", text: "Let both cover everything and deduplicate the merged output afterward" },
            { id: "c", text: "Reduce the number of subagents to one to avoid overlap" },
            { id: "d", text: "Have subagents share memory so they see each other's results live" },
          ],
          correctOptionId: "a",
          explanation:
            "Partitioning scope — assigning distinct subtopics or source types to each subagent — minimizes duplication at the source. Post-hoc dedup (B) wastes work, collapsing to one agent (C) loses parallel coverage, and subagents don't share live memory (D).",
        },
      ],
    },
    {
      id: "cca-d2b-tool-mcp",
      title: "Domain 2 · Tool Design & MCP Integration — Practice Set B",
      topic: "Tool & MCP Design",
      xpReward: 80,
      questions: [
        {
          id: "cca-d2b-q1",
          text: "Your agent frequently misroutes between analyze_content and analyze_document, which have near-identical descriptions. Beyond expanding descriptions, what refactor most directly removes the ambiguity?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Rename and re-scope the tools to eliminate functional overlap (e.g., analyze_content → extract_web_results with a web-specific description)" },
            { id: "b", text: "Keep both names but route by a keyword in the system prompt" },
            { id: "c", text: "Delete analyze_document and force everything through analyze_content" },
            { id: "d", text: "Lower the temperature so the model picks more deterministically" },
          ],
          correctOptionId: "a",
          explanation:
            "Renaming and re-scoping to eliminate overlap (e.g., extract_web_results with a web-specific description) removes the root cause of misrouting. Keyword routing (B) is fragile, deleting a needed capability (C) loses function, and temperature (D) doesn't fix ambiguous descriptions.",
        },
        {
          id: "cca-d2b-q2",
          text: "A generic analyze_document tool tries to do extraction, summarization, and claim-verification, and the agent uses it inconsistently. What's the recommended design move?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Split it into purpose-specific tools with defined I/O contracts (extract_data_points, summarize_content, verify_claim_against_source)" },
            { id: "b", text: "Add a 'mode' string parameter to the single tool" },
            { id: "c", text: "Document the three uses in the system prompt instead of the tool" },
            { id: "d", text: "Force tool_choice to this tool on every call" },
          ],
          correctOptionId: "a",
          explanation:
            "Splitting a generic tool into purpose-specific tools with clear input/output contracts improves selection reliability. A mode flag (B) keeps the overload, prompt documentation (C) doesn't change the tool surface, and forcing the tool (D) doesn't clarify which job it should do.",
        },
        {
          id: "cca-d2b-q3",
          text: "An MCP tool hits a policy violation (the requested action isn't allowed). How should the failure be represented so the agent communicates correctly and doesn't waste retries?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Return a business error with retriable: false and a customer-friendly explanation" },
            { id: "b", text: "Return a transient error so the agent retries automatically" },
            { id: "c", text: "Return isError without any category so the agent decides" },
            { id: "d", text: "Return an empty success result" },
          ],
          correctOptionId: "a",
          explanation:
            "Business-rule violations are non-retryable; returning retriable: false plus a customer-friendly explanation lets the agent communicate appropriately and avoid wasted retries. Marking it transient (B) causes pointless retries, an uncategorized error (C) gives the agent too little, and empty success (D) hides the failure.",
        },
        {
          id: "cca-d2b-q4",
          text: "Agents waste many exploratory tool calls discovering what issue summaries, doc hierarchies, and DB schemas exist. Which MCP feature best exposes these catalogs to reduce that exploration?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "MCP resources, which expose content catalogs the agent can see without exploratory tool calls" },
            { id: "b", text: "More MCP tools, one per catalog item" },
            { id: "c", text: "A bigger system prompt listing everything manually" },
            { id: "d", text: "Forcing tool_choice: \"any\" to make the agent call tools faster" },
          ],
          correctOptionId: "a",
          explanation:
            "MCP resources expose content catalogs (issue summaries, documentation hierarchies, database schemas), giving agents visibility into available data without exploratory tool calls. Tools-per-item (B) explodes the tool set, manual prompt listings (C) go stale, and tool_choice (D) doesn't expose catalogs.",
        },
        {
          id: "cca-d2b-q5",
          text: "Your agent keeps preferring the built-in Grep over a more capable custom MCP code-search tool. What's the most effective fix?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Enhance the MCP tool's description to explain its capabilities and outputs in detail so the agent prefers it when appropriate" },
            { id: "b", text: "Remove Grep from the agent's allowed tools entirely" },
            { id: "c", text: "Rename the MCP tool to 'grep2'" },
            { id: "d", text: "Force tool_choice to the MCP tool on every search" },
          ],
          correctOptionId: "a",
          explanation:
            "Agents pick tools by description; enhancing the MCP tool's description to detail its capabilities/outputs makes the agent prefer it over built-ins like Grep when appropriate. Removing Grep (B) loses a useful tool, renaming (C) doesn't add information, and forcing it always (D) is too blunt.",
        },
        {
          id: "cca-d2b-q6",
          text: "You need standard Jira integration for your agents. Build a custom MCP server or use an existing community one?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use an existing community MCP server for the standard Jira integration; reserve custom servers for team-specific workflows" },
            { id: "b", text: "Always build custom servers for full control" },
            { id: "c", text: "Avoid MCP and call the Jira REST API directly from the system prompt" },
            { id: "d", text: "Build a custom server and never use community servers for security" },
          ],
          correctOptionId: "a",
          explanation:
            "For standard integrations like Jira, prefer existing community MCP servers and reserve custom implementations for team-specific workflows. Always-custom (B, D) wastes effort, and you can't call REST APIs from a prompt (C).",
        },
        {
          id: "cca-d2b-q7",
          text: "You try to use Edit to change a line of code, but the anchor text appears multiple times and Edit can't find a unique match. What's the reliable fallback?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use Read to load the full file, then Write the modified contents" },
            { id: "b", text: "Use Glob to locate the line and edit it" },
            { id: "c", text: "Use Bash sed to force the edit regardless of uniqueness" },
            { id: "d", text: "Use Grep to replace the matching text in place" },
          ],
          correctOptionId: "a",
          explanation:
            "When Edit fails due to non-unique text, Read + Write is the reliable fallback for file modification. Glob (B) finds files by name, Grep (D) searches content (it doesn't edit), and ad-hoc sed (C) is error-prone and not the recommended built-in flow.",
        },
        {
          id: "cca-d2b-q8",
          text: "An enrichment pipeline must always run extract_metadata before any enrichment tools. How do you guarantee metadata extraction happens first?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use forced tool selection (tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"}) to call it first, then process subsequent steps in follow-up turns" },
            { id: "b", text: "Set tool_choice: \"auto\" and hope the model orders correctly" },
            { id: "c", text: "List extract_metadata first in the tools array" },
            { id: "d", text: "Mention the ordering in the system prompt only" },
          ],
          correctOptionId: "a",
          explanation:
            "Forced tool selection guarantees a specific tool (extract_metadata) is called first; subsequent steps proceed in follow-up turns. \"auto\" (B) and prompt-only ordering (D) are probabilistic, and array ordering (C) doesn't force call order.",
        },
      ],
    },
    {
      id: "cca-d3b-claude-code",
      title: "Domain 3 · Claude Code Configuration & Workflows — Practice Set B",
      topic: "Claude Code Workflows",
      xpReward: 80,
      questions: [
        {
          id: "cca-d3b-q1",
          text: "A monorepo's root CLAUDE.md has grown huge, mixing standards for many packages. You want each package to pull in only the standards relevant to it. Which approach keeps CLAUDE.md modular?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use the @import syntax to reference external standards files, including only the relevant ones in each package's CLAUDE.md" },
            { id: "b", text: "Duplicate the full root CLAUDE.md into every package" },
            { id: "c", text: "Delete the root CLAUDE.md and rely on memory" },
            { id: "d", text: "Move everything into a single SKILL.md" },
          ],
          correctOptionId: "a",
          explanation:
            "@import lets CLAUDE.md reference external files so each package includes only relevant standards, keeping configuration modular. Duplication (B) creates drift, deleting (C) loses standards, and one SKILL.md (D) is for on-demand workflows, not always-loaded standards.",
        },
        {
          id: "cca-d3b-q2",
          text: "Sessions behave inconsistently and you suspect the wrong memory files are loaded. Which command verifies which memory/config files are active?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "/memory" },
            { id: "b", text: "/compact" },
            { id: "c", text: "--resume" },
            { id: "d", text: "/clear" },
          ],
          correctOptionId: "a",
          explanation:
            "/memory shows which memory files are loaded, helping diagnose inconsistent behavior across sessions. /compact reduces context, --resume continues a session, and /clear resets — none report loaded memory files.",
        },
        {
          id: "cca-d3b-q3",
          text: "A codebase-analysis skill produces very verbose output that pollutes the main conversation. Which SKILL.md frontmatter option runs it in isolation so only a summary returns?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "context: fork" },
            { id: "b", text: "allowed-tools" },
            { id: "c", text: "argument-hint" },
            { id: "d", text: "model: opus" },
          ],
          correctOptionId: "a",
          explanation:
            "context: fork runs a skill in an isolated sub-agent context, preventing verbose output from polluting the main conversation. allowed-tools restricts tools, argument-hint prompts for parameters, and a model field doesn't isolate context.",
        },
        {
          id: "cca-d3b-q4",
          text: "You want a destructive-cleanup skill to only ever write files, never run shell commands. Which frontmatter field enforces that during skill execution?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "allowed-tools, restricting the skill to file-write operations" },
            { id: "b", text: "context: fork" },
            { id: "c", text: "argument-hint" },
            { id: "d", text: "A note in the skill body asking Claude not to use Bash" },
          ],
          correctOptionId: "a",
          explanation:
            "allowed-tools in skill frontmatter restricts tool access during execution (e.g., limiting to file writes to prevent destructive shell actions). context: fork isolates context, argument-hint prompts for args, and a prose note (D) is not enforced.",
        },
        {
          id: "cca-d3b-q5",
          text: "When does a project benefit from a Skill versus putting the guidance in CLAUDE.md?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Skills for on-demand, task-specific workflows; CLAUDE.md for always-loaded universal standards" },
            { id: "b", text: "Skills for universal standards; CLAUDE.md for one-off tasks" },
            { id: "c", text: "They are interchangeable; use whichever is shorter" },
            { id: "d", text: "Always use skills because CLAUDE.md is deprecated" },
          ],
          correctOptionId: "a",
          explanation:
            "Skills are invoked on demand for task-specific workflows; CLAUDE.md holds always-loaded universal standards. The roles are not interchangeable (C), not reversed (B), and CLAUDE.md is not deprecated (D).",
        },
        {
          id: "cca-d3b-q6",
          text: "You have a single-file bug with a clear stack trace pointing at one function. Plan mode or direct execution?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Direct execution — the change is well-scoped and understood" },
            { id: "b", text: "Plan mode — every change should be planned first" },
            { id: "c", text: "Plan mode — single-file changes are deceptively complex" },
            { id: "d", text: "Neither; ask a human to fix it" },
          ],
          correctOptionId: "a",
          explanation:
            "Direct execution suits simple, well-scoped, well-understood changes like a single-file bug fix with a clear stack trace. Plan mode is for large-scale, multi-approach, architectural work — overkill here.",
        },
        {
          id: "cca-d3b-q7",
          text: "Before implementing a caching layer in an unfamiliar domain, you want Claude to surface considerations you might miss (invalidation strategy, failure modes). Which technique fits?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "The interview pattern — have Claude ask questions to surface considerations before implementing" },
            { id: "b", text: "Immediately generate the full implementation and fix issues later" },
            { id: "c", text: "Lower temperature for a more careful first draft" },
            { id: "d", text: "Provide no context and let Claude infer the design" },
          ],
          correctOptionId: "a",
          explanation:
            "The interview pattern has Claude ask questions to surface design considerations (cache invalidation, failure modes) before implementing in an unfamiliar domain. Jumping to code (B), temperature (C), or withholding context (D) don't surface unknowns proactively.",
        },
        {
          id: "cca-d3b-q8",
          text: "Your CI re-runs a review after each new commit, but it keeps re-posting the same comments. What instruction reduces duplicate feedback?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Include prior review findings in context and instruct Claude to report only new or still-unaddressed issues" },
            { id: "b", text: "Run the review with a fresh, larger model each time" },
            { id: "c", text: "Disable reviews after the first commit" },
            { id: "d", text: "Increase max_tokens so the model writes fewer comments" },
          ],
          correctOptionId: "a",
          explanation:
            "Passing prior findings into context and instructing Claude to report only new or still-unaddressed issues avoids duplicate comments across re-runs. A bigger model (B), disabling reviews (C), or token limits (D) don't address duplication.",
        },
      ],
    },
    {
      id: "cca-d4b-prompt-structured-output",
      title: "Domain 4 · Prompt Engineering & Structured Output — Practice Set B",
      topic: "Prompt & Structured Output",
      xpReward: 80,
      questions: [
        {
          id: "cca-d4b-q1",
          text: "Your extraction schema must categorize documents, but new categories appear over time and some documents are ambiguous. How should you design the category field?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use an enum with an \"other\" + detail-string pattern (and an \"unclear\" value) so new and ambiguous cases are captured without forcing a wrong choice" },
            { id: "b", text: "Use a fixed enum with only the categories known today" },
            { id: "c", text: "Use a free-text string with no enum" },
            { id: "d", text: "Require the model to always pick the closest existing category" },
          ],
          correctOptionId: "a",
          explanation:
            "An enum with \"other\" + detail and an \"unclear\" value handles extensible categories and ambiguity without forcing a wrong selection. A fixed enum (B, D) misclassifies novel/ambiguous cases, and free text (C) loses structure.",
        },
        {
          id: "cca-d4b-q2",
          text: "You enforce output with a strict JSON schema via tool use, yet invoices still come back where line items don't sum to the stated total. Why, and what helps detect it?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Strict schemas eliminate syntax errors but not semantic ones; extract calculated_total alongside stated_total and flag discrepancies" },
            { id: "b", text: "The schema is malformed; rewrite it and the math will be correct" },
            { id: "c", text: "Lower temperature to make arithmetic deterministic" },
            { id: "d", text: "Switch off tool use and parse free text instead" },
          ],
          correctOptionId: "a",
          explanation:
            "Tool-use schemas guarantee syntactic validity, not semantic correctness (e.g., sums). Extracting calculated_total alongside stated_total (and conflict_detected flags) surfaces discrepancies. A schema rewrite (B) or temperature (C) won't enforce arithmetic, and dropping tool use (D) reintroduces syntax errors.",
        },
        {
          id: "cca-d4b-q3",
          text: "An extraction repeatedly fails validation because a required field is simply absent from the source document. Will a retry-with-error-feedback loop fix it?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "No — retries help with format/structural errors, but not when the information is genuinely absent from the source; make the field nullable or route to human review" },
            { id: "b", text: "Yes — retrying always eventually extracts the value" },
            { id: "c", text: "Yes — if you raise the temperature on each retry" },
            { id: "d", text: "Yes — add more required fields to pressure the model" },
          ],
          correctOptionId: "a",
          explanation:
            "Retries are effective for format/structural errors but ineffective when the required information isn't present in the source. The right move is to allow null (optional field) or route to human review, not to keep retrying (B–D), which risks fabrication.",
        },
        {
          id: "cca-d4b-q4",
          text: "When an extraction does fail on a fixable format error, what is the most effective retry strategy?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Send a follow-up request including the original document, the failed extraction, and the specific validation errors for self-correction" },
            { id: "b", text: "Resend the identical prompt unchanged" },
            { id: "c", text: "Truncate the document to make it simpler" },
            { id: "d", text: "Switch models and hope for a better result" },
          ],
          correctOptionId: "a",
          explanation:
            "Retry-with-error-feedback — appending the document, the failed extraction, and the specific validation errors — guides the model toward correction. Resending unchanged (B), truncating (C), or model-swapping (D) don't communicate what to fix.",
        },
        {
          id: "cca-d4b-q5",
          text: "You must process 100 latency-tolerant documents overnight at lower cost, with the ability to identify and resubmit any that fail. Which approach fits, and how do you correlate results?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use the Message Batches API (50% cheaper, up to 24h) and correlate request/response pairs via custom_id, resubmitting only failed ids" },
            { id: "b", text: "Use synchronous calls in a tight loop and rely on response order" },
            { id: "c", text: "Use the batch API but expect multi-turn tool calling within each request" },
            { id: "d", text: "Submit all 100 in one giant prompt" },
          ],
          correctOptionId: "a",
          explanation:
            "Latency-tolerant overnight work fits the Batches API (50% savings, up to 24h, no SLA); custom_id correlates request/response pairs and identifies failures to resubmit. Note batch doesn't support multi-turn tool calling (C). Sync loops (B) and one mega-prompt (D) don't fit the goal.",
        },
        {
          id: "cca-d4b-q6",
          text: "You're about to batch-process 10,000 documents. What reduces costly iterative resubmission?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Refine the prompt on a small sample set first to maximize first-pass success before processing the full volume" },
            { id: "b", text: "Submit all 10,000 immediately and fix problems as they appear" },
            { id: "c", text: "Use the largest model regardless of cost" },
            { id: "d", text: "Disable schema validation to avoid failures" },
          ],
          correctOptionId: "a",
          explanation:
            "Refining the prompt on a sample before processing large volumes maximizes first-pass success and reduces resubmission costs. Blind full submission (B) multiplies failures, model size (C) doesn't fix prompt issues, and disabling validation (D) hides errors.",
        },
        {
          id: "cca-d4b-q7",
          text: "The same Claude session that generated a module is asked to review it and misses subtle bugs. What review architecture catches more issues?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Use a second, independent Claude instance without the generator's reasoning context to review the code" },
            { id: "b", text: "Add 'please review carefully' to the same session" },
            { id: "c", text: "Enable extended thinking in the same session" },
            { id: "d", text: "Re-run the same session twice and diff the outputs" },
          ],
          correctOptionId: "a",
          explanation:
            "A model retains reasoning context from generation and is less likely to question its own decisions; an independent review instance (without that context) catches subtle issues better than self-review instructions or extended thinking in the same session.",
        },
        {
          id: "cca-d4b-q8",
          text: "One review category (style nitpicks) has a high false-positive rate that's eroding trust in the otherwise-accurate categories. What's a reasonable interim action?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Temporarily disable the high false-positive category to restore trust while you improve its prompt and criteria" },
            { id: "b", text: "Keep it on; developers should ignore the bad comments" },
            { id: "c", text: "Disable all review categories until every prompt is perfect" },
            { id: "d", text: "Raise the model's temperature for that category" },
          ],
          correctOptionId: "a",
          explanation:
            "High false-positive categories undermine trust in accurate ones; temporarily disabling the offending category restores trust while you refine its criteria. Leaving it on (B) keeps eroding trust, disabling everything (C) is overkill, and temperature (D) doesn't improve precision.",
        },
      ],
    },
    {
      id: "cca-d5b-context-reliability",
      title: "Domain 5 · Context Management & Reliability — Practice Set B",
      topic: "Context & Reliability",
      xpReward: 80,
      questions: [
        {
          id: "cca-d5b-q1",
          text: "In a long support conversation, progressive summarization keeps blurring exact amounts, dates, and order numbers the customer stated. How do you preserve these critical facts?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Extract transactional facts into a persistent 'case facts' block included in each prompt, outside the summarized history" },
            { id: "b", text: "Summarize more aggressively to save tokens" },
            { id: "c", text: "Stop passing conversation history entirely" },
            { id: "d", text: "Trust the model to remember the numbers" },
          ],
          correctOptionId: "a",
          explanation:
            "A persistent 'case facts' block (amounts, dates, order numbers, statuses) included in every prompt — outside summarized history — protects critical values from being blurred by progressive summarization. More summarization (B) worsens it, dropping history (C) breaks coherence, and relying on memory (D) is unreliable.",
        },
        {
          id: "cca-d5b-q2",
          text: "A get_customer lookup returns two customers matching the provided name. What should the agent do?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Ask the customer for an additional identifier to disambiguate, rather than selecting one heuristically" },
            { id: "b", text: "Pick the most recently active account" },
            { id: "c", text: "Pick the first match returned" },
            { id: "d", text: "Escalate to a human immediately" },
          ],
          correctOptionId: "a",
          explanation:
            "Multiple matches require clarification — request an additional identifier rather than heuristic selection (B, C), which risks acting on the wrong account. Immediate escalation (D) is unnecessary when a simple disambiguating question resolves it.",
        },
        {
          id: "cca-d5b-q3",
          text: "A customer asks for a competitor price match. Your policy only addresses adjustments on your own site and is silent on competitor matching. What's the correct behavior?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Escalate, because the policy is ambiguous/silent on this specific request" },
            { id: "b", text: "Deny it outright since policy doesn't mention it" },
            { id: "c", text: "Approve it to satisfy the customer" },
            { id: "d", text: "Ask the customer to interpret the policy for you" },
          ],
          correctOptionId: "a",
          explanation:
            "Policy gaps/ambiguity are valid escalation triggers — when policy is silent on the specific request (competitor matching), escalate rather than inventing a denial (B) or approval (C). Asking the customer to interpret policy (D) is inappropriate.",
        },
        {
          id: "cca-d5b-q4",
          text: "A synthesis report must make clear which conclusions are solid and which areas lacked sources. What should the synthesis output include?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Coverage annotations indicating which findings are well-supported versus which topic areas have gaps due to unavailable sources" },
            { id: "b", text: "Only the well-supported findings, omitting any mention of gaps" },
            { id: "c", text: "A single overall confidence percentage for the whole report" },
            { id: "d", text: "Raw tool logs appended at the end" },
          ],
          correctOptionId: "a",
          explanation:
            "Synthesis output should carry coverage annotations distinguishing well-supported findings from topic areas with gaps due to unavailable sources. Omitting gaps (B) misleads, a single aggregate score (C) hides where the weaknesses are, and raw logs (D) aren't actionable.",
        },
        {
          id: "cca-d5b-q5",
          text: "During a long, multi-agent exploration you want resilience to crashes so work can resume without re-exploring everything. What design supports this?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Have each agent export structured state to a known location; the coordinator loads a manifest on resume and injects it into agent prompts" },
            { id: "b", text: "Keep all state only in the live conversation context" },
            { id: "c", text: "Raise max_tokens so nothing is forgotten" },
            { id: "d", text: "Restart from scratch after any crash" },
          ],
          correctOptionId: "a",
          explanation:
            "Structured state exports plus a coordinator-loaded manifest enable crash recovery — agents resume from persisted state rather than re-exploring. Live-context-only (B) is lost on crash, token limits (C) don't persist state, and full restarts (D) waste work.",
        },
        {
          id: "cca-d5b-q6",
          text: "An extraction system reports 97% aggregate accuracy, and the team wants to reduce human review. What must you check before trusting that number?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Analyze accuracy by document type and field — aggregate metrics can mask poor performance on specific segments" },
            { id: "b", text: "Nothing; 97% overall is high enough to automate" },
            { id: "c", text: "Only the fields with the highest confidence scores" },
            { id: "d", text: "Re-run extraction at a higher temperature for variety" },
          ],
          correctOptionId: "a",
          explanation:
            "Aggregate accuracy (e.g., 97%) can hide poor performance on specific document types or fields; validate accuracy by segment before reducing human review. Trusting the aggregate (B), cherry-picking high-confidence fields (C), or changing temperature (D) don't reveal segment weaknesses.",
        },
        {
          id: "cca-d5b-q7",
          text: "Two credible sources report different statistics for the same metric. How should the synthesis agent handle the conflict?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Preserve both values with source attribution and annotate the conflict, rather than arbitrarily selecting one" },
            { id: "b", text: "Average the two numbers into one figure" },
            { id: "c", text: "Pick the larger number for impact" },
            { id: "d", text: "Drop both since they disagree" },
          ],
          correctOptionId: "a",
          explanation:
            "Conflicting statistics from credible sources should be annotated with source attribution and both values preserved, letting readers (or the coordinator) judge — not arbitrarily resolved by averaging (B), picking one (C), or discarding (D). Publication dates also help distinguish temporal differences from true contradictions.",
        },
        {
          id: "cca-d5b-q8",
          text: "A research subagent passes findings to synthesis, but source URLs and document names are lost in summarization, breaking citations. What fixes this provenance loss?",
          type: "MCQ" as const,
          options: [
            { id: "a", text: "Require subagents to output structured claim-source mappings (source URL, document name, relevant excerpt) that downstream agents preserve through synthesis" },
            { id: "b", text: "Ask the synthesis agent to guess plausible citations" },
            { id: "c", text: "Summarize harder so the report is shorter" },
            { id: "d", text: "Drop citations to simplify the output" },
          ],
          correctOptionId: "a",
          explanation:
            "Provenance is lost when findings are compressed without claim-source mappings. Requiring structured mappings (URL, document name, excerpt) that downstream agents preserve through synthesis maintains attribution. Guessing citations (B) fabricates, and (C)/(D) discard provenance entirely.",
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

  // Study Plan for the Claude Architect exam (slice 15)
  const studyPlan = await prisma.studyPlan.upsert({
    where: { id: "sp-claude-architect" },
    update: {},
    create: {
      id: "sp-claude-architect",
      examId: exam.id,
      title: "Claude Architect — 4-Week Readiness Path",
      description:
        "A guided, week-by-week path through every Claude Architect challenge set, finishing with a full mock exam at the passing score. Complete each step to build readiness.",
    },
  });

  const studyPlanSteps: {
    id: string;
    order: number;
    title: string;
    type: "CHALLENGE_SET" | "MOCK_SCORE";
    challengeSetId?: string;
    mockScoreThreshold?: number;
    dayOffset: number;
  }[] = [
    { id: "sps-1", order: 1, title: "Customer Support Resolution Agent", type: "CHALLENGE_SET", challengeSetId: "cs-customer-support-agent", dayOffset: 0 },
    { id: "sps-2", order: 2, title: "Code Generation with Claude Code", type: "CHALLENGE_SET", challengeSetId: "cs-claude-code-dev", dayOffset: 2 },
    { id: "sps-3", order: 3, title: "Multi-Agent Research System", type: "CHALLENGE_SET", challengeSetId: "cs-multi-agent-research", dayOffset: 7 },
    { id: "sps-4", order: 4, title: "Claude Code for Continuous Integration", type: "CHALLENGE_SET", challengeSetId: "cs-claude-code-cicd", dayOffset: 9 },
    { id: "sps-5", order: 5, title: "Safety & Responsible AI", type: "CHALLENGE_SET", challengeSetId: "cs-safety-principles", dayOffset: 14 },
    { id: "sps-6", order: 6, title: "Claude Model Capabilities", type: "CHALLENGE_SET", challengeSetId: "cs-model-capabilities", dayOffset: 16 },
    { id: "sps-7", order: 7, title: "Architect Patterns & System Design", type: "CHALLENGE_SET", challengeSetId: "cs-architect-patterns", dayOffset: 18 },
    { id: "sps-8", order: 8, title: `Pass a full mock exam (>= ${exam.passingScore}%)`, type: "MOCK_SCORE", mockScoreThreshold: exam.passingScore, dayOffset: 21 },
  ];

  for (const step of studyPlanSteps) {
    await prisma.studyPlanStep.upsert({
      where: { id: step.id },
      update: {},
      create: { ...step, planId: studyPlan.id },
    });
  }

  console.log(`  Created study plan: ${studyPlan.title} (${studyPlanSteps.length} steps)`);

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
