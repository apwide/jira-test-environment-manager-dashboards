function getCustomProperty (environment, propertyId) {
  if (environment) {
    let customProperties = environment.customProperties

    for (let customProperty of customProperties)
      if (customProperty.id === propertyId) {
        let value = customProperty.valueHtml
        return {
          name: customProperty.name,
          value: value?value:''
        }
    }
  }

  return
}
