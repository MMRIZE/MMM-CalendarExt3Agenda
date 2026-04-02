const config = {
  address: "0.0.0.0",
  ipWhitelist: [],
  logLevel: ["INFO", "LOG", "WARN", "ERROR", "DEBUG"],
  modules: [
    {
      module: "clock",
      position: "top_right"
    },
    {
      module: "calendar",
      position: "top_left",
      config: {
        calendars: [
          {
            name: "Public Holidays Germany",
            url: "https://www.calendarlabs.com/ical-calendar/ics/76/Germany_Holidays.ics",
            color: "#4CAF50"
          },
          {
            name: "US Holidays",
            url: "https://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics",
            color: "#2196F3"
          }
        ],
        showSymbol: true
      }
    },
    {
      module: "MMM-CalendarExt3Agenda",
      position: "bottom_center",
      config: {
        // Show the next 14 days
        startDayIndex: 0,
        endDayIndex: 14,

        // Only show days that actually have events
        onlyEventDays: 7,

        // Test: eventTransformer restores correctly after MM v2.35.0 (functions stripped from JSON config).
        // If this works, ALL event titles will be prefixed with "✅ ".
        // Without the fix they show up without prefix.
        eventTransformer: (ev) => {
          ev.title = "✅ " + ev.title
          return ev
        },

        // Test: eventFilter restores correctly
        eventFilter: (ev) => {
          // Hide events that are more than 30 days in the future
          return ev.startDate < Date.now() + 30 * 24 * 60 * 60 * 1000
        },

        showMiniMonthCalendar: true,
        useSymbol: true,
        animationSpeed: 1000,
        waitFetch: 3000,
        refreshInterval: 1000 * 60 * 30
      }
    }
  ]
}

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config
}
