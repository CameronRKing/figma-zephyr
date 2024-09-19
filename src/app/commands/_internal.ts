export default {
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
};
