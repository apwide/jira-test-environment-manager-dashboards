function toTableRecord (environment) {

  let deployment = environment.deployment
  let deployedVersion = ''
  if (deployment)
    deployedVersion = deployment.versionName

  let customProperty1 = getCustomProperty(environment,1)

  let record = {
    application: environment.application.name,
    category: environment.category.name,
    url: renderUrl(environment),
    status: renderStatus(environment),
    customProperty1: customProperty1.value,
    deployedVersion: deployedVersion
  }
  return record
}

function toTableRecords (environments) {
  let tableRecords = []
  for (let environment of environments) {
    tableRecords.push(toTableRecord(environment))
  }
  return tableRecords
}

;(function () {
  var gadget = AJS.Gadget({
    baseUrl: ATLASSIAN_BASE_URL,
    useOauth: '/rest/gadget/1.0/currentUser',
    config: {
      args: [
        {
          key: 'applications',
          ajaxOptions: function () {
            return {
              url: '/rest/apwide/tem/1.1/applications'
            }
          }
        }
      ],
      descriptor: function (args) {
        var gadget = this
        return {
          fields: [{
            id: 'application-picker',
            label: gadget.getMsg('gadget.environments.application-picker'),
            description: gadget.getMsg('gadget.environments.application-picker.description'),
            type: 'callbackBuilder',
            userpref: 'applicationFilter',
            callback: function (parentDiv) {
              parentDiv.append((select2ValuePicker(gadget, parentDiv, args.applications, 'applicationFilter')))
            }
          },
            AJS.gadget.fields.nowConfigured() ]
        }
      }
    },
    view: {
      enableReload: true,
      onResizeAdjustHeight: true,
      template: function (args) {
        let gadget = this
        gadgets.window.setTitle('Environments')

        let output = `<table id="apwide-gadget-table" class="apwide-table">
                        <thead>
                          <th>Application</th>
                          <th>Category</th>
                          <th>Url</th>
                          <th>Status</th>
                          <th data-dynatable-column="customProperty1">Custom Property 1</th>
                          <th>Deployed Version</th>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>`

        gadget.getView().html(output)

        let table = AJS.$('#apwide-gadget-table').dynatable({
          features: {
            paginate: true,
            sort: true,
            pushState: true,
            search: false,
            recordCount: true,
            perPageSelect: false
          },
          dataset: {
            records: toTableRecords(args.environments)
          }
        })

        table.bind('dynatable:afterUpdate', function (e, dynatable) {
          gadget.resize()
        })
      },
      args: [ {
        key: 'environments',
        ajaxOptions: function () {
          let gadget = this
          let searchFilter = {}

          let applicationFilter = gadgets.util.unescapeString(this.getPref('applicationFilter'))
          let applicationIds = stringToArray(applicationFilter)
          if (applicationIds && applicationIds.length > 0) {
            searchFilter.applicationId = applicationIds
          }

          return {
            url: searchEnvironmentsUrl(searchFilter)
          }
        }
      }
      ]
    }
  })
})()
