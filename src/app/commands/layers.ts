import { CmdGroup } from '../commands';

export default {
    rs: {
        id: 'selection.rename',
        label: 'Rename selection',
        args: [{ name: 'newName', type: 'text', label: 'name', prefill: (runCmd) => runCmd({ bind: 'gns' }) }],
        exec: ({ newName }) => {
            figma.currentPage.selection.forEach((node) => (node.name = newName));
            return figma.currentPage.selection;
        },
    },
    ds: {
        id: 'selection.delete',
        label: 'Delete selection',
        exec: () => {
            figma.currentPage.selection.forEach((node) => node.remove());
        },
    },
    gns: {
        id: 'selection.get_name',
        label: 'Get name of selection',
        exec: () => figma.currentPage.selection[0]?.name || '',
        hide: true,
    },
} as CmdGroup;
