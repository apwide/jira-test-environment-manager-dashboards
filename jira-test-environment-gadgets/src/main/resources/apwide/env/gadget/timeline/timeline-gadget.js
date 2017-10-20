;(function () {
  function getDefaultStart () {
    return moment().add(-10, 'day').startOf('day')
  }

  function getDefaultEnd (start) {
    return start.clone().add(30, 'day')
  }

  function getShowLogsPref () {
    let showLogs = gadget.getPref('show-logs')
    let showDeployments
    let showStatusChanges

    if (showLogs) {
      showDeployments = showLogs.includes('deployments')
      showStatusChanges = showLogs.includes('status-changes')
    }else {
      showDeployments = true
      showStatusChanges = true
    }
    return {
      showDeployments: showDeployments,
      showStatusChanges: showStatusChanges
    }
  }

  let gadgetDefinition = {
    baseUrl: ATLASSIAN_BASE_URL,
    useOauth: '/rest/gadget/1.0/currentUser',
    config: {
      args: [{
        key: 'calendars',
        ajaxOptions: function () {
          return {
            url: '/rest/apwide/tem/1.1/calendars'
          }
        }
      }],
      descriptor: function (args) {
        let gadget = this
        let defaultStart = getDefaultStart()
        let defaultEnd = getDefaultEnd(defaultStart)

        function getAllCalendarIds () {
          let calendarIds = []
          for (let calendar of args.calendars) {
            calendarIds.push(calendar.id)
            console.log('calendar:', calendar)
          }
          console.log('calendar ids:', calendarIds)
          return calendarIds
        }

        let showLogsPrefs = getShowLogsPref()

        return {
          fields: [
            {
              id: 'date-range-picker',
              label: gadget.getMsg('apwide.environment.date-range-filter'),
              type: 'callbackBuilder',
              userpref: 'date-range-filter',
              callback: function (parentDiv) {
                parentDiv.append(APWIDE.gadget.DateRangePicker({
                  gadget: gadget,
                  parentDiv: parentDiv,
                  prefNameStart: 'date-range-filter-start',
                  prefNameEnd: 'date-range-filter-end',
                  description: gadget.getMsg('apwide.environment.date-range.description'),
                  defaultStart: defaultStart,
                  defaultEnd: defaultEnd
                }))
              }
            },
            {
              id: 'calendar-picker',
              label: gadget.getMsg('apwide.environment.calendar-filter'),
              type: 'callbackBuilder',
              userpref: 'calendar-filter',
              callback: function (parentDiv) {
                parentDiv.append(select2ValuePicker(gadget, parentDiv, args.calendars, 'calendar-filter', getAllCalendarIds()))
              }
            },
            {
              id: 'show-logs-select',
              class: 'show-logs-selector-checkboxes',
              userpref: 'show-logs',
              label: gadget.getMsg('apwide.environment.show-logs'),
              description: gadget.getMsg('apwide.environment.show-logs.description'),
              type: 'checkbox',
              options: [
                { /* See Select Field for valid options */
                  id: 'show-deployments',
                  label: 'Deployed versions',
                  value: 'deployments',
                  selected: showLogsPrefs.showDeployments
                },
                {
                  id: 'status-changes',
                  label: 'Status changes',
                  value: 'status-changes',
                  selected: showLogsPrefs.showStatusChanges
                }]
            },
            AJS.gadget.fields.nowConfigured()
          ]
        }
      }
    },
    view: {
      enableReload: true,
      onResizeAdjustHeight: true,
      template: function (args) {
        let gadget = this
        let output =

        `
          <section class="aui-page-panel-content">
            <div id="timeline-gadget">
            </div>
          </section>
        `

        gadget.getView().html(output)

        function toGroup (environment) {
          return {
            id: environment.application.name + '_' + environment.category.name,
            name: renderName(environment),
            key: environment.id
          }
        }

        function toGroups (environments) {
          let groups = []
          for (let environment of environments) {
            groups.push(toGroup(environment))
          }
          return groups
        }

        // get the data set with groups
        let groups = toGroups(args.environments)

        // init calendars
        let calendars = new vis.DataSet()
        calendars.update(args.calendars)

        let shownCalendarsStringValue = gadgets.util.unescapeString(gadget.getPref('calendar-filter'))
        let shownCalendarIds = stringToArray(shownCalendarsStringValue)

        let showLogsPrefs = getShowLogsPref()
        if (showLogsPrefs.showDeployments) {
          shownCalendarIds.push('deployments')
        }
        if (showLogsPrefs.showStatusChanges) {
          shownCalendarIds.push('status-changes')
        }

        // create a dataset with items
        let items = new vis.DataSet()

        // create visualization
        let container = document.getElementById('timeline-gadget')

        let start
        let startPref = gadget.getPref('date-range-filter-start')
        if (startPref) {
          start = moment(Number(startPref))
        }else {
          start = getDefaultStart()
        }

        let end
        let endPref = gadget.getPref('date-range-filter-end')
        if (endPref) {
          end = moment(Number(endPref))
        }else {
          end = getDefaultEnd(start)
        }

        let options = {
          start: start,
          end: end,
          orientation: 'top',
          zoomMax: 1000 * 60 * 60 * 24 * 365,
          zoomMin: 1000 * 60 * 60,
          stack: false,
          stackSubgroups: false,
          selectable: false,
          multiselect: false,
          itemsAlwaysDraggable: false,
          editable: false,
          moveable: false,
          zoomKey: 'ctrlKey',
          groupTemplate: function (group) {
            let html =
            `<h6 id="group-env-${group.key}" class="env-details-inline-dialog-trigger" data-id="${group.key}">
              ${group.name}
            </h6>`
            return html
          }
        }

        let filteredItems = new vis.DataView(items, {
          filter: function (event) {
            return (shownCalendarIds.indexOf(event.calendar + '') >= 0)
          }
        })

        let timeline = new vis.Timeline(container, filteredItems, groups, options)

        function loadEvents (items, calendars, timeline) {
          let timeWindow = timeline.getWindow()
          let start = moment(timeWindow.start)
          let end = moment(timeWindow.end)

          let statuschanges = getStatusChangesByDates(start, end, '')
          items.update(statuschanges)
          let deployments = getDeploymentsByDates(start, end, '')
          items.update(deployments)
          let plannedevents = getPlannedEventsByDates(start, end, calendars, '')
          items.update(plannedevents)
          let issueEvents = getIssueEventsByDates(start, end, calendars, '')
          items.update(issueEvents)
        }

        loadEvents(items, calendars, timeline)

        timelineNavigation('timeline-gadget', timeline, { moveable: false,  toggleFullScreen: false})

        initPlannedEventInlineDialog(items, timeline, false, calendars)
        initIssueEventInlineDialog(items, timeline)
        initDeploymentInlineDialog(items, false)

        // TODO clean before using it!!
        // bindInlineDialog('')

        setTimeout(function () {
          console.log('Now everything is loaded!')
          gadget.resize()
        }, 500)

        timeline.on('rangechanged', function (properties) {
          loadEvents(items, calendars, timeline)
          gadget.resize()
        })
      },
      args: [
        {
          key: 'calendars',
          ajaxOptions: function () {
            return {
              url: '/rest/apwide/tem/1.1/calendars'
            }
          }
        }
      ]
    }
  }
  APWIDE.Subtitle.init(gadgetDefinition, 'Apwide Timeline')
  APWIDE.EnvironmentSearcher.init(gadgetDefinition)
  let gadget = AJS.Gadget(gadgetDefinition)
})()
