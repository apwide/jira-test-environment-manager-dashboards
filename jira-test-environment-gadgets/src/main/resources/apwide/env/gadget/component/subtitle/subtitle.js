function addSubtitle (gadgetDefinition, title = 'Please set a title') {
  let origDescriptor = gadgetDefinition.config.descriptor

  let newDescriptor = function (args) {
    let gadget = this
    let fields = origDescriptor.call(gadget, args).fields
    fields.push({
      id: 'subtitle-input',
      userpref: 'subtitle',
      label: gadget.getMsg('apwide.subtitle'),
      description: gadget.getMsg('apwide.subtitle.description'),
      type: 'text',
      value: gadget.getPref('subtitle')
    })
    return {
      fields: fields
    }
  }
  gadgetDefinition.config.descriptor = newDescriptor

  let origTemplate = gadgetDefinition.view.template

  let newTemplate = function (args) {
    let gadget = this
    origTemplate.call(gadget, args)
    let subtitle = gadget.getPref('subtitle')
    if (subtitle) {
      gadgets.window.setTitle(title + ': ' + subtitle)
    }
    gadget.resize()
  }
  gadgetDefinition.view.template = newTemplate

  return gadgetDefinition
}
