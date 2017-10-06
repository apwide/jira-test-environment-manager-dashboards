function toTableRecord (environment) {
  let status = environment.status
  let statusName = ''
  if (status)
    statusName = status.name

  let deployment = environment.deployment
  let deployedVersion = ''
  if (deployment)
    deployedVersion = deployment.versionName

  let record = {
    application: environment.application.name,
    category: environment.category.name,
    status: statusName,
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
    useOauth: ATLASSIAN_BASE_URL + '/rest/gadget/1.0/currentUser',
    config: {
      descriptor: function (args) {
        var gadget = this
        return {
          fields: [ {
            userpref: 'displayName',
            label: gadget.getMsg('property.label'),
            description: gadget.getMsg('property.description'),
            type: 'select',
            selected: gadget.getPref('displayName'),
            options: [ {
              label: 'Yes',
              value: 'true'
            }, {
              label: 'No',
              value: 'false'
            } ]
          }, AJS.gadget.fields.nowConfigured() ]
        }
      }
    },
    view: {
      enableReload: true,
      onResizeAdjustHeight: true,
      template: function (args) {
        console.log('Arguments:', args)

        var gadget = this

        let output = `<table id="apwide-gadget-table" class="apwide-table">
                        <thead>
                          <th>Application</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Deployed Version</th>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>`

        gadget.getView().html(output)

        AJS.$.dynatableSetup({
          features: {
            paginate: true,
            sort: true,
            pushState: true,
            search: false,
            recordCount: true,
            perPageSelect: false
          }
        })

        let table = AJS.$('#apwide-gadget-table').dynatable({
          dataset: {
            records: toTableRecords(args.environments)
          }
        })

        table.bind('dynatable:afterUpdate', function (e, dynatable) {
          console.log('After update fired')
          gadget.resize()
        })

      },
      args: [ {
        key: 'environments',
        ajaxOptions: function () {
          return {
            url: '/rest/apwide/tem/1.1/environments'
          }
        }
      } ]
    }
  })
})()
