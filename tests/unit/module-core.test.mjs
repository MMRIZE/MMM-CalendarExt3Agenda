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
