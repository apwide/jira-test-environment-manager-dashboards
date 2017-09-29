function toTableRecord (environment) {
  let record = {
    application: environment.application.name,
    category: environment.category.name
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

        let output = `<table id="my-final-table" class="table table-bordered">
                        <thead>
                          <th>Application</th>
                          <th>Category</th>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>`

        gadget.getView().html(output)

        AJS.$('#my-final-table').dynatable({
          dataset: {
            records: toTableRecords(args.environments)
          }
        })
      },
      args: [ {
        key: 'environments',
        ajaxOptions: function () {
          return {
            url: '/rest/holydev/1.0/environments'
          }
        }
      } ]
    }
  })
})()
