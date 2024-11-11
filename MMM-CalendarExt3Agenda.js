/* global config Module Log */

Module.register('MMM-CalendarExt3Agenda', {
  defaults: {
    locale: null, // 'de' or 'en-US' or prefer array like ['en-CA', 'en-US', 'en']
    calendarSet: [],
    startDayIndex: 0,
    endDayIndex: 10,
    onlyEventDays: 0, // 0: show all days regardless of events, n: show only n days which have events.
    instanceId: null,
    firstDayOfWeek: null, // 0: Sunday, 1: Monday
    minimalDaysOfNewYear: null, // When the first week of new year starts in your country.
    cellDateOptions: {
      month: 'short',
      day: 'numeric',
      weekday: 'long'
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
    useIconify: false,
    weekends: [],

    skipDuplicated: true,
    relativeNamedDayStyle: "narrow", // "narrow" or "short" or "long"
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


  regularizeConfig: function (options) {
    const weekInfoFallback = {
      firstDay: 1,
      minDays: 4
    }

    options.locale = Intl.getCanonicalLocales(options.locale ?? config?.locale ?? config?.language)?.[ 0 ] ?? ''
    const calInfo = new Intl.Locale(options.locale)
    if (calInfo?.weekInfo) {
      options.firstDayOfWeek = (options.firstDayOfWeek !== null) ? options.firstDayOfWeek : (calInfo.weekInfo?.firstDay ?? weekInfoFallback.firstDay)
      options.minimalDaysOfNewYear = (options.minimalDaysOfNewYear !== null) ? options.minimalDaysOfNewYear : (calInfo.weekInfo?.minimalDays ?? weekInfoFallback.minDays)
      options.weekends = ((Array.isArray(options.weekends) && options.weekends?.length) ? options.weekends : (calInfo.weekInfo?.weekend ?? [])).map(d => d % 7)
    }

    options.instanceId = options.instanceId ?? this.identifier
    this.notifications = {
      weatherNotification: options.weatherNotification ?? this.defaulNotifications.weatherNotification,
      weatherPayload: (typeof options.weatherPayload === 'function') ? options.weatherPayload : this.defaulNotifications.weatherPayload,
      eventNotification: options.eventNotification ?? this.defaulNotifications.eventNotification,
      eventPayload: (typeof options.eventPayload === 'function') ? options.eventPayload : this.defaulNotifications.eventPayload,
    }

    return options
  },

  start: function () {
    this.activeConfig = this.regularizeConfig({ ...this.config })
    this.originalConfig = { ...this.activeConfig }

    this.eventPool = new Map() // All the events
    //this.storedEvents = [] // regularized active events
    this.forecast = []

    this.refreshTimer = null

    this._ready = false

    let _moduleLoaded = new Promise((resolve, reject) => {
      import('/' + this.file('CX3_Shared/CX3_shared.mjs')).then((m) => {
        this.library = m
        //this.library.initModule(this)
        if (this.activeConfig.useIconify) this.library.prepareIconify()
        resolve()
      }).catch((err) => {
        console.error(err)
        reject(err)
      })
    })

    let _domCreated = new Promise((resolve, reject) => {
      this._domReady = resolve
    })

    Promise.allSettled([_moduleLoaded, _domCreated]).then ((result) => {
      this._ready = true
      this.library.prepareMagic()
      //let {payload, sender} = result[1].value
      //this.fetch(payload, sender)
      setTimeout(() => {
        this.updateDom(this.activeConfig.animationSpeed)
      }, this.activeConfig.waitFetch)
    })
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === this.notifications.eventNotification) {
      let convertedPayload = this.notifications.eventPayload(payload)
      this.eventPool.set(sender.identifier, JSON.parse(JSON.stringify(convertedPayload)))
    }

    if (notification === 'MODULE_DOM_CREATED') {
      this._domReady()
    }

    if (notification === this.notifications.weatherNotification) {
      let convertedPayload = this.notifications.weatherPayload(payload)
      if (
        (this.activeConfig.useWeather
          && ((this.activeConfig.weatherLocationName && convertedPayload.locationName.includes(this.activeConfig.weatherLocationName))
          || !this.activeConfig.weatherLocationName))
        && (Array.isArray(convertedPayload?.forecastArray) && convertedPayload?.forecastArray.length)
      ) {
        this.forecast = [...convertedPayload.forecastArray].map((o) => {
          let d = new Date(o.date)
          o.dateId = d.toLocaleDateString('en-CA')
          return o
        })
      } else {
        if (this.activeConfig.weatherLocationName && !convertedPayload.locationName.includes(this.activeConfig.weatherLocationName)) {
          Log.warn(`"weatherLocationName: '${this.activeConfig.weatherLocationName}'" doesn't match with location of weather module ('${convertedPayload.locationName}')`)
        }
      }
    }

    const replyCurrentConfig = (payload) => {
      if (typeof payload?.callback === 'function') {
        payload.callback(this.activeConfig)
      }
    }

    if (payload?.instanceId && payload?.instanceId !== this.activeConfig?.instanceId) return

    if (notification === 'CX3A_GET_CONFIG') {
      replyCurrentConfig(payload)
    }

    if (notification === 'CX3A_SET_CONFIG') {
      this.activeConfig = this.regularizeConfig({ ...this.activeConfig, ...payload })
      this.updateDom(this.activeConfig.animationSpeed)
      replyCurrentConfig(payload)
    }

    if (notification === 'CX3A_RESET') {
      this.activeConfig = this.regularizeConfig({ ...this.originalConfig })
      this.updateDom(this.activeConfig.animationSpeed)
      replyCurrentConfig(payload)
    }
  },

  getDom: function() {
    let dom = document.createElement('div')
    dom.innerHTML = ""
    dom.classList.add('bodice', 'CX3A_' + this.instanceId, 'CX3A')
    if (this.activeConfig.fontSize) dom.style.setProperty('--fontsize', this.activeConfig.fontSize)
    if (!this.library?.loaded) {
      Log.warn('[CX3A] Module is not prepared yet, wait a while.')
      return dom
    }
    dom = this.draw(dom, this.activeConfig)

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    this.refreshTimer = setTimeout(() => {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
      this.updateDom(this.activeConfig.animationSpeed)
    }, this.activeConfig.refreshInterval)
    return dom
  },


  draw: function (dom, options) {
    if (!this.library?.loaded) return dom
    let t = new Date(Date.now())
    const moment = new Date(t.getFullYear(), t.getMonth(), t.getDate())
    const {
      isToday, isThisMonth, isThisYear, getWeekNo, makeWeatherDOM,
      getRelativeDate, prepareEvents, getBeginOfWeek,
      gapFromToday, renderEventAgenda, regularizeEvents
    } = this.library
    dom.innerHTML = ''

    const prepareAgenda = (targetEvents) => {
      const eventsByDate = ({ events, startTime, dayCounts }) => {
        let ebd = events.reduce((days, ev) => {
          let st = new Date(+ev.startDate)
          let et = new Date(+ev.endDate)
          if (et.getTime() <= startTime) return days

          while(st.getTime() < et.getTime()) {
            let day = new Date(st.getFullYear(), st.getMonth(), st.getDate(), 0, 0, 0, 0).getTime()
            if (!days.has(day)) days.set(day, [])
            days.get(day).push(ev)
            st.setDate(st.getDate() + 1)
          }
          return days
        }, new Map())

        let startDay = new Date(+startTime).setHours(0, 0, 0, 0)
        let days = Array.from(ebd.keys()).sort()
        let position = days.findIndex((d) => d >= startDay)

        return days.slice(position, position + dayCounts).map((d) => {
          return {
            date: d,
            events: ebd.get(d)
          }
        })
      }
      let events = []
      let boc = getRelativeDate(moment, options.startDayIndex).valueOf()
      let eoc = getRelativeDate(moment, options.endDayIndex + 1).valueOf()
      let dateIndex = []
      if (options.onlyEventDays >= 1) {
        let ebd = eventsByDate({
          events: targetEvents,
          startTime: boc,
          dayCounts: options.onlyEventDays
        })
        dateIndex = ebd.map((e) => e.date)
        events = [...ebd.reduce((reduced, cur) => {
          for (const e of cur.events) {
            reduced.add(e)
          }
          return reduced
        }, new Set()) ]
      } else {
        events = targetEvents.filter((ev) => {
          return !(ev.endDate <= boc || ev.startDate >= eoc)
        })
        for (let i = options.startDayIndex; i <= options.endDayIndex; i++) {
          dateIndex.push(getRelativeDate(moment, i).getTime())
        }
      }
      return { events, dateIndex }
    }

    const makeCellDom = (d, seq) => {
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
      options.weekends.forEach((w, i) => {
        if (tm.getDay() % 7 === w % 7) cell.classList.add('weekend', 'weekend_' + (i + 1))
      })
      let h = document.createElement('div')
      h.classList.add('cellHeader')
      let m = document.createElement('div')
      m.classList.add('cellHeaderMain')
      let dayDom = document.createElement('div')
      dayDom.classList.add('cellDay')
      let gap = gapFromToday(tm, options)
      let p = new Intl.RelativeTimeFormat(options.locale, { ...options.relativeNamedDayOptions, numeric: "auto" })
      let pv = new Intl.RelativeTimeFormat(options.locale, { ...options.relativeNamedDayStyle, numeric: "always"})
      if (p.format(gap, "day") !== pv.format(gap, "day")) {
        dayDom.classList.add('relativeDay', 'relativeNamedDay')
      } else {
        dayDom.classList.add('relativeDay')
      }
      dayDom.classList.add('relativeDayGap_' + gap)
      dayDom.innerHTML = p.formatToParts(gap, "day").reduce((prev, cur, curIndex) => {
        prev = prev + `<span class="dateParts ${cur.type} seq_${curIndex} unit_${cur?.unit ?? 'none'}">${cur.value}</span>`
        return prev
      }, '')
      m.appendChild(dayDom)
      let dateDom = document.createElement('div')
      dateDom.classList.add('cellDate')
      let dParts = new Intl.DateTimeFormat(options.locale, options.cellDateOptions).formatToParts(tm)
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

    const drawAgenda = ({ events, dateIndex }) => {
      let agenda = document.createElement('div')
      agenda.classList.add('agenda')
      dateIndex = dateIndex.sort((a, b) => a - b)
      for (const [i, date] of dateIndex.entries()) {
        let tm = new Date(date)
        let eotm = new Date(tm.getFullYear(), tm.getMonth(), tm.getDate(), 23, 59, 59, 999)
        let dayDom = makeCellDom(tm, i)
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
        for (const [ key, value ] of Object.entries({ 'fullday': fevs, 'single': sevs })) {
          let tDom = document.createElement('div')
          tDom.classList.add(key)
          for (let e of value) {
            if (e?.skip) continue
            let ev = renderEventAgenda(e, {
              useSymbol: options.useSymbol,
              eventTimeOptions: options.eventTimeOptions,
              locale: options.locale,
              useIconify: options.useIconify,
            }, tm)
            tDom.appendChild(ev)
          }
          body.appendChild(tDom)
        }
        agenda.appendChild(dayDom)
      }
      dom.appendChild(agenda)
      return dom
    }

    const drawMiniMonth = (events) => {
      if (!options.showMiniMonthCalendar) return dom
      const cm = new Date(moment.getFullYear(), moment.getMonth(), moment.getDate() + options.startDayIndex)
      let bwoc = getBeginOfWeek(new Date(cm.getFullYear(), cm.getMonth(), 1), options)
      let ewoc = getBeginOfWeek(new Date(cm.getFullYear(), cm.getMonth() + 1, 0), options)
      let im = new Date(bwoc.getTime())
      let today = new Date(Date.now())
      let view = document.createElement('table')
      view.classList.add('miniMonth')
      let caption = document.createElement('caption')
      caption.innerHTML = new Intl.DateTimeFormat(options.locale, options.miniMonthTitleOptions).formatToParts(cm).reduce((prev, cur, curIndex, arr) => {
        prev = prev + `<span class="calendarTimeParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      view.appendChild(caption)
      let head = document.createElement('thead')
      let weekname = document.createElement('tr')
      let cwh = document.createElement('th')
      cwh.classList.add('cw', 'cell')
      weekname.appendChild(cwh)

      let wm = new Date(im.getTime())
      for (let i = 0; i < 7; i++) {
        let wn = document.createElement('th')
        wn.innerHTML = new Intl.DateTimeFormat(options.locale, options.miniMonthWeekdayOptions).format(wm)
        wn.classList.add(
          'cell',
          'weekname',
          'weekday_' + wm.getDay()
        )
        wn.scope = 'col'
        weekname.appendChild(wn)
        options.weekends.forEach((w, ix) => {
          if (wm.getDay() % 7 === w % 7) wn.classList.add('weekend', 'weekend_' + (ix + 1))
        })
        wm.setDate(wm.getDate() + 1)
      }
      head.appendChild(weekname)
      view.appendChild(head)
      let body = document.createElement('tbody')
      while(im.getTime() <= ewoc.getTime()) {
        let weekline = document.createElement('tr')
        let cw = getWeekNo(im, options)
        let cwc = document.createElement('td')
        let thisWeek = (im.getTime() === getBeginOfWeek(new Date(Date.now()), options).getTime()) ? ['thisWeek'] : []
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
            'month_' + (dm.getMonth() + 1),
            'year_' + dm.getFullYear(),
            'weekday_' + dm.getDay(),
            (dm.getFullYear() === today.getFullYear()) ? 'thisYear' : null,
            (dm.getMonth() === today.getMonth()) ? 'thisMonth' : null,
            ...thisWeek,
            (dm.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) ? 'today' : null
          )
          options.weekends.forEach((w, ix) => {
            if (dm.getDay() % 7 === w % 7) dc.classList.add('weekend', 'weekend_' + (ix + 1))
          })
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

    const sm = new Date(moment.getFullYear(), moment.getMonth(), moment.getDate() + options.startDayIndex)
    const em = new Date(moment.getFullYear(), moment.getMonth(), moment.getDate() + options.endDayIndex)
    const tempPool = new Map()
    this.eventPool.forEach((v, k) => {
      tempPool.set(k, JSON.parse(JSON.stringify(v)))
    })

    const targetEvents = prepareEvents({
      targetEvents: regularizeEvents({
        eventPool: tempPool,
        config: options,
      }),
      config: options,
      range: [
        new Date(sm.getFullYear(), sm.getMonth() - 1, 1).getTime(),
        new Date(em.getFullYear(), em.getMonth() + 2, 1).getTime()
      ]
    })
    const copied = JSON.parse(JSON.stringify(targetEvents))
    dom = drawMiniMonth([...copied])
    dom = drawAgenda(prepareAgenda([...copied]))
    return dom
  },
})