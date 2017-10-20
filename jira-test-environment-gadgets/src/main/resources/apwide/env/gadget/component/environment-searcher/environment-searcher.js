function addEnvironmentsSearch (gadgetDefinition) {
  let origDescriptor = gadgetDefinition.config.descriptor

  let newDescriptor = function (args) {
    let gadget = this
    let fields = origDescriptor.call(gadget, args).fields
    let newFields = getEnviromentFilterPrefFields(args, gadget)
    fields.push(...newFields)
    return {
      fields: fields
    }
  }
  gadgetDefinition.config.descriptor = newDescriptor
  gadgetDefinition.config.args.push(...getEnvironmentsConfigArgs())
  gadgetDefinition.view.args.push(getEnvironmentsViewArg())

  return gadgetDefinition
}

function searchEnvironmentsUrl (searchFilter) {
  const url = '/rest/apwide/tem/1.1/environments/search'
  if (searchFilter) {
    let params = AJS.$.param(searchFilter)
    return url + '?' + params
  }else {
    return url
  }
}

function getEnvironmentsViewArg () {
  let gadget = this
  return {
    key: 'environments',
    ajaxOptions: function () {
      let gadget = this
      let searchFilter = {}

      function getArrValue (prefName) {
        let prefValue = gadgets.util.unescapeString(gadget.getPref(prefName))
        let prefArrValue = stringToArray(prefValue)
        return prefArrValue
      }

      function addFilter (searchFilter, filterName, arrValue) {
        if (arrValue && arrValue.length > 0) {
          searchFilter[filterName] = arrValue
        }
      }

      addFilter(searchFilter, 'applicationId', getArrValue('application-filter'))
      addFilter(searchFilter, 'categoryId', getArrValue('category-filter'))
      addFilter(searchFilter, 'statusId', getArrValue('status-filter'))

      return {
        url: searchEnvironmentsUrl(searchFilter)
      }
    }
  }
}

function getEnvironmentsConfigArgs () {
  return [
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
  ]
}

function getEnviromentFilterPrefFields (args, gadget) {
  console.log('gadget2:', gadget)
  return [
    {
      id: 'application-picker',
      label: gadget.getMsg('apwide.environment.application-filter'),
      type: 'callbackBuilder',
      userpref: 'application-filter',
      callback: function (parentDiv) {
        parentDiv.append((select2ValuePicker(gadget, parentDiv, args.applications, 'application-filter')))
      }
    },
    {
      id: 'category-picker',
      label: gadget.getMsg('apwide.environment.category-filter'),
      type: 'callbackBuilder',
      userpref: 'category-filter',
      callback: function (parentDiv) {
        parentDiv.append((select2ValuePicker(gadget, parentDiv, args.categories, 'category-filter')))
      }
    },
    {
      id: 'status-picker',
      label: gadget.getMsg('apwide.environment.status-filter'),
      type: 'callbackBuilder',
      userpref: 'status-filter',
      callback: function (parentDiv) {
        parentDiv.append((select2ValuePicker(gadget, parentDiv, args.statuses, 'status-filter')))
      }
    }
  ]
}
