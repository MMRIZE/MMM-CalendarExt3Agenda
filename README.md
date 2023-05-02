# MMM-CalendarExt3Agenda
Daily agenda view module of MagicMirror

> `1.2.0` has many changes from `1.1.x` and still beta staged. If you want to use the old version, checkout `snap-1.1.5` branch

## Screenshot
<img src="https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CalendarExt3Agenda/CX3A_110.png" width="800">



## Concept

This is a sibling module of `[MMM-CalendarExt3](https://github.com/MMRIZE/MMM-CalendarExt3)`. This module is made to be an alternative to my previous module `MMM-CalendarExt2`, especially `daily`, `current` and `upcoming` views.


## Features
### What's different with `CX2`.
- Only focusing on how it shows; Parsing is delegated to the original MagicMirror module `calendar`. (It means the `calendar` module is REQUIRED to use this module.)
- Respect to original MM's hide/show mechanism. Now you can hide/show this module easily with other scheduler or control modules. (By the way, Look at this module also. - [MMM-Scenes](https://github.com/MMRIZE/MMM-Scenes))
- No dependency on the 3rd party modules (e.g. momentJS or Luxon, etc.). This is built with pure JS and CSS only.

### Relation with `CX3`
- Nothing. It is independent from `MMM-CalendarExt3`. But of course, you can use them together.
<img src="https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CalendarExt3Agenda/preview2.png" width="800">

### Main Features
- locale-aware calendar
- customizing events: filtering, transforming
- multi-instance available. You don't need to copy and rename the module. Just add one more configuration in your `config.js`.


## Install
```sh
cd ~/MagicMirror/modules
git clone https://github.com/MMRIZE/MMM-CalendarExt3Agenda
```

## Update (to `1.2.0`)
```sh
cd ~/MagicMirror/modules/MMM-CalendarExt3Agenda
git pull
npm install
```

When some `submodule` is not updated, try this.
```sh
cd ~/MagicMirror/modules/MMM-CalendarExt3Agenda
git submodule update --init --recursive
```

If you want to return to `1.1.5` version,
```sh
cd ~/MagicMirror/modules/MMM-CalendarExt3Agenda
git checkout dev-1.1.5
```

## Config
Anyway, even this simplest will work.
```js
{
  module: "MMM-CalendarExt3Agenda",
  position: "top_left",
},

```

More conventional;
```js
{
  module: "MMM-CalendarExt3Agenda",
  position: "top_left",
  title: "My Agenda",
  config: {
    instanceId: "basicCalendar",
    locale: 'de-DE',
    firstDayOfWeek: 1,
    startDayIndex: -1,
		endDayIndex: 10,
    calendarSet: ['us_holiday', 'abfall', 'mytest'],
    ...
  }
},
```

You need setup default `calendar` configuration also.
```js
/* default/calendar module configuration */
{
  module: "calendar",
  position: "top_left",
  config: {
    broadcastPastEvents: true, // <= IMPORTANT to see past events
    calendars: [
      {
        url: "webcal://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics",
        name: "us_holiday", // <-- specify calendar name
        color: "skyblue", // <-- if you don't want to get color, just remove this line.
        broadcastPastEvents: true, // <-- need to broadcast past events
        maximalNumberOfDays: 30, // <-- how old events would be broadcasted
        maximumEntries: 100, // <-- assign enough number to prevent truncating new events by old events.
        symbol: 'camera', // <-- when you want to display simbol. If you don't want, just set as `symbol:[],`
      },
      ...

```

### Config details
All the properties are omittable, and if omitted, a default value will be applied.

|**property**|**default**|**description**|
|---|---|---|
|`startDayIndex`| 0 | Begining day of the view from today. `-1` means yesterday. `0` would be today. |
|`endDayIndex` | 10 | Ending day of the view from today. `10` means 10 days after. |
|`locale` | (`language` of MM config) | `de` or `ko-KR` or `ja-Jpan-JP-u-ca-japanese-hc-h12`. It defines how to handle and display your date-time values by the locale. When omitted, the default `language` config value of MM. |
|`calendarSet` | [] | When you want to display only selected calendars, fulfil this array with the targeted calendar name(of the default `calendar` module). <br>e.g) `calendarSet: ['us_holiday', 'office'],`<br> `[]` or `null` will allow all the calendars. |
|`instanceId` | (auto-generated) | When you want more than 1 instance of this module, each instance would need this value to distinguish each other. If you don't assign this property, the `identifier` of the module instance will be assigned automatically but not recommended to use it. (Hard to guess the auto-assigned value.)|
|`firstDayOfWeek`| 1 | Monday is the first day of the week according to the international standard ISO 8601, but in the US, Canada, Japan and some cultures, it's counted as the second day of the week. If you want to start the week from Monday, set this property to `1`. If you want Sunday, set `0`. <br> Sunday:0, Monday:1, Tuesday:2, ..., Saturday:6 <br> **This option is only for using `calendarweek (CW)` showing. That is hidden by default, so you can ignore this.**|
|`minimalDaysOfNewYear` | 4 | ISO 8601 also says **each week's year is the Gregorian year in which the Thursday falls**. The first week of the year, hence, always contains 4 January. However, the US (Yes, it is.) system differs from standards. In the US, **containing 1 January** defines the first week. In that case, set this value to `1`. And under some other culture, you might need to modify this.  <br> **This option is only for using `calendarweek (CW)` showing. That is hidden by default, so you can ignore this.**|
|`cellDateOptions` | {month: 'short', <br>day: 'numeric'} | The format of day cell date. It varies by the `locale` and this option. <br>`locale:'en-US'`, the default displaying will be `Jun 1`. <br> See [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) | 
|`eventTimeOptions` | {timeStyle: 'short'} | The format of event time. It varies by the `locale` and this option. <br> `locale:'en-US'`, the default displaying will be `3:45 pm`.<br> See [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) | 
|`cellDayOptions`|{ <br>'-1': { numeric: 'auto', style: 'long' }, <br>'0': { numeric: 'auto', style: 'long' }, <br>'1': { numeric: 'auto', style: 'long' }, <br>'others': { weekday: 'long' } <br>}| The format of cell title. ... Just leave it. |
|`eventFitler`| callback function | See the `Filtering` part.|
|`eventTransformer`| callback function | See the `Transforming` part.|
|`waitFetch`| 5000 | (ms) waiting the fetching of last calendar to prevent flickering view by too frequent fetching. |
|`refreshInterval`| 1800000 | (ms) refresh view by force if you need it. |
|`animationSpeed` | 1000 | (ms) Refreshing the view smoothly. |
|`useSymbol` | true | Whether to show font-awesome symbold instead of simple dot icon. |
|`eventNotification`| 'CALENDAR_EVENTS' | A carrier notification of event source.|
|`eventPayload` | callback function | A converter for event payload before using it.|
|`useWeather` | true | Whether to show forecasted weather information of default weather module. |
|`weatherLocationName` | null | When you have multi forecasting instances of several locations, you can describe specific weather location to show. |
|`weatherNotification`| 'WEATHER_UPDATED' | A carrier notification of weather forecasting source |
|`weatherPayload` | callback function | A converter for weather foracasting payload before using it. |
|`showMiniMonthCalendar` | true | Show mini monthly calendar of this month. |
|`miniMonthTitleOptions` | { month: 'long', year: 'numeric' } | Title of month calendar (e.g. Aug. 2022) |
|`miniMonthWeekdayOptions` | { weekday: 'short' } | Name of weekday |
|`onlyEventDays` | 0 | `0` or `false` show empty days, `N:Integer bigger than 0` will show `N` days which have event(s) in that day.| 


## Notification
### Incoming Notifications
#### `CALENDAR_EVENTS`
Any module which can emit this notification could become the source of this module. Generally, the default `calendar` module would be.

#### `WEATHER_UPDATED`
Any module which can emit this notification could become the source of weather forecasting. Generally, the default `weather` module would be.

### Outgoing Notification
Nothing yet.  (Does it need?)

## Styling with CSS & DOM Structure
You can handle almost all of the visual things with CSS. See the `MMM-CalendarExt3Agenda.css` and override your needs into your `custom.css`.
- `CX3A`, `CX3A_{instanceId}` : The root selector. Each instance of this module will have `CX3A_{instanceId}` as another root selector. With this CSS selector, you can assign individual look to each instance.


- `.cell` : Every day cell has this selector. Each cell could have these class name together by its condition.
  - `.today`, `.thisMonth`, `.thisYear`
  - `.year_2022`, `.month_12`, `.date_25`, `.weekday_0`, `.week_52`
- `.cellHeader`, `.cellFooter` : Parts of day cell. `.cellHeader` would have `.cellHeaderMain` and `.cellHeaderSub` as children.
  - `.cellHeader`
    - `.cellHeaderMain`
      - `.cellDay`
        - `.dateParts`
      - `.cellDate`
        - `.dateParts`
      - `.cw` (hidden by default)
    - `.cellHeaderSub`
    	- `.cellWeather`
        - `.maxTemp.temperature`
        - `.minTemp.temperature`
        - `.wi`
  - `.cellBody` (events would be located here)
  - `.cellFooter` (currently not used)

- `.cellDay`, `.cellDate` : Displaying date of the cell. The date would have many parts of date/hour information(`.dateParts`).

- `.event` : Every event has this selector. Each event could have these class name together by its condition.
  - `.calendar_{calendarName}`, `{class}` : Orginal `calendar`
  - `.passed`, `.future`, `.current`, 
  - `.multiday`, `.singleday`, `.fullday`

And `event` also has `dataSet` (`data-*`) as its attributes. (e.g. data-title="...", data-start-date="...") You can use these attributes also.

- `.event`
  - `.headline`
    - `.symbol`
    - `.time.startTime`
      - `.dateParts`
    - `.time.endTime`
      - `.dateParts`
    - `.title`
  - `.description`
  - `.location`

Each event component would be shown/hidden by the virtues of events. Of course, you can redeclare its behaviours with CSS.


## Handling Events
Each event object has this structure.
```json
{
  "title": "Leeds United - Chelsea",
  "startDate": 1650193200000,
  "endDate": 1650199500000,
  "fullDayEvent": false,
  "class": "PUBLIC",
  "location": false,
  "geo": false,
  "description": "...",
  "today": false,
  "symbol": ["calendar-alt"],
  "calendarName": "tottenham",
  "color": "gold",
  "calendarSeq": 1, // This would be the order from `calendarSet` of configuration
  "isPassed": true,
  "isCurrent": false,
  "isFuture": false,
  "isFullday": false,
  "isMultiday": false
}
```
You can use these values to handle events.

### Filtering
You can filter each event by its condition.
```js
eventFilter: (ev) => {
  if (ev.isFullday) return false
  return true
}
```
This example shows how you can filter out 'fullday' events.

### Transforming
You can manipulate or change the properties of the event.
```js
eventTransformer: (ev) => {
  if (ev.title.search('John') > -1) ev.color = 'blue'
  return ev
}
```
This example shows how you can transform the color of events when the event title has specific text.


### eventPayload / weatherPayload
You can convert or transform the payload of incoming notification instantly before used in this module. It would be convenient when conversion or manipulating payload from uncompatible module.
```js
weatherPayload: (payload) => {
  if (Array.isArray(payload?.forecastArray)) {
    payload.forecastArray = payload.forecastArray.map((f) => {
      f.maxTemperature = Math.round(f.maxTemperature * 9 / 5 + 32)
      f.minTemperature = Math.round(f.minTemperature * 9 / 5 + 32)
      return f
    })
  }
  return payload
},
```
This example show how to transform Celcius temperature to Fahrenheit units. (Original default weather module has a bug to deliver Fahrenheit temperature of broadcasted forecasts.)


## Tips
- This module needs MM's original default module `calendar` or equivalent module which can parse and broadcast events. This module cannot handle events alone.
- When you want to hide default `calendar` module, just remove `position` of calendar module.
- When you want to show past events, you need to configure `calendar` module to broadcast them.

### Weather forecast
When you are using MM's default `weather` forecasting, weather icon will be displayed on the day cell.
```js
useWeather: true,
weatherLocationName: 'New York',
// Original weather module might have its location name with more details. (e.g. 'New York City, US'), but the partial text included would be acceptable for this attribute.
// When the location name would not match, warning messgage will be shown on dev console. Check it.
```

### Some CSS Tips (in your `custom.css`)
#### miniMonth Calendar Only
```css
.CX3A .agenda {
  display: none;
}
```

#### Show the days only which has event on the day.
```css
.CX3A .agenda .cell[data-events-counts="0"] {
  display: none;
}
```

#### show/hide event description or location
```css
.CX3A .agenda .event .description, 
.CX3A .agenda .event .location {
  display: none;
} /* To All descriptions and locations */

.CX3A .agenda .event.current .description {
  display: inherit;
} /* Show description of currently on-going event */

.CX3A .agenda .event.calendar_Birthday .location {
  display: none;
} /* Hide location of the event in "Birthday" calendar */
```

#### Wrap multi-line event title (example for fullday event)
```css
.CX3A .cellBody .fullday .event .title {
  overflow: unset;
  white-space: unset;
  text-overflow: unset;
} /* You might need additional adjustment... */
```

#### Remove CW from miniMonth 
```css
.CX3A .miniMonth .cw {
  display: none;
}
```

### Compatible with `randomBrainstormer/MMM-GoogleCalendar`
```js
eventTransformer: (e) => {
  e.startDate = new Date(e.start?.date || e.start?.dateTime).valueOf()
  e.endDate = new Date(e.end?.date || e.end?.dateTime).valueOf()
  e.title = e.summary
  e.fulldayEvent = (e.start?.date) ? true : false
  return e
}
```

## Not the bug, but...
- The default `calendar` module cannot emit the exact starting time of `multidays-fullday-event which is passing current moment`. Always it starts from today despite of original event starting time. So this module displays these kinds of multidays-fullday-event weirdly.

## History

### 1.2.0 (2023-04-25)
- **ADDED**: `weatherNotification`, `eventNotification` - To get data from 3rd party module which is not compatible with default modules.
- **ADDED**: `weatherPayload`, `eventPayload` - To manipulate or to convert received payload itself on time. (e.g. Convert Celcius unit to Fahrenheit unit)
- **ADDED**: Hiding day cell which has no event : `onlyEventDays: n`
- **CHANGED** : Display whole month events in `miniCalendar` regardless of agenda showing (despite `endDayIndex` or `onlyEventDays`) 
- **CHANGED**: Shared library to fix many issues.
- **CHANGED**: Timing of `eventFilter` and `eventTransformer` is delayed for better-handling event data after regularized
- **FIXED** : Pooling events with multi-calendar modules' notification
- **FIXED**: position issue (I hope so...)
- **FIXED**: some typo.
- **FIXED**: flickering for many reasons (logic error to treat notifications)


### 1.1.5 (2022-12-05)
- **Added** `useWeather` option. (true/false)
- **Added** `weatherLocationName` option (some partial text to distinguish location)
### 1.1.4 (2022-11-04)
- **Fixed** fix the cal event broadcasr handling (Thanks to @sdetweil)
### 1.1.3 (2022-08-30)
- **Fixed** Urgent fix for `useSymbol` issue since #1.1.1
- **Fixed** `symbol:null` issue resolved
### 1.1.2 (2022-08-29)
- **Fixed** Move `eventFormatter` to prior to get compatibility with other calendar module (e.g GoogleCalendar module)
### 1.1.1 (2022-08-27)
- **ADDED** : allow multi icons and FA brands icon
### 1.1.0 (2022-08-17)
- **ADDED** : miniMonth calendar
- **FIXED** : some minor bugs fixes and code refactoring

### 1.0.0 (2022-07-12)
- Released.

## Author
- Seongnoh Yi (eouia0819@gmail.com)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y56IFLK)
