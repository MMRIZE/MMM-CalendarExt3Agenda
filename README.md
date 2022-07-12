# MMM-CalendarExt3Agenda
Daily agenda view module of MagicMirror

## Screenshot
<img src="https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CalendarExt3Agenda/preview1.png" width="800">



## Concept

This is a sibling module of `[MMM-CalendarExt3](https://github.com/MMRIZE/MMM-CalendarExt3)`. This module is made to being an alternative of my previous module `MMM-CalendarExt2`, especially `daily`, `current` and `upcoming` views.


## Features
### What's different with `CX2`.
- Only focusing on how it shows; Parsing is delegated to original MagicMirror module `calendar`. (It means the `calendar` module is REQUIRED to use this module.)
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
|`cellDayOptions`|{<br>
      '-1': { numeric: 'auto', style: 'long' },<br>
      '0': { numeric: 'auto', style: 'long' },<br>
      '1': { numeric: 'auto', style: 'long' },<br>
      'others': { weekday: 'long' }<br>
    }| The format of cell title. ... Just leave it. |
|`eventFitler`| callback function | See the `Filtering` part.|
|`eventTransformer`| callback function | See the `Transforming` part.|
|`waitFetch`| 5000 | (ms) waiting the fetching of last calendar to prevent flickering view by too frequent fetching. |
|`refreshInterval`| 1800000 | (ms) refresh view by force if you need it. |
|`animationSpeed` | 1000 | (ms) Refreshing the view smoothly. |
|`useSymbol` | true | Whether to show font-awesome symbold instead of simple dot icon. |
|`useWeather` | true | Whether to show forecasted weather information of default weather module. |
|`weatherLocationName` | null | When you have multi forecasting instances of several locations, you can describe specific weather location to show. |
## Notification
### Incoming Notifications
#### `CALENDAR_EVENTS`
Any module which can emit this notification could become the source of this module. Generally, the default `calendar` module would be.

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
      -`.cellWeather`
        -`.maxTemp.temperature`
        -`.minTemp.temperature`
        -`.wi`
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
    -`.symbol`
    -`.time.startTime`
      - `.dateParts`
    -`.time.endTime`
      - `.dateParts`
    -`.title`
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

## Tips
- This module needs MM's original default module `calendar` or equivalent module which can parse and broadcast events. This module cannot handle events alone.
- When you want to hide default `calendar` module, just remove `position` of calendar module.
- When you want to show past events, you need to configure `calendar` module to broadcast them.


## Not the bug, but...
- The default `calendar` module cannot emit the exact starting time of `multidays-fullday-event which is passing current moment`. Always it starts from today despite of original event starting time. So this module displays these kinds of multidays-fullday-event weirdly.

## History

### 1.0.0 (2022-07-12)
- Released.

## Author
- Seongnoh Yi (eouia0819@gmail.com)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y56IFLK)