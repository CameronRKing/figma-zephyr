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
    ap: {
        bind: 'ap',
        name: 'Add page',
        args: [{name: 'name', type: 'text', label: 'New page name'}],
        exec: ({name}) => {
            figma.createPage().name = name;
        },
    },
    jp: {
        bind: 'jp',
        name: 'Jump to page',
        args: [
            {
                name: 'name',
                type: 'select',
                label: 'Jump to',
                options: (runCmd) => runCmd({bind: 'lp'}),
            },
        ],
        exec: ({name}) => {
            figma.currentPage = figma.root.children.find((node) => node.name === name);
        },
    },
    np: {
        bind: 'np',
        name: 'Rename current page',
        args: [{name: 'newName', type: 'text', label: 'Rename page to', prefill: (runCmd) => runCmd({bind: 'lpc'})}],
        exec: ({newName}) => {
            figma.currentPage.name = newName;
        },
    },
    dp: {
        bind: 'dp',
        name: 'Delete current page',
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
}