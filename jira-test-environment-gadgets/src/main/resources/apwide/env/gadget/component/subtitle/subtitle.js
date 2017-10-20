define('apwide/gadget/subtitle', [], function () {
  function addSubtitle (gadgetDefinition, title = 'Please set a title') {
    let origDescriptor = gadgetDefinition.config.descriptor

    let newDescriptor = function (args) {
      let gadget = this
      let fields = []
      fields.push({
        id: 'subtitle-input',
        userpref: 'subtitle',
        label: gadget.getMsg('apwide.subtitle'),
        description: gadget.getMsg('apwide.subtitle.description'),
        type: 'text',
        value: gadget.getPref('subtitle')
      })
      fields.push(...origDescriptor.call(gadget, args).fields)
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
  return { init: addSubtitle}
})
AJS.namespace('APWIDE.Subtitle', null, require('apwide/gadget/subtitle'))
