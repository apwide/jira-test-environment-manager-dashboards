function renderCustomProperty (environment, propertyId) {
  if (environment) {
    let customProperties = environment.customProperties

    for (let customProperty of customProperties)
      if (customProperty.id === propertyId) {
        let value = customProperty.valueHtml
        return value ? value : ''
    }
  }
  return ''
}

function getCustomProperty (customProperties, propertyId) {
  for (let customProperty of customProperties)
    if (customProperty.id === propertyId) {
      return customProperty
  }
}

function getCustomPropertiesUrl () {
  return '/rest/apwide/tem/1.1/custom-properties?activeOnly=true'
}
