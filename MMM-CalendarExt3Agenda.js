/* global Module */

Module.register('MMM-CalendarExt3Agenda', {
  defaults: {
    locale: null, // 'de' or 'en-US' or prefer array like ['en-CA', 'en-US', 'en']
    calendarSet: [],

    startDayIndex: 0,
    endDayIndex: 10,



    // mode: 'week', // or 'month'
    // weekIndex: -1, // Which week from this week starts in a view. Ignored on mode 'month' 
    // weeksInView: 3, //  How many weeks will be displayed. Ignored on mode 'month'

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
    // glanceTime: 1000 * 60,
    animationSpeed: 1000,

    useSymbol: true,
    useWeather: true,
    weatherLocationName: null,
  },

  getStyles: function () {
    return ['MMM-CalendarExt3Agenda.css']
  },


  getMoment: function() {
    return new Date()
    /*
    let moment = (this.tempMoment) ? new Date(this.tempMoment.valueOf()) : new Date()
    moment = (this.mode === 'month') ?
      new Date(moment.getFullYear(), moment.getMonth() + (this.stepIndex), 1) :
      new Date(moment.getFullYear(), moment.getMonth(), moment.getDate() + (7 * this.stepIndex))
    return moment
    */
  },

  start: function() {
    this.storedEvents = []
    this.forecast = []
    this.instanceId = this.config.instanceId ?? this.identifier
    this.locale = Intl.getCanonicalLocales(this.config.locale ?? config.language )?.[0] ?? ''
    this.forecast = []

    this.refreshTimer = null
    this.activeConfig = {...this.config}
  },
  
  notificationReceived: function(notification, payload, sender) {
    const resetCalendar = () => {
      clearTimeout(this.viewTimer)
      this.viewTimer = null
      this.stepIndex = 0
      this.tempMoment = null
      this.updateDom(this.config.animationSpeed)
    }

    if (notification === 'DOM_OBJECTS_CREATED') {
      let magic = document.createElement('div')
      magic.id = 'CX3A_MAGIC'
      document.getElementsByTagName('body')[0].appendChild(magic)
    }

    if (notification === 'CALENDAR_EVENTS') {
      this.storedEvents = JSON.parse(JSON.stringify(payload))
      let calendarSet = (Array.isArray(this.config.calendarSet)) ? [...this.config.calendarSet] : []
      if (calendarSet.length > 0) {
        this.storedEvents = this.storedEvents.filter((ev) => {
          return (calendarSet.includes(ev.calendarName))
        }).map((ev) => {
          let i = calendarSet.findIndex((name) => {
            return name === ev.calendarName
          }) + 1
          ev.calendarSeq = i 
          return ev
        })
      }
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer)
        this.fetchTimer = null
      }
      this.fetchTimer = setTimeout(() => {
        clearTimeout(this.fetchTimer)
        this.fetchTimer = null
        this.updateDom(this.config.animationSpeed)
      }, this.config.waitFetch)      
    }
/*
    if (notification === 'CX3_SET_DATE') {
      if (payload?.instanceId === this.config.instanceId || !payload?.instanceId) {
        this.tempMoment = new Date(payload?.date ?? null)
        this.stepIndex = 0
        this.updateDom(this.config.animationSpeed)
        this.viewTimer = setTimeout(resetCalendar, this.config.glanceTime)
      } 
    }
*/
    if (notification === 'WEATHER_UPDATED') {
      console.log(payload)
      if (
        (this.config.useWeather && ((this.config.weatherLocationName && this.config.weatherLocationName === payload.locationName) || !this.config.weatherLocationName))
        && (Array.isArray(payload?.forecastArray) && payload?.forecastArray.length)
      ) {
        this.forecast = [...payload.forecastArray].map((o) => {
          let d = new Date(o.date)
          o.dateId = d.toLocaleDateString('en-CA')
          return o
        })
      }
    }
  },

  getDom: function() {
    let dom = document.createElement('div')
    dom.classList.add('bodice', 'CX3A_' + this.instanceId, 'CX3A')
    
    

    /*
    if (this.config.fontSize) dom.style.setProperty('--fontsize', this.config.fontSize)
    dom.style.setProperty('--maxeventlines', this.config.maxEventLines)
    dom.style.setProperty('--eventheight', this.config.eventHeight)
    */
    dom = this.draw(dom, this.activeConfig)
    this.refreshTimer = setTimeout(() => {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
      this.updateDom(this.config.animationSpeed)
    }, this.config.refreshInterval)
    return dom
  },

  draw: function (dom, config) {
    const getL = (rgba) => {
      let [r, g, b, a] = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1)
      r /= 255
      g /= 255
      b /= 255
      const l = Math.max(r, g, b)
      const s = l - Math.min(r, g, b)
      const h = s ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0
      let rh = 60 * h < 0 ? 60 * h + 360 : 60 * h
      let rs = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)
      let rl = (100 * (2 * l - s)) / 2
      return rl
    }
    dom.innerHTML = ''
    let magic = document.createElement('div')
    magic.classList.add('CX3A_MAGIC')
    magic.id = 'CX3A_MAGIC_' + this.id
    dom.appendChild(magic)

    const isToday = (d) => {
      let tm = new Date()
      let start = (new Date(tm.valueOf())).setHours(0, 0, 0, 0)
      let end = (new Date(tm.valueOf())).setHours(23, 59, 59, 999)
      return (d.getTime() >= start && d.getTime() <= end)
    }

    const isThisMonth = (d) => {
      let tm = new Date()
      let start = new Date(tm.getFullYear(), tm.getMonth(), 1)
      let end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
      return (d.getTime() >= start && d.getTime() <= end)
    }

    const isThisYear = (d) => {
      let tm = new Date()
      let start = new Date(tm.getFullYear(), 1, 1)
      let end = new Date(tm.getFullYear(), 11, 31, 23, 59, 59, 999)
      return (d.getTime() >= start && d.getTime() <= end)
    }

    const isPassed = (ev) => {
      return (ev.endDate < Date.now())
    }

    const isFuture = (ev) => {
      return (ev.startDate > Date.now())
    }

    const isCurrent = (ev) => {
      let tm = Date.now()
      return (ev.endDate >= tm && ev.startDate <= tm)
    }

    const isMultiday = (ev) => {
      let s = new Date(ev.startDate)
      let e = new Date(ev.endDate)
      return ((s.getDate() !== e.getDate())
        || (s.getMonth() !== e.getMonth())
        || (s.getFullYear() !== e.getFullYear()))
    }

    const getRelativeDate = (d, index) => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + index)
    }

    const getBeginOfWeek = (d) => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() - config.firstDayOfWeek + 7 ) % 7)
    }
/*
    const getEndOfWeek = (d) => {
      let b = getBeginOfWeek(d)
      return new Date(b.getFullYear(), b.getMonth(), b.getDate() + 6, 23, 59, 59, 999)
    }
*/
    const getWeekNo = (d) => {
      let bow = getBeginOfWeek(d)
      let fw = getBeginOfWeek(new Date(d.getFullYear(), 0, config.minimalDaysOfNewYear))
      if (bow.getTime() < fw.getTime()) fw = getBeginOfWeek(new Date(d.getFullYear() - 1, 0, config.minimalDayosOfNewYear))
      let count = 1;
      let t = new Date(fw.valueOf())
      while (bow.getTime() > t.getTime()) {
        t.setDate(t.getDate() + 7)
        count++;
      }
      return count
    }

    const gapFromToday = (d) => {
      const MS = 24 * 60 * 60 * 1000
      const t = new Date()
      return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) / MS)
    }

    const makeEventDataDom = (event, tm) => {
      let eDom = document.createElement('div')
      eDom.dataset.calendarSeq = event?.calendarSeq ?? 0
      eDom.dataset.calendarName = event.calendarName
      eDom.dataset.color = event.color
      eDom.dataset.description = event.description || ''
      eDom.dataset.title = event.title
      eDom.dataset.fullDayEvent = event.fullDayEvent
      eDom.dataset.geo = event.geo
      eDom.dataset.location = event.location || ''
      eDom.dataset.startDate = event.startDate
      eDom.dataset.endDate = event.endDate
      eDom.dataset.symbol = event.symbol.join(' ')
      eDom.dataset.today = event.today
      eDom.classList.add('calendar_' + encodeURI(event.calendarName))
      if (event?.class) eDom.classList.add(event.class)
      if (event.fullDayEvent) eDom.classList.add('fullday')
      if (event.isPassed) eDom.classList.add('passed')
      if (event.isCurrent) eDom.classList.add('current')
      if (event.isFuture) eDom.classList.add('future')
      if (event.isMultiday) eDom.classList.add('multiday')
      if (!(event.isMultiday || event.fullDayEvent)) eDom.classList.add('singleday')
      if (config.useSymbol) {
        eDom.classList.add('useSymbol') 
      }
      eDom.style.setProperty('--calendarColor', event.color)
      let headline = document.createElement('div')
      headline.classList.add('headline')

      let symbol = document.createElement('div')
      symbol.classList.add('symbol')
      if (config.useSymbol && Array.isArray(event.symbol) && event.symbol.length > 0) {
        symbol.classList.add(...(event.symbol.map((e) => { return 'fa-' + e})))
        symbol.classList.add('fa')
      } else {
        symbol.classList.add('noSymbol')
      }

      headline.appendChild(symbol)

      let time = document.createElement('div')
      time.classList.add('period')

      let startTime = document.createElement('div')
      let st = new Date(event.startDate)
      startTime.classList.add('time', 'startTime', (st.getDate() === tm.getDate()) ? 'inDay' : 'notInDay')
      startTime.innerHTML = new Intl.DateTimeFormat(this.locale, config.eventTimeOptions).formatToParts(st).reduce((prev, cur, curIndex, arr) => {
        prev = prev + `<span class="eventTimeParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      headline.appendChild(startTime)

      let endTime = document.createElement('div')
      let et = new Date(event.endDate)
      endTime.classList.add('time', 'endTime', (et.getDate() === tm.getDate()) ? 'inDay' : 'notInDay')
      endTime.innerHTML = new Intl.DateTimeFormat(this.locale, config.eventTimeOptions).formatToParts(et).reduce((prev, cur, curIndex, arr) => {
        prev = prev + `<span class="eventTimeParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      headline.appendChild(endTime)

      let title = document.createElement('div')
      title.classList.add('title')
      title.innerHTML = event.title
      headline.appendChild(title)
      eDom.appendChild(headline)
      let description = document.createElement('div')
      description.classList.add('description')
      description.innerHTML = event.description || ''
      eDom.appendChild(description)
      let location = document.createElement('div')
      location.classList.add('location')
      location.innerHTML = event.location || ''
      eDom.appendChild(location)
      eDom.classList.add('event')

      let magic = document.getElementById('CX3A_MAGIC_' + this.id)
      magic.style.color = event.color
      let l = getL(window.getComputedStyle(magic).getPropertyValue('color'))
      eDom.style.setProperty('--oppositeColor', (l > 60) ? 'black' : 'white')
      
      return eDom
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
        'week_' + getWeekNo(tm)
      )
      
      let h = document.createElement('div')
      h.classList.add('cellHeader')

      let m = document.createElement('div')
      m.classList.add('cellHeaderMain')

      let dayDom = document.createElement('div')
      dayDom.classList.add('cellDay')
      let gap = gapFromToday(tm)
      let rParts = (Object.keys(config.cellDayOptions).includes(String(gap))) 
        ? (new Intl.RelativeTimeFormat(this.locale, config.cellDayOptions[String(gap)])).formatToParts(gap, 'day') 
        : (new Intl.DateTimeFormat(this.locale, config.cellDayOptions?.['rest'] ?? {weekday: 'long'})).formatToParts(tm)
      dayDom.innerHTML = rParts.reduce((prev, cur, curIndex) => {
        prev = prev + `<span class="dateParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      m.appendChild(dayDom)

      let dateDom = document.createElement('div')
      dateDom.classList.add('cellDate')
      let dParts = new Intl.DateTimeFormat(this.locale, config.cellDateOptions).formatToParts(tm)
      dateDom.innerHTML = dParts.reduce((prev, cur, curIndex) => {
        prev = prev + `<span class="dateParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
        return prev
      }, '')
      m.appendChild(dateDom)


      let cwDom = document.createElement('div')
      cwDom.innerHTML = String(getWeekNo(tm))
      cwDom.classList.add('cw')
      m.appendChild(cwDom)

      h.appendChild(m)

      let s = document.createElement('div')
      s.classList.add('cellHeaderSub')

      let forecasted = this.forecast.find((e) => {
        return (tm.toLocaleDateString('en-CA') === e.dateId)
      })

      if (forecasted && forecasted?.weatherType) {
        let weatherDom = document.createElement('div')
        weatherDom.classList.add('cellWeather')
        let maxTemp = document.createElement('span')
        maxTemp.classList.add('maxTemp', 'temperature')
        maxTemp.innerHTML = String(Math.round(forecasted.maxTemperature))
        weatherDom.appendChild(maxTemp)
        let minTemp = document.createElement('span')
        minTemp.classList.add('minTemp', 'temperature')
        minTemp.innerHTML = String(Math.round(forecasted.minTemperature))
        weatherDom.appendChild(minTemp)
        let icon = document.createElement('span')
        icon.classList.add('wi', 'wi-' + forecasted.weatherType)
        weatherDom.appendChild(icon)
        s.appendChild(weatherDom)
      }
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

    let boc = getRelativeDate(moment, config.startDayIndex)
    let eoc = getRelativeDate(moment, config.endDayIndex)

    let tboc = boc.getTime()
    let teoc = eoc.getTime()

    let events = [...(this.storedEvents ?? [])]

    events = events.filter((ev) => {
      return !(+ev.endDate <= tboc || +ev.startDate >= teoc)
    }).map((ev) => {
      ev.startDate = +ev.startDate
      ev.endDate = +ev.endDate
      let et = new Date(+ev.endDate)
      if (et.getHours() === 0 && et.getMinutes() === 0 && et.getSeconds() === 0 && et.getMilliseconds() === 0) ev.endDate = ev.endDate - 1
      ev.isPassed = isPassed(ev)
      ev.isCurrent = isCurrent(ev)
      ev.isFuture = isFuture(ev)
      ev.isFullday = ev.fullDayEvent
      ev.isMultiday = isMultiday(ev)
      return ev
    })
    /*
    .sort((a, b) => {
      let aDur = a.endDate - a.startDate
      let bDur = b.endDate - b.startDate

      return ((a.isFullday || a.isMultiday) && (b.isFullday || b.isMultiday)) 
        ? bDur - aDur
        : ((a.startDate === b.startDate) ? a.endDate - b.endDate : a.startDate - b.startDate)
    })
    */

    if (typeof config.eventFilter === 'function') {
      events = events.filter((ev) => {
        return config.eventFilter(ev)
      })
    }

    if (typeof config.eventTransformer === 'function') {
      events = events.map((ev) => {
        return config.eventTransformer(ev)
      })
    }

    let cm = new Date(moment.getFullYear(), moment.getMonth(), moment.getDate())

    for (let i = config.startDayIndex; i <= config.endDayIndex; i++) {
      
      let tm = new Date(cm.getFullYear(), cm.getMonth(), cm.getDate() + i)
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

      for (const [key, value] of Object.entries({'fullday': fevs, 'single': sevs})) {
        let tDom = document.createElement('div')
        tDom.classList.add(key)
        for (let e of value) {
          let ev = makeEventDataDom(e, tm)
          tDom.appendChild(ev)
        }
        body.appendChild(tDom)
      }
      dom.appendChild(dayDom)
    }
/*
    do {



      let wDom = document.createElement('div')
      wDom.classList.add('week')
      wDom.dataset.weekNo = getWeekNo(wm)

      let ccDom = document.createElement('div')
      ccDom.classList.add('cellContainer', 'weekGrid')

      let ecDom = document.createElement('div')
      ecDom.classList.add('eventContainer', 'weekGrid', 'weekGridRow')

      let boundary = []

      let cm = new Date(wm.valueOf())
      for (i = 0; i < 7; i++) {
        if (i) cm = new Date(cm.getFullYear(), cm.getMonth(), cm.getDate() + 1)
        ccDom.appendChild(makeCellDom(cm, i))
        boundary.push(cm.getTime())       
      }
      boundary.push(cm.setHours(23, 59, 59, 999))

      let sw = new Date(wm.valueOf())
      let ew = new Date(sw.getFullYear(), sw.getMonth(), sw.getDate() + 6, 23, 59, 59, 999)
      let eventsOfWeek = events.filter((ev) => {
        return !(ev.endDate <= sw.getTime() || ev.startDate >= ew.getTime())
      })

      for (let event of eventsOfWeek) {
        let eDom = document.createElement('div')
        eDom.classList.add('event')

        let startLine = 0
        if (event.startDate >= boundary.at(0)) {
          startLine = boundary.findIndex((b, idx, bounds) => {
            return (event.startDate >= b && event.startDate < bounds[idx + 1])
          })
        } else {
          eDom.classList.add('continueFromPreviousWeek')
        }

        let endLine = boundary.length - 1
        if (event.endDate <= boundary.at(-1) ) {
          endLine = boundary.findIndex((b, idx, bounds) => {
            return (event.endDate <= b && event.endDate > bounds[idx - 1])
          })
        } else {
          eDom.classList.add('continueToNextWeek')
        }

        eDom.style.gridColumnStart = String(startLine + 1)
        eDom.style.gridColumnEnd = String(endLine + 1)
        eDom.dataset.calendarSeq = event?.calendarSeq ?? 0
        eDom.dataset.calendarName = event.calendarName
        eDom.dataset.color = event.color
        eDom.dataset.description = event.description
        eDom.dataset.title = event.title
        eDom.dataset.fullDayEvent = event.fullDayEvent
        eDom.dataset.geo = event.geo
        eDom.dataset.location = event.location
        eDom.dataset.startDate = event.startDate
        eDom.dataset.endDate = event.endDate
        eDom.dataset.symbol = event.symbol.join(' ')
        eDom.dataset.today = event.today
        eDom.classList.add('calendar_' + encodeURI(event.calendarName))
        eDom.classList.add(event.class)
        
        eDom.style.setProperty('--calendarColor', event.color)
        if (event.fullDayEvent) eDom.classList.add('fullday')
        if (event.isPassed) eDom.classList.add('passed')
        if (event.isCurrent) eDom.classList.add('current')
        if (event.isFuture) eDom.classList.add('future')
        if (event.isMultiday) eDom.classList.add('multiday')
        if (!(event.isMultiday || event.fullDayEvent)) eDom.classList.add('singleday')
        if (this.config.useSymbol) {
          eDom.classList.add('useSymbol') 
        }
        let exDom = document.createElement('span')
        exDom.classList.add('symbol', 'fa-solid')
        exDom.classList.add(...event.symbol.map((s) => {return 'fa-' + s}))
        eDom.appendChild(exDom)
        let etDom = document.createElement('div')
        etDom.classList.add('title')
        etDom.innerHTML = event.title
        let esDom = document.createElement('div')
        esDom.classList.add('eventTime')
        let dParts = new Intl.DateTimeFormat(this.locale, this.config.eventTimeOptions).formatToParts(new Date(event.startDate))
        let dateHTML = dParts.reduce((prev, cur, curIndex, arr) => {
          prev = prev + `<span class="eventTimeParts ${cur.type} seq_${curIndex}">${cur.value}</span>`
          return prev
        }, '')
        esDom.innerHTML = dateHTML
        eDom.appendChild(esDom)
        eDom.appendChild(etDom)
        ecDom.appendChild(eDom)
      }

      wDom.appendChild(ccDom)
      wDom.appendChild(ecDom)
      
      dom.appendChild(wDom)
      wm = new Date(wm.getFullYear(), wm.getMonth(), wm.getDate() + 7)
    } while(wm.valueOf() <= eoc.valueOf())


    this.viewMoment = moment
*/
    return dom
  },

})