function renderUrl (environment) {
  if (environment){
    let envUrl = environment.url
    if (envUrl) {
      return `<a target="_blank" href="${envUrl}"><span class="aui-icon aui-icon-small aui-iconfont-link"></span></a>`
    }
  }
  return ''
}
