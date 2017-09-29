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

        let output = `<table id="delayedSortedTable" class="aui apwide-gadget-table issue-table aui-table-sortable aui aui-table-interactive table-hover-row">
                        <thead>
                          <tr>
                            <th class="aui-table-column-application">Application</th>
                            <th>Category</th>
                            <th>Deployed Version</th>
                            <th class="aui-table-column-unsortable">Status</th>
                          <tr>
                        </thead>
                        <tbody>`

        let environments = args.environments
        for (var environment of environments) {
          output += `<tr>
                      <td>${environment.application.name}</td>
                      <td>${environment.category.name}</td>
                      <td>${'todo'}</td>
                      <td>${'todo'}</td>
                    </tr>`
        }

        output += `</tbody>
                  </table>`

        gadget.getView().html(output)

        AJS.tablessortable.setTableSortable(AJS.$('#delayedSortedTable'))
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
