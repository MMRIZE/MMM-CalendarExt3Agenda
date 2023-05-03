/* global Module */

Module.register('MMM-CalendarExt3Agenda', {
  defaults: {
    locale: null, // 'de' or 'en-US' or prefer array like ['en-CA', 'en-US', 'en']
    calendarSet: [],
    startDayIndex: 0,
    endDayIndex: 10,
    onlyEventDays: 0, // 0: show all days regardless of events, n: show only n days which have events.
    instanceId: null,
    firstDayOfWeek: 1, // 0: Sunday, 1: Monday
    minimalDaysOfNewYear: 4, // When the first week of new year starts in your country.
    cellDayOptions: {
      '-1': { numeric: 'auto', style: 'long' },
      '0': { numeric: 'auto', style: 'long' },
      '1': { numeric: 'auto', style: 'long' },
      'others': { weekday: 'long' }
    },
    cellDateOptions: {
      month: 'short',
      day: 'numeric'
    },
    eventTimeOptions: {
      timeStyle: 'short'
    },
    eventFilter: (ev) => { return true },
    eventTransformer: (ev) => { return ev },
    refreshInterval: 1000 * 60 * 30,
    waitFetch: 1000 *  5,
    animationSpeed: 1000,
    useSymbol: true,
    useWeather: true,
    weatherLocationName: null,
    showMiniMonthCalendar: true,
    miniMonthTitleOptions: {
      month: 'long',
      year: 'numeric'
    },
    miniMonthWeekdayOptions: {
      weekday: 'short'
    },

    //notification: 'CALENDAR_EVENTS',

    weatherNotification: 'WEATHER_UPDATED',
    weatherPayload: (payload) => { return payload },
    eventNotification: 'CALENDAR_EVENTS',
    eventPayload: (payload) => { return payload },
  },

  defaulNotifications: {
    weatherNotification: 'WEATHER_UPDATED',
    weatherPayload: (payload) => { return payload },
    eventNotification: 'CALENDAR_EVENTS',
    eventPayload: (payload) => { return payload },
  },

  getStyles: function () {
    return ['MMM-CalendarExt3Agenda.css']
  },

  getMoment: function() {
    return new Date()
  },

  start: function() {
    this.storedEvents = []
    this.forecast = []
    this.instanceId = this.config.instanceId ?? this.identifier
    this.locale = Intl.getCanonicalLocales(this.config.locale ?? config.language )?.[0] ?? ''
    this.forecast = []

    this.refreshTimer = null
    this.activeConfig = {...this.config}
    this.eventPool = new Map()


    this.notifications = {
      weatherNotification: this.config.weatherNotification ?? this.defaulNotifications.weatherNotification,
      weatherPayload: (typeof this.config.weatherPayload === 'function') ? this.config.weatherPayload : this.defaulNotifications.weatherPayload,
      eventNotification: this.config.eventNotification ?? this.defaulNotifications.eventNotification,
      eventPayload: (typeof this.config.eventPayload === 'function') ? this.config.eventPayload : this.defaulNotifications.eventPayload,
    }

    this._ready = false

    let _moduleLoaded = new Promise((resolve, reject) => {
      import('/' + this.file('CX3_Shared/CX3_shared.mjs')).then((m) => {
        this.library = m
        this.library.initModule(this, config.language)
        resolve()
      }).catch((err) => {
        console.error(err)
        reject(err)
      })
    })

    let _firstData = new Promise((resolve, reject) => {
      this._receiveFirstData = resolve
    })

    let _firstFetched = new Promise((resolve, reject) => {
      this._firstDataFetched = resolve
    })

    let _domCreated = new Promise((resolve, reject) => {
      this._domReady = resolve
    })

    Promise.allSettled([_moduleLoaded, _firstData, _domCreated]).then ((result) => {
      this._ready = true
      this.library.prepareMagic()
      let {payload, sender} = result[1].value
      this.fetch(payload, sender)
      this._firstDataFetched()
    })

    Promise.allSettled([_firstFetched]).then (() => {
      setTimeout(() => {
        this.updateDom(this.config.animationSpeed)
      }, this.config.waitFetch)
      
    })
  },


  fetch: function(payload, sender) {
    this.storedEvents = this.library.regularizeEvents({
      storedEvents: this.storedEvents,
      eventPool: this.eventPool,
      payload,
      sender,
      config: this.config
    })
  },
  
  notificationReceived: function(notification, payload, sender) {
    if (notification === this.notifications.eventNotification) {
      let convertedPayload = this.notifications.eventPayload(payload)
      if (this?.storedEvents?.length == 0 && payload.length > 0) {
        this._receiveFirstData({payload: convertedPayload, sender})
      }
      if (this?.library?.loaded) {
        this.fetch(convertedPayload, sender)  
      } else {
        Log.warn('[CX3A] Module is not prepared yet, wait a while.')
      }
    }

    if (notification === 'DOM_OBJECTS_CREATED') {
      this._domReady()
    }

    if (notification === this.notifications.weatherNotification) {
      let convertedPayload = this.notifications.weatherPayload(payload)
      if (
        (this.config.useWeather 
          && ((this.config.weatherLocationName && convertedPayload.locationName.includes(this.config.weatherLocationName)) 
          || !this.config.weatherLocationName))
        && (Array.isArray(convertedPayload?.forecastArray) && convertedPayload?.forecastArray.length)
      ) {
        this.forecast = [...convertedPayload.forecastArray].map((o) => {
          let d = new Date(o.date)
          o.dateId = d.toLocaleDateString('en-CA')
          return o
        })
      } else {
        if (this.config.weatherLocationName && !convertedPayload.locationName.includes(this.config.weatherLocationName)) {
          Log.warn(`"weatherLocationName: '${this.config.weatherLocationName}'" doesn't match with location of weather module ('${convertedPayload.locationName}')`)
        }
      }
    }
  },

  getDom: function() {
    let dom = document.createElement('div')
    dom.innerHTML = ""
    dom.classList.add('bodice', 'CX3A_' + this.instanceId, 'CX3A')
    if (this.config.fontSize) dom.style.setProperty('--fontsize', this.config.fontSize)
    dom.style.setProperty('--eventheight', this.config.eventHeight)
    dom = this.draw(dom, this.config)
    if (this.library?.loaded) {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }
      this.refreshTimer = setTimeout(() => {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
        this.updateDom(this.config.animationSpeed)
      }, this.config.refreshInterval)
    } else {
      Log.warn('[CX3] Module is not prepared yet, wait a while.')
    }
    return dom
  },

  draw: function (dom, options) {
    if (!this.library?.loaded) return dom
    const {
      isToday, isThisMonth, isThisYear, getWeekNo, makeWeatherDOM, 
      getRelativeDate, prepareEvents, getBeginOfWeek, getEndOfWeek,
      gapFromToday, renderEventAgenda, eventsByDate
    } = this.library
    dom.innerHTML = ''

    const makeCellDom = (d, seq, options) => {
      let tm = new Date(d.valueOf())
      let cell = document.createElement('div')
      cell.classList.add('cell')
      if (isToday(tm)) cell.classList.add('today')
      if (isThisMonth(tm)) cell.classList.add('thisMonth')
      if (isThisYear(tm)) cell.classList.add('thisYear')
      cell.classList.add(
        'year_' + tm.getFullYear(),
        'month_' + (tm.getMonth() + 1),
        'date_' + tm.getDate(),
        'weekday_' + tm.getDay(),
        'seq_' + seq,
        'week_' + getWeekNo(tm, options)
      )
      
      let h = document.createElement('div')
      h.classList.add('cellHeader')

      let m = document.createElement('div')
      m.classList.add('cellHeaderMain')

      let dayDom = document.createElement('div')
      dayDom.classList.add('cellDay')
      let gap = gapFromToday(tm, options)
      let rParts = (Object.keys(options.cellDayOptions).includes(String(gap))) 
        ? (new Intl.RelativeTimeFormat(this.locale, options.cellDayOptions[String(gap)])).formatToParts(gap, 'day') 
        : (new Intl.DateTimeFormat(this.locale, options.cellDayOptions?.['rest'] ?? {weekday: 'long'})).formatToParts(tm)
      dayDom.innerHTML = rParts.reduce((prev, cur, curIndex) => {
        prev = prev + `<span class="dateParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      m.appendChild(dayDom)

      let dateDom = document.createElement('div')
      dateDom.classList.add('cellDate')
      let dParts = new Intl.DateTimeFormat(this.locale, options.cellDateOptions).formatToParts(tm)
      dateDom.innerHTML = dParts.reduce((prev, cur, curIndex) => {
        prev = prev + `<span class="dateParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      m.appendChild(dateDom)


      let cwDom = document.createElement('div')
      cwDom.innerHTML = String(getWeekNo(tm, options))
      cwDom.classList.add('cw')
      m.appendChild(cwDom)
      h.appendChild(m)

      let s = document.createElement('div')
      s.classList.add('cellHeaderSub')

      let forecasted = this.forecast.find((e) => {
        return (tm.toLocaleDateString('en-CA') === e.dateId)
      })

      makeWeatherDOM(s, forecasted)

      h.appendChild(s)

      let b = document.createElement('div')
      b.classList.add('cellBody')

      let f = document.createElement('div')
      f.classList.add('cellFooter')

      cell.appendChild(h)
      cell.appendChild(b)
      cell.appendChild(f)
      return cell
    }

    let moment = this.getMoment()

    let boc = getRelativeDate(moment, options.startDayIndex)
    let eoc = getRelativeDate(moment, options.endDayIndex)

    let tboc = boc.getTime()
    let teoc = eoc.getTime()

    let events = []
    let dateIndex = []  
    if (options.onlyEventDays) {
      let ebd = eventsByDate({
        storedEvents: this.storedEvents,
        config: config,
        startTime: tboc,
        dayCounts: options.onlyEventDays
      })
      dateIndex = ebd.map((e) => e.date)
      events = [...ebd.reduce((reduced, cur) => {
        for (const e of cur.events) {
          reduced.add(e)
        }
        return reduced
      }, new Set())]
    } else {
      events = prepareEvents({
        storedEvents: this.storedEvents,
        config: options,
        range: [tboc, teoc]
      })
      for (let i = options.startDayIndex; i <= options.endDayIndex; i++) {
        dateIndex.push(getRelativeDate(moment, i).getTime())
      }
    }
    
    //events = (typeof options.eventTransformer === 'function') ? events.map(options.eventTransformer) : events
    let cm = new Date(moment.getFullYear(), moment.getMonth(), moment.getDate())

    const drawMiniMonth = (dom, cm, events = [], options) => {
      if (!options.showMiniMonthCalendar || !this.library.loaded) return dom

      let bwoc = getBeginOfWeek(new Date(cm.getFullYear(), cm.getMonth(), 1), options)
      let ewoc = getBeginOfWeek(new Date(cm.getFullYear(), cm.getMonth() + 1, 0), options)

      let im = new Date(bwoc.getTime())
      let today = new Date()

      let view = document.createElement('table')
      view.classList.add('miniMonth')
      let caption = document.createElement('caption')
      caption.innerHTML = new Intl.DateTimeFormat(this.locale, options.miniMonthTitleOptions).formatToParts(cm).reduce((prev, cur, curIndex, arr) => {
        prev = prev + `<span class="calendarTimeParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      view.appendChild(caption)
      let head = document.createElement('thead')
      let weekname = document.createElement('tr')
      let cwh = document.createElement('th')
      cwh.classList.add('cw', 'cell')
      cwh.innerHTML = 'CW'
      weekname.appendChild(cwh)

      let wm = new Date(im.getTime())
      for (let i = 1; i <= 7; i++) {
        let wn = document.createElement('th')
        wn.innerHTML = new Intl.DateTimeFormat(this.locale, options.miniMonthWeekdayOptions).format(wm)
        wn.classList.add(
          'cell',
          'weekname',
          'weekday_' + wm.getDay()
        )
        wn.scope = 'col'
        weekname.appendChild(wn)
        wm.setDate(wm.getDate() + 1)
      }
      head.appendChild(weekname)
      view.appendChild(head)
      
      let body = document.createElement('tbody')
      while(im.getTime() <= ewoc.getTime()) {
        let weekline = document.createElement('tr')
        let cw = getWeekNo(im, options)
        let cwc = document.createElement('td')
        let thisWeek = (im.getTime() === getBeginOfWeek(new Date(), options).getTime()) ? ['thisWeek'] : []
        cwc.classList.add('cw', 'cell')
        cwc.scope = 'row'
        cwc.innerHTML = cw
        weekline.classList.add('weeks', 'week_' + cw, ...thisWeek)
        weekline.appendChild(cwc)
        let dm = new Date(im.getTime())
        for (let i = 1; i <= 7; i++) {
          let dc = document.createElement('td')
          dc.classList.add(
            'cell', 
            'day_' + dm.getDate(),
            'month_' + dm.getMonth() + 1,
            'year_' + dm.getFullYear(),
            'weekday_' + dm.getDay(),
            (dm.getFullYear() === today.getFullYear()) ? 'thisYear' : null,
            (dm.getMonth() === today.getMonth()) ? 'thisMonth' : null,
            ...thisWeek,
            (dm.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) ? 'today' : null
          )
          let content = document.createElement('div')
          content.classList.add('dayContent')

          let date = document.createElement('div')
          date.classList.add('date')
          date.innerHTML = dm.getDate()
          let evs = document.createElement('div')
          evs.classList.add('events')
          let edm = new Date(dm.getFullYear(), dm.getMonth(), dm.getDate(), 23, 59, 59, 999)
          events.filter((ev) => {
            return !(+(ev.endDate) <= dm.getTime() || +(ev.startDate) >= edm.getTime())
          }).sort((a, b) => {
            return ((a.endDate - a.startDate) === (b.endDate - b.startDate)) 
              ? (a.startDate === b.startDate) ? a.endDate - b.endDate : a.startDate - b.startDate
              : (b.endDate - b.startDate) - (a.endDate - a.startDate)
          }).forEach((ev) => {
            let dot = document.createElement('div')
            dot.classList.add('eventDot')
            dot.style.setProperty('--calendarColor', ev.color)
            dot.innerHTML = '⬤'
            evs.appendChild(dot)
          })
          content.appendChild(date)
          content.appendChild(evs)
          dc.appendChild(content)
          weekline.appendChild(dc)
          dm.setDate(dm.getDate() + 1)
        }

        body.appendChild(weekline)
        im.setDate(im.getDate() + 7)
      }
      view.appendChild((body))
      dom.appendChild(view)
      return dom
    }

    let mEvents = prepareEvents({
      storedEvents: this.storedEvents,
      config: options,
      range: [
        new Date(moment.getFullYear(), moment.getMonth(), 1).getTime(),
        new Date(moment.getFullYear(), moment.getMonth() + 1, 0).getTime()
      ]
    })

    dom = drawMiniMonth(dom, cm, mEvents, options)

    let agenda = document.createElement('div')
    agenda.classList.add('agenda')

    dateIndex = dateIndex.sort((a, b) => a - b)
    for (const [i, date] of dateIndex.entries()) {
      //let tm = new Date(cm.getFullYear(), cm.getMonth(), cm.getDate() + i)
      let tm = new Date(date)
      let eotm = new Date(tm.getFullYear(), tm.getMonth(), tm.getDate(), 23, 59, 59, 999)
      let dayDom = makeCellDom(tm, i, options)
      let body = dayDom.getElementsByClassName('cellBody')[0]
      let {fevs, sevs} = events.filter((ev) => {
        return !(ev.endDate <= tm.getTime() || ev.startDate >= eotm.getTime())
      }).reduce((result, ev) => {
        const target = (ev.isFullday) ? result.fevs : result.sevs
        target.push(ev)
        return result
      }, {fevs: [], sevs: []})
      let eventCounts = fevs.length + sevs.length
      dayDom.dataset.eventsCounts = eventCounts
      if (eventCounts === 0) dayDom.classList.add('noEvents')
      for (const [key, value] of Object.entries({'fullday': fevs, 'single': sevs})) {
        let tDom = document.createElement('div')
        tDom.classList.add(key)
        for (let e of value) {
          let ev = renderEventAgenda(e, {
            useSymbol: options.useSymbol, 
            eventTimeOptions: options.eventTimeOptions, 
            locale:this.locale
          }, tm)
          tDom.appendChild(ev)
        }
        body.appendChild(tDom)
      }
      //if (!options.onlyEventDays || eventCounts > 0) agenda.appendChild(dayDom)
      agenda.appendChild(dayDom)
    }

    dom.appendChild(agenda)
    return dom
  },
})