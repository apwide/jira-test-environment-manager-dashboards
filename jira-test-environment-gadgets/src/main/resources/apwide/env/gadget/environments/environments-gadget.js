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
    deployedVersion: deployedVersion,
    deployedVersionAndStatus: renderVersionStatus(environment),
    name: renderName(environment)
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
        name: 'Name',
        id: 'name'
      },
      {
        name: 'Application',
        id: 'application'
      },
      {
        name: 'Category',
        id: 'category'
      },
      {
        name: 'Url',
        id: 'url'
      },
      {
        name: 'Status',
        id: 'status'
      },
      {
        name: 'Deployed Version',
        id: 'deployedVersion'
      },
      {
        name: 'Version/Status',
        id: 'deployedVersionAndStatus'
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

  let gadgetDefinition = {
    baseUrl: ATLASSIAN_BASE_URL,
    useOauth: '/rest/gadget/1.0/currentUser',
    config: {
      args: [
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
        console.log('gadget3:', gadget)

        let allColumns = getAllColumns(args.customProperties)
        let allColumnIds = []
        for (let shownColumn of allColumns) {
          allColumnIds.push(shownColumn.id)
        }

        return {
          fields: [
            {
              id: 'shown-columns-picker',
              label: gadget.getMsg('apwide.environment.shown-columns'),
              type: 'callbackBuilder',
              userpref: 'shown-columns',
              callback: function (parentDiv) {
                parentDiv.append((select2ValuePicker(gadget, parentDiv, allColumns, 'shown-columns', allColumnIds)))
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

        let shownColumnStringValue = gadgets.util.unescapeString(gadget.getPref('shown-columns'))
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
      args: [
        {
          key: 'customProperties',
          ajaxOptions: function () {
            return {
              url: getCustomPropertiesUrl()
            }}
        }
      ]
    }
  }
  APWIDE.Subtitle.init(gadgetDefinition, 'Apwide Environments')
  APWIDE.EnvironmentSearcher.init(gadgetDefinition)
  let gadget = AJS.Gadget(gadgetDefinition)
})()
