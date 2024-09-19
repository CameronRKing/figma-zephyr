export default {
    rs: {
        bind: 'rs',
        name: 'Rename selection',
        args: [{name: 'newName', type: 'text', label: 'name', prefill: (runCmd) => runCmd({bind: 'gns'})}],
        exec: ({newName}) => {
            figma.currentPage.selection.forEach((node) => (node.name = newName));
            return figma.currentPage.selection;
        },
    },
    ds: {
        bind: 'ds',
        name: 'Delete selection',
        exec: () => {
            figma.currentPage.selection.forEach((node) => node.remove());
        },
    },
    gns: {
        name: 'Get name of selection',
        exec: () => figma.currentPage.selection[0]?.name || '',
        hide: true,
    },
}