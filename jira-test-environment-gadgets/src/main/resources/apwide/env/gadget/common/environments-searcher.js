function searchEnvironmentsUrl (searchFilter) {
  let params = AJS.$.param(searchFilter)
  return '/rest/apwide/tem/1.1/environments/search?' + params
}
