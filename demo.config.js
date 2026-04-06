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
      position: "top_center",
      config: {
        calendars: [
          {
            name: "Demo Calendar",
            url: "http://localhost:8080/modules/MMM-CalendarExt3Agenda/demo.ics",
            color: "#4CAF50"
          },
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
        showSymbol: true,
        broadcastPastEvents: true,
        maximalNumberOfDays: 60,
        maximumEntries: 50
      }
    },
    {
      module: "MMM-CalendarExt3Agenda",
      position: "bottom_left",
      header: "showMultidayEventsOnce: false (default)",
      config: {
        instanceId: "demo-default",
        startDayIndex: 0,
        endDayIndex: 21,
        onlyEventDays: 7,
        showMultidayEventsOnce: false,
        // Test displayRepeatingCountTitle: full-day event titles don't get clipped
        displayRepeatingCountTitle: true,
        // Append anniversary count to yearly events to demo displayRepeatingCountTitle
        eventTransformer: (ev) => {
          if (ev.recurringEvent && ev.firstYear) {
            const years = new Date().getFullYear() - ev.firstYear
            if (years > 0) ev.title = ev.title + " (" + years + ")"
          }
          return ev
        },
        eventFilter: (ev) => ev.startDate < Date.now() + 60 * 24 * 60 * 60 * 1000,
        showMiniMonthCalendar: true,
        useSymbol: true,
        animationSpeed: 1000,
        waitFetch: 3000,
        refreshInterval: 1000 * 60 * 30
      }
    },
    {
      module: "MMM-CalendarExt3Agenda",
      position: "bottom_right",
      header: "showMultidayEventsOnce: true",
      config: {
        instanceId: "demo-once",
        startDayIndex: 0,
        endDayIndex: 21,
        onlyEventDays: 7,
        // Test showMultidayEventsOnce: multiday events appear only on their first day
        showMultidayEventsOnce: true,
        multidayRangeLabelOptions: { month: "short", day: "numeric" },
        displayRepeatingCountTitle: true,
        eventTransformer: (ev) => {
          if (ev.recurringEvent && ev.firstYear) {
            const years = new Date().getFullYear() - ev.firstYear
            if (years > 0) ev.title = ev.title + " (" + years + ")"
          }
          return ev
        },
        eventFilter: (ev) => ev.startDate < Date.now() + 60 * 24 * 60 * 60 * 1000,
        showMiniMonthCalendar: false,
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
