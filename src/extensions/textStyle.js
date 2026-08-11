import { Mark } from '@tiptap/core'

export const TextStyleWithClass = Mark.create({
  name: 'textStyle',

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => attributes.class ? { class: attributes.class } : {},
      },
    }
  },

  parseHTML() {
    return [{
      tag: 'span',
      getAttrs: (element) =>
        element.hasAttribute('class') || element.hasAttribute('style') ? {} : false,
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ state, commands }) => {
        const attrs = state.selection.$from.marks().find((m) => m.type.name === this.name)?.attrs
        const hasAnyAttr = attrs && Object.entries(attrs).some(([, v]) => !!v)
        return hasAnyAttr ? true : commands.unsetMark(this.name)
      },
    }
  },
})
