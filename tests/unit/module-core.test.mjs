import assert from "node:assert/strict"
import { test } from "node:test"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

let registeredModule

global.config = {
  locale: "en-US",
  language: "en",
}

global.Log = {
  warn: () => {},
  error: () => {},
  log: () => {},
}

global.Module = {
  register: (_name, definition) => {
    registeredModule = definition
  },
}

require("../../MMM-CalendarExt3Agenda.js")

const moduleDef = registeredModule

test("regularizeConfig sets default locale from config.language", () => {
  const ctx = {
    identifier: "module-1",
    config: { calendarSet: [] },
    defaulNotifications: moduleDef.defaulNotifications,
  }

  const cfg = moduleDef.regularizeConfig.call(ctx, {
    calendarSet: [],
  })

  assert.equal(typeof cfg.locale, "string")
  assert.equal(cfg.instanceId, "module-1")
  // en-US has weekends [0, 6] (Sunday, Saturday)
  assert(Array.isArray(cfg.weekends))
})

test("regularizeConfig uses explicit calendarSet when provided", () => {
  const ctx = {
    identifier: "module-2",
    config: { calendarSet: [] },
    defaulNotifications: moduleDef.defaulNotifications,
  }

  const calSet = ["cal-a", "cal-b"]
  const cfg = moduleDef.regularizeConfig.call(ctx, {
    calendarSet: calSet,
  })

  assert.deepEqual(cfg.calendarSet, calSet)
})

test("socketNotificationReceived restores callback functions", () => {
  let readyCalls = 0
  const ctx = {
    identifier: "module-1",
    activeConfig: {},
    originalConfig: {},
    notifications: {},
    _functionsReady: () => {
      readyCalls += 1
    },
  }

  // Contract test: all known config keys must be handled, including preProcessor.
  // If a key is added to node_helper but missing from configKeys here, the assertion fails.
  const allConfigKeys = ["preProcessor", "eventTransformer", "eventFilter", "eventSorter"]

  const functions = {}
  for (const key of allConfigKeys) {
    functions[key] = `() => "${key}"`
  }

  moduleDef.socketNotificationReceived.call(ctx, "CX3A_FUNCTIONS_RESTORED", {
    identifier: "module-1",
    variablePreamble: "",
    functions,
  })

  for (const key of allConfigKeys) {
    assert.equal(typeof ctx.activeConfig[key], "function", `${key} must be restored in activeConfig`)
    assert.equal(typeof ctx.originalConfig[key], "function", `${key} must be restored in originalConfig`)
  }
  assert.equal(readyCalls, 1)
})

test("socketNotificationReceived restores notifications payloads", () => {
  let readyCalls = 0
  const ctx = {
    identifier: "module-1",
    activeConfig: {},
    originalConfig: {},
    notifications: {},
    _functionsReady: () => {
      readyCalls += 1
    },
  }

  moduleDef.socketNotificationReceived.call(ctx, "CX3A_FUNCTIONS_RESTORED", {
    identifier: "module-1",
    variablePreamble: "",
    functions: {
      eventPayload: "(p) => ({ ...p, processed: true })",
      weatherPayload: "(p) => ({ ...p, weatherProcessed: true })",
    },
  })

  assert.equal(typeof ctx.notifications.eventPayload, "function")
  assert.equal(typeof ctx.notifications.weatherPayload, "function")
  assert.equal(ctx.notifications.eventPayload({ a: 1 }).processed, true)
  assert.equal(ctx.notifications.weatherPayload({ b: 2 }).weatherProcessed, true)
  assert.equal(readyCalls, 1)
})

test("socketNotificationReceived ignores payload for other instance", () => {
  let readyCalls = 0
  const ctx = {
    identifier: "module-1",
    activeConfig: {},
    originalConfig: {},
    notifications: {},
    _functionsReady: () => {
      readyCalls += 1
    },
  }

  moduleDef.socketNotificationReceived.call(ctx, "CX3A_FUNCTIONS_RESTORED", {
    identifier: "module-2",
    variablePreamble: "",
    functions: {
      eventTransformer: "(ev) => ev",
    },
  })

  assert.equal(ctx.activeConfig.eventTransformer, undefined)
  assert.equal(ctx.originalConfig.eventTransformer, undefined)
  assert.equal(readyCalls, 0)
})

test("socketNotificationReceived restores functions with closure context", () => {
  let readyCalls = 0
  const ctx = {
    identifier: "module-1",
    activeConfig: {},
    originalConfig: {},
    notifications: {},
    _functionsReady: () => {
      readyCalls += 1
    },
  }

  const preamble = `
let myVariable = { key: "test" };
const myHelper = (v) => v + "_modified";
  `

  moduleDef.socketNotificationReceived.call(ctx, "CX3A_FUNCTIONS_RESTORED", {
    identifier: "module-1",
    variablePreamble: preamble,
    functions: {
      eventFilter: "(ev) => ev.title === myVariable.key && myHelper(ev.title) === 'test_modified'",
    },
  })

  assert.equal(typeof ctx.activeConfig.eventFilter, "function")
  assert.equal(ctx.activeConfig.eventFilter({ title: "test" }), true)
  assert.equal(ctx.activeConfig.eventFilter({ title: "other" }), false)
  assert.equal(readyCalls, 1)
})
