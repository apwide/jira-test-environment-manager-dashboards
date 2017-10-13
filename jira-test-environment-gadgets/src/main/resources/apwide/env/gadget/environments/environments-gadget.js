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
  function getAllColumns (customProperties) {
    let shownColumns = [
      {
        name: 'Application',
        id: 'application'
      },
      {
        name: 'Category',
        id: 'category'
      },
      {
        name: 'Status',
        id: 'status'
      },
      {
        name: 'Deployed Version',
        id: 'deployedVersion'
      }
    ]

    for (let customProperty of customProperties) {
      shownColumns.push({
        name: customProperty.name,
        id: customProperty.key
      })
    }
    return shownColumns
  }

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
        },
        {
          key: 'customProperties',
          ajaxOptions: function () {
            return {
              url: getCustomPropertiesUrl()
            }
          }
        }
      ],
      descriptor: function (args) {
        let gadget = this

        let allColumns = getAllColumns(args.customProperties)
        let allColumnIds = []
        for (let shownColumn of allColumns) {
          allColumnIds.push(shownColumn.id)
        }

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
            {
              id: 'shown-columns',
              label: gadget.getMsg('gadget.environments.shown-columns'),
              description: gadget.getMsg('gadget.environments.shown-columns.description'),
              type: 'callbackBuilder',
              userpref: 'shownColumns',
              callback: function (parentDiv) {
                parentDiv.append((select2ValuePicker(gadget, parentDiv, allColumns, 'shownColumns', allColumnIds)))
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

        let shownColumnStringValue = gadgets.util.unescapeString(gadget.getPref('shownColumns'))
        let shownColumnIds = stringToArray(shownColumnStringValue)
        let allColumns = getAllColumns(args.customProperties)

        function columnHeader (column) {
          return `<th data-dynatable-column="${column.id}">${column.name}</th>`
        }

        function showColumn (column) {
          if (shownColumnIds.length === 0)
            return true
          for (let currentId of shownColumnIds) {
            if (column.id === currentId) {
              return true
            }
          }
          return false
        }

        let allHeaders = ''

        for (let column of allColumns) {
          if (showColumn(column)) {
            allHeaders += columnHeader(column)
          }
        }

        let output = `<table id="apwide-gadget-table" class="apwide-table">
                        <thead>
                          ${allHeaders}
                        </thead>
                        <tbody>
                        </tbody>
                      </table>`

        gadget.getView().html(output)

        let table = AJS.$('#apwide-gadget-table').dynatable({
          features: {
            paginate: true,
            sort: true,
            pushState: false,
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

          function getArrValue (prefName) {
            let prefValue = gadgets.util.unescapeString(gadget.getPref(prefName))
            let prefArrValue = stringToArray(prefValue)
            console.log('Array value:', prefArrValue)
            return prefArrValue
          }

          function addFilter (searchFilter, filterName, arrValue) {
            if (arrValue && arrValue.length > 0) {
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
