import { describe, test, expect } from "vitest";
import dotenv from "dotenv";
import path from "path";
import { generateAssessmentSummary } from "../../src/lib/evaluateAssessment";
import { CompetencyMatrix } from "../../src/lib/matrix/types";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("generateFeedback API Integration Test", () => {
  test("", async () => {
    const transcript = `
================================================================================
TECHNICAL ASSESSMENT - VOICE RECORDING TRANSCRIPT
================================================================================
Session ID:        TA-2024-0417-DN1
Role:              .NET Backend Engineer (Senior)
Primary language:  English
Duration:          00:02:32
Participants:      [ASSESSOR] Maksym H. (Engineering Lead)
                   [CANDIDATE] Andrii K.
Capture quality:   Good.
================================================================================

[00:00:04] ASSESSOR: Okay, I think we're recording now. Andrii, can you hear me
clearly?

[00:00:07] CANDIDATE: Yeah, loud and clear. Good morning.

[00:00:09] ASSESSOR: Morning. So this is going to be about forty minutes, mostly
backend, some architecture, and toward the end I'll throw a small design scenario
at you. Just think out loud, even if you're not sure. There's no penalty for
saying "I don't know."

[00:00:21] CANDIDATE: Sounds good.

[00:00:23] ASSESSOR: Let's warm up. In .NET, what's the difference between a value
type and a reference type, and where do they actually live in memory?

[00:00:31] CANDIDATE: Right, so value types are things like int, struct, enum.
They're copied by value, and typically they live on the stack — though that's not
always true. If a struct is a field on a class, it lives on the heap with the
object. Reference types, like class instances, the variable holds a reference and
the actual object is on the heap.

[00:00:53] ASSESSOR: Good, I like that you caught the "not always on the stack"
part. People get that wrong a lot. What about boxing?

[00:01:01] CANDIDATE: Boxing is when you take a value type and wrap it in an
object so it can be treated as a reference type. So if I do, like, object o = 5,
the integer gets boxed onto the heap. Unboxing is the reverse, and it's an
explicit cast. It has a performance cost because of the allocation, so in hot
paths you try to avoid it — generics help with that.

[00:01:24] ASSESSOR: Perfect. Now let's talk async. Walk me through what actually
happens when you await an async method.

[00:01:32] CANDIDATE: Okay so... the compiler builds a state machine out of the
method. When you hit an await, if the awaited task is not yet complete, the method
returns control to the caller, and a continuation is scheduled to run when the
task completes. So the thread isn't blocked — it can go do other work. When the
awaited operation finishes, the continuation picks up where it left off, and by
default it tries to resume on the captured synchronization context.

[00:02:01] ASSESSOR: And that synchronization context thing — when does that bite
you?

[00:02:05] CANDIDATE: Classic deadlock scenario. If you have, um, in like an old
ASP.NET or WinForms app, and you call .Result or .Wait() on an async method from
the UI thread or a request thread, you block that thread, but the continuation
needs that same context to resume — and it can't because it's blocked. So you get
a deadlock. The fix is async all the way down, or ConfigureAwait(false) on library
code.

[00:02:28] CANDIDATE: Thanks, this was a good conversation. Have a good one.

[00:02:31] ASSESSOR: You too. Stopping the recording.
      `;
    const matrix: CompetencyMatrix = {
      topics: [
        { topicName: "Programming Language", genericDescription: "" },
        { topicName: "Runtime & Framework", genericDescription: "" },
      ],
      stacks: [
        {
          stackName: ".NET",
          topics: [
            {
              topicName: "Programming Language",
              technologyDescription:
                "C# classes, structs, interfaces, delegates, async/await, generics, LINQ, exception handling",
            },
            {
              topicName: "Runtime & Framework",
              technologyDescription:
                "Runtime & Framework in .NET, Web API, ASP.NET Core, EF Core, LINQ",
            },
          ],
        },
      ],
    };
    const skillLevels = [
      {
        score: 1,
        label: "Beginner",
        description: "Not able to understand the concepts",
        example: "The candidate is not able to explain the basic concepts.",
        criteria:
          "Score should be 1 if candidate is not able to explain the basic concepts.",
      },
      {
        score: 2,
        label: "Middle",
        description: "Able to understand the concepts",
        example: "The candidate is able to explain the basic concepts.",
        criteria:
          "Score should be 2 if candidate is able to explain the basic concepts.",
      },
      {
        score: 3,
        label: "Senior",
        description: "Able to understand the concepts",
        example: "The candidate is able to explain the basic concepts.",
        criteria:
          "Score should be 3 if candidate is able to explain the basic concepts.",
      },
    ];
    const result = await generateAssessmentSummary(
      transcript,
      matrix,
      skillLevels,
    );

    expect(result).toBeDefined();
  }, 30000);
});
