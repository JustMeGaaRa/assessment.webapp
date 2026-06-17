import { describe, test, expect } from "vitest";
import { evaluateAssessment } from "../../../../lib/agents/evaluate-assessment/agent";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

describe("evaluateAssessment", () => {
  test("default flow", async () => {
    const matrix = {
      topics: [
        { topicName: "Programming Language" },
        { topicName: "Runtime & Framework" },
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
        label: "Bad",
        description: "Bad",
        example: "Bad",
        criteria: "Bad",
      },
      {
        score: 2,
        label: "Bad",
        description: "Bad",
        example: "Bad",
        criteria: "Bad",
      },
      {
        score: 3,
        label: "Bad",
        description: "Bad",
        example: "Bad",
        criteria: "Bad",
      },
    ];
    const summary = {
      topics: [
        {
          summary: "Note 1",
          fullyAnswered: ["Note 1"],
          partiallyAnswered: ["Note 1"],
          notAnswered: ["Note 1"],
        },
        {
          summary: "Note 1",
          fullyAnswered: ["Note 1"],
          partiallyAnswered: ["Note 1"],
          notAnswered: ["Note 1"],
        },
        {
          summary: "Note 1",
          fullyAnswered: ["Note 1"],
          partiallyAnswered: ["Note 1"],
          notAnswered: ["Note 1"],
        },
      ],
    };
    const result = await evaluateAssessment(matrix, skillLevels, summary);

    expect(result).toBeDefined();
  });
});
