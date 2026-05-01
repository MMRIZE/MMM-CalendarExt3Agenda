# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.0.1](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v2.0.0...v2.0.1) (2026-05-01)


### Fixed

* **closure:** restore closure variable support in config callbacks ([27014af](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/27014af247044dacae3b93d01a8edd7c4940616a)), closes [#261](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/issues/261)


### Tests

* remove obsolete socketNotificationReceived tests ([72816f2](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/72816f263ecba2e60d9780a2c6a0e7b7d4c3670b))

## [2.0.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.6.1...v2.0.0) (2026-05-01)


### ⚠ BREAKING CHANGES

* requires MagicMirror² ≥ 2.36.0

### Code Refactoring

* remove workaround for MM v2.35.0 function-stripping bug ([84aebbc](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/84aebbc2637334e774bb013352fefedb9273e288)), closes [MagicMirrorOrg/MagicMirror#4106](https://github.com/MagicMirrorOrg/MagicMirror/issues/4106)

## [1.6.1](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.6.0...v1.6.1) (2026-04-26)


### Fixed

* **closure:** restore closure context in config callbacks ([4e7ec17](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/4e7ec17e18826b19b3cbc98faf9a807bdbc1c71b)), closes [#260](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/issues/260)


### Chores

* add type field to package.json ([42b3c73](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/42b3c7305e03000fafa176c34e1275fc2c57ff25))
* improve demo with local ICS and showcase new features ([2a70c28](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/2a70c28a5e1b6f334996d0e153d06f45f8ce9e19))
* update devDependencies ([1356926](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/13569263705d6c68c49b186acabd059517aa7c76))


### Tests

* add node:test unit tests and CI workflow ([6b959ca](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/6b959ca734b9dae8ac5102675527fdb7a831dd27))

## [1.6.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.5.0...v1.6.0) (2026-04-06)


### Added

* add displayRepeatingCountTitle option ([#88](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/issues/88)) ([65c336d](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/65c336d1eacf0ddb95bf97f6082a2ca011c2284c))
* add showMultidayEventsOnce option ([#87](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/issues/87)) ([d2e02e3](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/d2e02e35622cc5bc22663c3077a84b5bc2b22dda))


### Documentation

* update installation instructions and add version requirements ([5c7a925](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/5c7a9255d30e7872f3f3a9060dd66e042d32f52f))


### Chores

* simplify ESLint commands ([df661bd](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/df661bd81a0e662742dbf2eef815037b22249fec))
* update devDependencies ([53b5424](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/53b5424f2745d397e64d3152c18f0b3838e717f3))
* update test and lint commands ([844f850](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/844f850434e5587082d6399826b583d0f012d9bf))

## [1.5.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.7...v1.5.0) (2026-04-03)


### Added

* add changelog config and add release script ([f81d3cf](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/f81d3cf9426c7dc6cebb8b6f9d35df9db1a1a86c))


### Fixed

* correct showMiniMonthCalendarMonths implementation ([e6fb6a6](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/e6fb6a65b1eed81672e7e26b7e2bccfb9a52c022))
* replace hardcoded weekend colors with CSS variables ([68f4988](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/68f4988ffe58c28bd35c64573aca46b3d8708f7d))
* restore callback functions lost after MM v2.35.0 ([ebeb4aa](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/ebeb4aa43e1beccb35d4f751c8207f18d17460ae))


### Documentation

* update git command to switch to tags for version rollback ([1c3aac8](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/1c3aac8174a6d1485c0c50d82ceeed2cdc4de5dc))
* update README with MagicMirror link and add screenshot to repo ([6f73640](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/6f7364056ea5ba287a71dbafb109ad5d0aaafd90))


### Chores

* add @eslint/markdown ([0abaa13](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/0abaa137c3d5fd445d772e06121c24ca40ea95bf))
* add Code of Conduct ([3bfb9ce](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/3bfb9ce334f3f9dd32922e132ecd0f00b78b875c))
* add demo config and script ([a914aad](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/a914aada8970c196d8b946bf5ca80a9793e7cd11))
* add dependabot configuration for GitHub Actions and npm updates ([8c414aa](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/8c414aa55b54f2887515bd9a1062d761848aca18))
* update devDependencies ([2e4b2e9](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/2e4b2e912d2155fc304d9d94fbe3dec166e53d45))
* update subproject commit reference in CX3_Shared ([02191d2](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/02191d25d894a43109464bc3a762e233c2d3123b))


### Code Refactoring

* remove no-unused-vars ([60e6e0d](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/60e6e0de8f0d385146095d0fb37656b60ddd4715))

## [1.4.7](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.6...v1.4.7) (2024-11-11)

### Documentation

* add developer commands ([09691d9](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/09691d96ef052ba9499bdad8b7a483872e3e1968))
* remove useless npm install/update commands ([be14cdd](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/be14cdd299060bd0df53b48b124f72607d607b92))

### Chores

* add missing devDependencies ([b5dd0a9](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/b5dd0a987598ef1a40490d2b97ac2711eb2589a3))
* add config to globals ([88e7271](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/88e7271211c5d245f8e3d735da0c59fafe773188))
* also lint .mjs files ([c5e7081](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/commit/c5e7081d3e22bab8201d3686f19fbb337e3292af))

## [1.4.6](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.5...v1.4.6) (2024-10-01)

### Fixed

* Some bug fix for the last day of the month issue.

## [1.4.5](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.4...v1.4.5) (2024-06-03)

### Fixed

* Some bug for indexing out-of-month range.
* Some README misinstruction.

## [1.4.4](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.3...v1.4.4) (2024-05-01)

### Fixed

* Duplicated applying of user eventFilter/eventTransformer etc.

## [1.4.3](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.2...v1.4.3) (2024-04-28)

### Fixed

* MM's repeated singleday timezone issue

### Changed

* Default length of weekday name in minimonthcalendar
* More stable CX3_Shared structure

## [1.4.2](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.1...v1.4.2) (2024-01-08)

### Added

* `relativeNamedDayOptions` to modify style of the name of the relative named days. (e.g. **Today** or **In 2 days**)

## [1.4.1](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.4.0...v1.4.1) (2023-12-26)

### Added

* `skipDuplicated` to skip duplicated events. (Same title and same start/end time)

### Changed

* Over MM 2.23 is needed. (> Chromium 110)

### Fixed

* Some minor issues for `instanceId` on the notifications.

## [1.4.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.3.1...v1.4.0) (2023-12-14)

### Removed

* Config value `cellDayOptions` and className `cellDay` are deprecated. The relative day name would be controlled by classname `relativeDay`, `relativeNamedDay`, `relativeDay_N`...

### Fixed

* Wrong present of the minimonth

## [1.3.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.2.4...v1.3.0) (2023-11-18)

### Added

* Supporting Iconify
* `skip` of event Object property
* Auto-detect `firstDayOfWeek` and `minimalDaysOfNewYear`

### Updated

* CX3 1.7.0 equivalent features

## [1.2.4](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.2.3...v1.2.4) (2023-11-18)

### Added

* Supporting Iconify (CX3 1.7.0 represents)

## [1.2.3](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.2.2...v1.2.3) (2023-10-09)

### Fixed

* A bug on `onlyEventDays`

### Changed

* Making some logics efficient.

## [1.2.2](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.2.1...v1.2.2) (2023-05-30)

### Changed

* Not too strict about other modules' DOM creation failure.

## [1.2.1](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.2.0...v1.2.1) (2023-05-03)

### Fixed

* Hotfix for `eventFilter` and `eventTransformer` issues.

## [1.2.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.5...v1.2.0) (2023-04-25)

### Added

* `weatherNotification`, `eventNotification` - To get data from 3rd party module which is not compatible with default modules.
* `weatherPayload`, `eventPayload` - To manipulate or to convert received payload itself on time. (e.g. Convert Celcius unit to Fahrenheit unit)
* Hiding day cell which has no event: `onlyEventDays: n`

### Changed

* Display whole month events in `miniCalendar` regardless of agenda showing (despite `endDayIndex` or `onlyEventDays`)
* Shared library to fix many issues.
* Timing of `eventFilter` and `eventTransformer` is delayed for better-handling event data after regularized

### Fixed

* Pooling events with multi-calendar modules' notification
* Position issue
* Some typo.
* Flickering for many reasons (logic error to treat notifications)

## [1.1.5](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.4...v1.1.5) (2022-12-05)

### Added

* `useWeather` option. (true/false)
* `weatherLocationName` option (some partial text to distinguish location)

## [1.1.4](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.3...v1.1.4) (2022-11-04)

### Fixed

* Fix the cal event broadcast handling (Thanks to @sdetweil)

## [1.1.3](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.2...v1.1.3) (2022-08-30)

### Fixed

* Urgent fix for `useSymbol` issue since 1.1.1
* `symbol:null` issue resolved

## [1.1.2](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.1...v1.1.2) (2022-08-29)

### Fixed

* Move `eventFormatter` to prior to get compatibility with other calendar module (e.g GoogleCalendar module)

## [1.1.1](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.1.0...v1.1.1) (2022-08-27)

### Added

* Allow multi icons and FA brands icon

## [1.1.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/compare/v1.0.0...v1.1.0) (2022-08-17)

### Added

* miniMonth calendar

### Fixed

* Some minor bugs fixes and code refactoring

## [1.0.0](https://github.com/MMRIZE/MMM-CalendarExt3Agenda/releases/tag/v1.0.0) (2022-07-12)

* Released.
