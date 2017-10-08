const VALUE_SEPARATOR = '::'

function select2ValuePicker (gadget, parentDiv, allValues, name) {
  let currentStringValue = gadget.getPref(name)
  let currentValues = stringToArray(currentStringValue)
  let options = getOptions(allValues, currentValues)

  parentDiv.append(
    `<form class="aui">
        <select id="select2-${name}" multiple="">
            ${options}
        </select>
    </form>
    <input type="hidden" id="${name}" name="${name}" value="${currentStringValue}"/>`
  )

  AJS.$('#select2-' + name).auiSelect2().on('change', function (e) {
    let values = e.val
    let stringValue = arrayToString(values)
    AJS.$('#' + name).val(stringValue)
    gadget.resize()
  })
}

function getOptions (allValues, currentValues) {
  let options = ''
  for (let value of allValues) {
    let selected = currentValues.includes('' + value.id) ? 'selected' : ''
    options += `<option value="${value.id}" ${selected}>${value.name}</option>`
  }
  return options
}

function stringToArray(stringValues){
  if (stringValues){
    return stringValues.split(VALUE_SEPARATOR)
  }
    else{
      return []
    }
}

function arrayToString(arrValues){
  if (arrValues){
    return arrValues.join(VALUE_SEPARATOR)
  }
    else{
      return ''
    }
}
