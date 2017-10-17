function searchEnvironmentsUrl (searchFilter) {
  const url = '/rest/apwide/tem/1.1/environments/search'
  if (searchFilter) {
    let params = AJS.$.param(searchFilter)
    return url + '?' + params
  }else {
    return url
  }
}
