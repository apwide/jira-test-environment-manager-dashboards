function renderVersionStatus (environment) {
  if (environment) {
    let status = environment.status
    let deployedVersion = environment.deployment ? environment.deployment.versionName : 'None'
    let statusColor = status ? status.color : ''
    let statusName = status ? status.name : 'None'
    let lozengeClass = getLozenge(statusColor)

    return `<span class="aui-lozenge ${lozengeClass}" title="Status: ${statusName}, Deployed version: ${deployedVersion}">${deployedVersion}</span>`
  }
  return ''
}
