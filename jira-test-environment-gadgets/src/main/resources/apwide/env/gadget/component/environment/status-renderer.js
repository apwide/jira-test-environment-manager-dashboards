function renderStatus (environment) {
  if (environment) {
    let status = environment.status
    if (status) {
      let lozengeClass = getLozengeClass(status.color)
      return `<span class="aui-lozenge ${lozengeClass}">${status.name}</span>`
    }
  }
  return ''
}

function getLozengeClass (color) {
  switch (color) {
    case 'RED':
      return 'aui-lozenge-error'
    case 'YELLOW':
      return 'aui-lozenge-current'
    case 'GREEN':
      return 'aui-lozenge-success'
    case 'BLUE':
      return 'aui-lozenge-complete'
    case 'BROWN':
      return 'aui-lozenge-moved'
    case 'SUBTLE_RED':
      return 'aui-lozenge-error aui-lozenge-subtle'
    case 'SUBTLE_YELLOW':
      return 'aui-lozenge-current aui-lozenge-subtle'
    case 'SUBTLE_GREEN':
      return 'aui-lozenge-success aui-lozenge-subtle'
    case 'SUBTLE_BLUE':
      return 'aui-lozenge-complete aui-lozenge-subtle'
    case 'SUBTLE_BROWN':
      return 'aui-lozenge-moved aui-lozenge-subtle'
    default:
      return ''
  }
}
