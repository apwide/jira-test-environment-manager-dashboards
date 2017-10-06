function applicationPicker (gadget, parentDiv, applications, name) {

  const SEPARATOR = "::"
  let currentStringValue = gadget.getPref(name)
  let currentValues = currentStringValue.split(SEPARATOR)
  let options = getOptions(applications, currentValues)

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
    let stringValue = values.join(SEPARATOR)
    AJS.$('#' + name).val(stringValue)
    gadget.resize()
  })
}

function getOptions (applications, currentValues) {
  let options = ''
  for (let application of applications) {
    let selected = currentValues.includes(''+application.id) ? 'selected' : ''
    options += `<option value="${application.id}" ${selected}>${application.name}</option>`
  }
  return options
}
