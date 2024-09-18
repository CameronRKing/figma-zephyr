export default {
    lp: {
        name: 'List pages',
        exec: () => figma.root.children.map((page) => page.name),
        hide: true,
    },
    lpc: {
        name: 'List page - current',
        exec: () => figma.currentPage.name,
        hide: true,
    },
    getprop: {
        name: 'Get property',
        args: [{name: 'prop', type: 'text'}],
        exec: ({prop}) => figma.currentPage.selection[0][prop],
        hide: true,
    },
    setprop: {
        name: 'Set property',
        args: [
            {name: 'prop', type: 'text'},
            {name: 'val', type: 'text'},
        ],
        exec: ({prop, val}) => figma.currentPage.selection.forEach((node) => (node[prop] = val)),
    },
    gns: {
        name: 'Get name of selection',
        args: [],
        exec: () => figma.currentPage.selection[0]?.name || '',
        hide: true,
    },
};
