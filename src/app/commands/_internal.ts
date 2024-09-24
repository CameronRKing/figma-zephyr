import { CmdGroup } from '../commands';

export default {
    getprop: {
        id: 'property.get',
        label: 'Get property',
        args: [{ name: 'prop', type: 'text' }],
        exec: ({ prop }) => figma.currentPage.selection[0][prop],
        hide: true,
    },
    setprop: {
        id: 'property.set',
        label: 'Set property',
        args: [
            { name: 'prop', type: 'text' },
            { name: 'val', type: 'text' },
        ],
        exec: ({ prop, val }) => figma.currentPage.selection.forEach((node) => (node[prop] = val)),
        hide: true,
    },
} as CmdGroup;
