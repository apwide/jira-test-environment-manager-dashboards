function applicationPicker (parentDiv) {
  parentDiv.append(
    `<form class="aui">
        <select id="select2-example" multiple="">
            ${getOptions()}
        </select>
    </form>`
  )
  AJS.$('#select2-example').auiSelect2()
}

function getOptions () {
  let applications = getApplications()
  let options = ''
  for (let application of applications) {
    options += `<option value="${application.id}">${application.name}</option>`
  }
  return options
}

function getApplications () {
  // var applications
  // AJS.$.ajax({
  //   url: AJS.contextPath() + 'tem/V1.1/applications',
  //   async: false,
  //   contentType: 'application/json',
  //   success: function (data) {
  //     applications = data
  //   }
  // })
  return [{name: 'eCommerce', id: 1}, {name: 'ERP', id: 2}]
}
