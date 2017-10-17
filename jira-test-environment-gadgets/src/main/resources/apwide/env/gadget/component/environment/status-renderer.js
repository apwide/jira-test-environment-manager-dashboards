function renderStatus (environment) {
  if (environment) {
    let status = environment.status
    if (status) {
      let lozengeClass = getLozenge(status.color)
      return `<span class="aui-lozenge ${lozengeClass}">${status.name}</span>`
    }
  }
  return ''
}
