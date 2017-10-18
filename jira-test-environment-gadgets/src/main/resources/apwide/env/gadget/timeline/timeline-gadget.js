;(function () {
  let gadget = AJS.Gadget({
    baseUrl: ATLASSIAN_BASE_URL,
    useOauth: '/rest/gadget/1.0/currentUser',
    config: {
      args: [
        {
          key: 'environments',
          ajaxOptions: function () {
            return {
              url: searchEnvironmentsUrl()
            }
          }
        }
      ],
      descriptor: function (args) {
        let gadget = this

        return {
          fields: [ AJS.gadget.fields.nowConfigured() ]
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
            name: renderName(environment)
          }
        }

        function toGroups (environments) {
          let groups = []
          for (let environment of environments) {
            groups.push(toGroup(environment))
          }
          return groups
        }

        function addItems (items, plannedEvents, calendars, toItems) {
          for (let plannedEvent of plannedEvents) {
            console.log('Update items...')
            items.update(toItems(plannedEvent, calendars))
          }
        }

        // get the data set with groups
        let groups = toGroups(args.environments)

        // init calendars
        let calendars = new vis.DataSet()
        calendars.update(args.calendars)

        // create a dataset with items
        let items = new vis.DataSet()

        addItems(items, args.statusChanges, calendars, statusChangeToItem)
        addItems(items, args.deployments, calendars, deploymentToItem)
        addItems(items, args.plannedEvents, calendars, plannedEventToItems)
        addItems(items, args.issueEvents, calendars, issueEventToItems)

        // create visualization
        let container = document.getElementById('timeline-gadget')

        let now = moment().minutes(0).seconds(0).milliseconds(0)
        let start = now.clone().startOf('day').subtract('days', 10)
        let end = now.clone().startOf('day').add('days', 10)

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
            `<h6 id="group-env-${group.id}" class="env-details-inline-dialog-trigger" data-id="${group.id}">
              ${group.name}
            </h6>`
            return html
          }
        }

        let timeline = new vis.Timeline(container, items, groups, options)

        timelineNavigation('timeline-gadget', timeline, { moveable: false,  toggleFullScreen: false})

        timeline.on('rangechanged', function (properties) {
          console.log('range changed', moment(properties.start), moment(properties.end))
          gadget.resize()
        })
      },
      args: [
        {
          key: 'environments',
          ajaxOptions: function () {
            return {
              url: searchEnvironmentsUrl()
            }
          }
        }, {
          key: 'statusChanges',
          ajaxOptions: function () {
            return {
              url: '/rest/holydev/1.0/status-changes'
            }
          }
        },
        {
          key: 'deployments',
          ajaxOptions: function () {
            return {
              url: '/rest/holydev/1.0/deployments'
            }
          }
        },
        {
          key: 'plannedEvents',
          ajaxOptions: function () {
            return {
              url: '/rest/holydev/1.0/plan/events'
            }
          }
        },
        {
          key: 'issueEvents',
          ajaxOptions: function () {
            return {
              url: '/rest/holydev/1.0/issue-events?start=2016-01-01&end=2018-01-01'
            }
          }
        },
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
  })
})()
