function renderName (environment) {
  if (environment) {
    let url = environment.url
    let name = environment.application.name + ' ' + environment.category.name
    if (url)
      return `<a target="_blank" href="${url}">${name}</a>`
    else {
      return name
    }
  }
  return ''
}
