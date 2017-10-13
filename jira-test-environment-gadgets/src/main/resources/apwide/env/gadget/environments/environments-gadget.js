function toTableRecord (environment, customProperties) {
  let deployment = environment.deployment
  let deployedVersion = ''
  if (deployment)
    deployedVersion = deployment.versionName

  let record = {
    application: environment.application.name,
    category: environment.category.name,
    url: renderUrl(environment),
    status: renderStatus(environment),
    deployedVersion: deployedVersion
  }
  for (let customProperty of customProperties) {
    record[customProperty.key] = renderCustomProperty(environment, customProperty.id)
  }
  return record
}

function toTableRecords (environments, customProperties) {
  let tableRecords = []
  for (let environment of environments) {
    tableRecords.push(toTableRecord(environment, customProperties))
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
        },
        {
          key: 'categories',
          ajaxOptions: function () {
            return {
              url: '/rest/apwide/tem/1.1/categories'
            }
          }
        },
        {
          key: 'statuses',
          ajaxOptions: function () {
            return {
              url: '/rest/apwide/tem/1.1/statuses'
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
          {
            id: 'category-picker',
            label: gadget.getMsg('gadget.environments.category-picker'),
            description: gadget.getMsg('gadget.environments.category-picker.description'),
            type: 'callbackBuilder',
            userpref: 'categoryFilter',
            callback: function (parentDiv) {
              parentDiv.append((select2ValuePicker(gadget, parentDiv, args.categories, 'categoryFilter')))
            }
          },
          {
            id: 'statuses-picker',
            label: gadget.getMsg('gadget.environments.status-picker'),
            description: gadget.getMsg('gadget.environments.status-picker.description'),
            type: 'callbackBuilder',
            userpref: 'statusFilter',
            callback: function (parentDiv) {
              parentDiv.append((select2ValuePicker(gadget, parentDiv, args.statuses, 'statusFilter')))
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

        let customPropertiesHeaders = ''
        for (let customProperty of args.customProperties) {
          customPropertiesHeaders += `<th data-dynatable-column="${customProperty.key}">${customProperty.name}</th>`
        }

        let output = `<table id="apwide-gadget-table" class="apwide-table">
                        <thead>
                          <th>Application</th>
                          <th>Category</th>
                          <th>Url</th>
                          <th>Status</th>
                          ${customPropertiesHeaders}
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
            records: toTableRecords(args.environments, args.customProperties)
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

          function getArrValue(prefName){
            let prefValue = gadgets.util.unescapeString(gadget.getPref(prefName))
            let prefArrValue = stringToArray(prefValue)
            return prefArrValue
          }

          function addFilter(searchFilter, filterName, arrValue){
              if (arrValue && arrValue.length > 0){
                searchFilter[filterName] = arrValue
              }
          }

          addFilter(searchFilter, 'applicationId', getArrValue('applicationFilter'))
          addFilter(searchFilter, 'categoryId', getArrValue('categoryFilter'))
          addFilter(searchFilter, 'statusId', getArrValue('statusFilter'))

          return {
            url: searchEnvironmentsUrl(searchFilter)
          }
        }
      },
        {
          key: 'customProperties',
          ajaxOptions: function () {
            return {
              url: getCustomPropertiesUrl()
            }}
        }
      ]
    }
  })
})()
