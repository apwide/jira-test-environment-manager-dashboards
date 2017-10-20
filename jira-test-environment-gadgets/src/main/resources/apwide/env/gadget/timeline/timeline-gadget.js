;(function () {
  function getDefaultStart () {
    return moment().add(-10, 'day').startOf('day')
  }

  function getDefaultEnd (start) {
    return start.clone().add(30, 'day')
  }

  let gadgetDefinition = {
    baseUrl: ATLASSIAN_BASE_URL,
    useOauth: '/rest/gadget/1.0/currentUser',
    config: {
      args: [],
      descriptor: function (args) {
        let gadget = this
        let defaultStart = getDefaultStart()
        let defaultEnd = getDefaultEnd(defaultStart)
        return {
          fields: [
            AJS.gadget.fields.nowConfigured() ,
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
            }
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

        let timeline = new vis.Timeline(container, items, groups, options)

        function loadEvents (items, calendars, timeline) {
          let timeWindow = timeline.getWindow()
          let start = moment(timeWindow.start)
          let end = moment(timeWindow.end)

          items.clear()
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
