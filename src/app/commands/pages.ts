import { CmdGroup } from '../commands';

export default {
    lp: {
        id: 'pages.list',
        label: 'List pages',
        exec: () => figma.root.children.map((page) => page.name),
        hide: true,
    },
    lpc: {
        id: 'pages.list_current',
        label: 'List page - current',
        exec: () => figma.currentPage.name,
        hide: true,
    },
    ap: {
        id: 'pages.add',
        label: 'Add page',
        args: [{ name: 'name', type: 'text', label: 'New page name' }],
        exec: ({ name }) => {
            figma.createPage().name = name;
        },
    },
    jp: {
        id: 'pages.jump_to',
        label: 'Jump to page',
        args: [
            {
                name: 'name',
                type: 'select',
                label: 'Jump to',
                options: (runCmd) => runCmd({ bind: 'lp' }),
            },
        ],
        exec: ({ name }) => {
            figma.currentPage = figma.root.children.find((node) => node.name === name);
        },
    },
    np: {
        id: 'pages.rename_current',
        label: 'Rename current page',
        args: [
            { name: 'newName', type: 'text', label: 'Rename page to', prefill: (runCmd) => runCmd({ bind: 'lpc' }) },
        ],
        exec: ({ newName }) => {
            figma.currentPage.name = newName;
        },
    },
    dp: {
        id: 'pages.delete_current',
        label: 'Delete current page',
        exec: () => {
            const pages = figma.root.children;
            const numPages = pages.length;
            if (numPages === 1) return;

            const oldPage = figma.currentPage;
            const idx = pages.indexOf(oldPage);
            const newIdx = (idx + 1) % numPages;
            figma.currentPage = pages[newIdx];
            oldPage.remove();
        },
    },
} as CmdGroup;
