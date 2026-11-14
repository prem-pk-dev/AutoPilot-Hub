import { putRecord } from "./storage.js";

const MAX_STEPS = 10;
const MAX_INPUT_LENGTH = 5000;
const WAIT_LIMIT_MS = 10000;

function textValue(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? "");
}

function resolveInput(config, previous) {
  const raw = typeof config.input === "string" ? config.input : "";
  return raw.includes("{{previous}}") ? raw.replaceAll("{{previous}}", textValue(previous)) : (raw || textValue(previous));
}

function validateSteps(steps) {
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > MAX_STEPS) {
    throw new Error("A workflow must contain between 1 and 10 steps before it can run.");
  }
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step || !["text_transform", "json_validate", "wait", "timestamp"].includes(step.type)) {
      throw new Error("Step " + (i + 1) + " uses an unsupported action.");
    }
    const config = step.config || {};
    if (step.type === "text_transform") {
      if (!["uppercase", "lowercase", "trim", "replace"].includes(config.operation)) {
        throw new Error("Step " + (i + 1) + " has an invalid text operation.");
      }
      if (typeof config.input !== "string" || config.input.length > MAX_INPUT_LENGTH) {
        throw new Error("Step " + (i + 1) + " input must be text up to 5,000 characters.");
      }
      if (config.operation === "replace" && (typeof config.find !== "string" || !config.find)) {
        throw new Error("Step " + (i + 1) + " needs text to find for the replace operation.");
      }
    }
    if (step.type === "json_validate" && (typeof config.input !== "string" || config.input.length > MAX_INPUT_LENGTH)) {
      throw new Error("Step " + (i + 1) + " JSON input must be text up to 5,000 characters.");
    }
    if (step.type === "wait" && (!Number.isInteger(config.durationMs) || config.durationMs < 100 || config.durationMs > WAIT_LIMIT_MS)) {
      throw new Error("Step " + (i + 1) + " wait must be between 100 and 10,000 milliseconds.");
    }
  }
}

async function executeStep(step, previous) {
  const config = step.config || {};
  if (step.type === "text_transform") {
    const input = resolveInput(config, previous);
    switch (config.operation) {
      case "uppercase": return input.toUpperCase();
      case "lowercase": return input.toLowerCase();
      case "trim": return input.trim();
      case "replace": return input.split(config.find).join(config.replaceWith || "");
      default: throw new Error("Unsupported text operation.");
    }
  }
  if (step.type === "json_validate") {
    const input = resolveInput(config, previous);
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
  }
  if (step.type === "wait") {
    await new Promise(resolve => window.setTimeout(resolve, config.durationMs));
    return "Waited " + config.durationMs + " ms";
  }
  if (step.type === "timestamp") return new Date().toISOString();
  throw new Error("Unsupported workflow action.");
}

export async function runWorkflow(workflow) {
  if (!workflow || typeof workflow.id !== "string" || typeof workflow.name !== "string") {
    throw new Error("This workflow record is invalid.");
  }
  validateSteps(workflow.steps);
  const startedAt = new Date().toISOString();
  const execution = {
    id: crypto.randomUUID(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    trigger: "manual",
    runtime: "browser-local",
    status: "running",
    createdAt: startedAt,
    startedAt,
    completedAt: null,
    durationMs: null,
    steps: [],
    output: ""
  };
  await putRecord("executions", execution);
  let previous = "";
  try {
    for (let index = 0; index < workflow.steps.length; index++) {
      const definition = workflow.steps[index];
      const stepStarted = Date.now();
      const result = {
        id: definition.id || "step-" + (index + 1),
        type: definition.type,
        label: definition.label || definition.type,
        status: "running",
        startedAt: new Date(stepStarted).toISOString(),
        completedAt: null,
        durationMs: null,
        output: "",
        error: null
      };
      execution.steps.push(result);
      await putRecord("executions", execution);
      try {
        const output = await executeStep(definition, previous);
        previous = output;
        result.output = textValue(output).slice(0, MAX_INPUT_LENGTH * 2);
        result.status = "succeeded";
        result.completedAt = new Date().toISOString();
        result.durationMs = Date.now() - stepStarted;
        execution.output = result.output;
        await putRecord("executions", execution);
      } catch (error) {
        result.status = "failed";
        result.error = error.message || "Step failed.";
        result.completedAt = new Date().toISOString();
        result.durationMs = Date.now() - stepStarted;
        throw new Error("Step " + (index + 1) + " (" + result.label + ") failed: " + result.error);
      }
    }
    execution.status = "succeeded";
  } catch (error) {
    execution.status = "failed";
    execution.error = error.message || "Workflow failed.";
  }
  execution.completedAt = new Date().toISOString();
  execution.durationMs = new Date(execution.completedAt).getTime() - new Date(startedAt).getTime();
  await putRecord("executions", execution);
  return execution;
}
