/*
	Prompt the Ai Model recieves
*/

package ai

import "fmt"

// buildPrompt returns the user message sent to the model. It instructs the model to
// emit a single JSON object matching scalelab-backend/internal/model.DesignResult
func buildPrompt(userInput string) string {
	return fmt.Sprintf(`You are an expert systems designer. The user describes a system to design (interview-style).

User request:
%q

Respond with ONLY valid JSON (no markdown code fences, no commentary before or after). The JSON must use exactly these top-level keys and nesting:

- "title": string — short name for the design
- "summary": string — 2–4 sentences
- "requirements": array of objects with "name" and "description" (at least 3 items)
- "components": array of objects with "name" and "purpose" (at least 3 items)
- "tradeoffs": array of objects with "decision", "pros" (array of strings), "cons" (array of strings) (at least 1 item)
- "bottlenecks": array of objects with "name" and "description" (at least 2 items)
- "failureModes": array of objects with "name" and "description" (at least 2 items)
- "scalingStrategies": array of objects with "name" and "description" (at least 2 items)

Be concrete and specific to the user's request, but keep each description short (about 1–2 sentences). Brevity is important. Prefer plain ASCII in the JSON unless the user wrote non-ASCII.`, userInput)
}
