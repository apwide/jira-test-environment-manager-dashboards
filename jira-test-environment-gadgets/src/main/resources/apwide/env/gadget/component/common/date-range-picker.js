define('apwide/gadget/dateRangePicker', [], function () {
  function datePicker (options) {
    let gadget = options.gadget
    let parentDiv = options.parentDiv
    let prefNameStart = options.prefNameStart
    let prefNameEnd = options.prefNameEnd
    let description = options.description
    let defaultDateDelta = 30
    let defaultStart = options.defaultStart ? options.defaultStart : moment().startOf('day').add(-10, 'day')
    let defaultEnd = options.defaultEnd ? options.defaultEnd : moment().startOf('day').add(defaultDateDelta-10, 'day')

    let currentStart = gadgets.util.unescapeString(gadget.getPref(prefNameStart))
    if (!currentStart) {
      currentStart = defaultStart.toDate().getTime() + ''
    }
    let currentEnd = gadgets.util.unescapeString(gadget.getPref(prefNameEnd))
    if (!currentEnd) {
      currentEnd = defaultEnd.toDate().getTime() + ''
    }

    let currentStartDate = currentStart ? formatTimestamp(currentStart, MOMENT_DATE_FORMAT) : ''
    let currentStartTime = currentStart ? formatTimestamp(currentStart, MOMENT_TIME_FORMAT) : ''
    let currentEndDate = currentEnd ? formatTimestamp(currentEnd, MOMENT_DATE_FORMAT) : ''
    let currentEndTime = currentEnd ? formatTimestamp(currentEnd, MOMENT_TIME_FORMAT) : ''

    parentDiv.append(
      `
      <div id="event-start-end-date">
          <input id="eventStartDate" name="eventStartDate" class="text apwide-date-field date start" type="text" value="${currentStartDate}"/>
          <input id="eventStartTime" name="eventStartTime" class="text apwide-time-field time start" type="text" placeholder="HH:mm" value="${currentStartTime}"/>
          to
          <input id="eventEndDate" name="eventEndDate" class="text apwide-date-field  date end" type="text" value="${currentEndDate}"/>
          <input id="eventEndTime" name="eventEndTime" class="text apwide-time-field  time end" type="text" placeholder="HH:mm" value="${currentEndTime}"/>
          <div class="description">${description}</div>
          <input type="hidden" id="${prefNameStart}" name="${prefNameStart}" value="${currentStart}"/>
          <input type="hidden" id="${prefNameEnd}" name="${prefNameEnd}" value="${currentEnd}"/>
      </div>
      `
    )

    function getDate (type) {
      let dateString = AJS.$(`#event${type}Date`).val()
      let timeString = AJS.$(`#event${type}Time`).val()
      console.log('dateString', dateString)
      console.log('timeString', timeString)
      let date = parseDate(dateString + timeString, MOMENT_DATE_FORMAT + MOMENT_TIME_FORMAT)
      console.log('date', date)
      console.log('type', type)
      return date
    }

    function updatePrefs () {
      let startDate = getDate('Start')
      AJS.$('#' + prefNameStart).val(startDate ? startDate.getTime() : '')
      let endDate = getDate('End')
      AJS.$('#' + prefNameEnd).val(endDate ? endDate.getTime() : '')
    }

    AJS.$('.save').on('click', function () {
      console.log('save!!')
      updatePrefs()
    })

    AJS.$('#event-start-end-date .time').timepicker({
      'showDuration': true,
      'timeFormat': PICKER_TIME_FORMAT
    })

    AJS.$('#eventStartDate').datePicker({
      overrideBrowserDefault: true,
      dateFormat: PICKER_DATE_FORMAT
    })

    AJS.$('#eventEndDate').datePicker({
      overrideBrowserDefault: true,
      dateFormat: PICKER_DATE_FORMAT
    })

    AJS.$('#event-start-end-date').datepair({
      defaultDateDelta: defaultDateDelta,
      parseTime: function (el) {
        return parseDateFromElement(el, MOMENT_TIME_FORMAT)
      },
      parseDate: function (el) {
        return parseDateFromElement(el, MOMENT_DATE_FORMAT)
      },
      updateTime: function (el, utc) {
        el.value = formatDate(utc, MOMENT_TIME_FORMAT)
      },
      updateDate: function (el, utc) {
        el.value = formatDate(utc, MOMENT_DATE_FORMAT)
      }
    })
  }
  return datePicker
})

AJS.namespace('APWIDE.gadget.DateRangePicker', null, require('apwide/gadget/dateRangePicker'))
