import { CmdGroup } from '../commands';
import { clone, curr, preloadSelectedFonts } from '../utils';

export default {
    getprop: {
        id: 'property.get',
        label: 'Get property',
        args: [{ name: 'prop', type: 'text' }],
        exec: ({ prop }) => figma.currentPage.selection[0][prop],
        hide: true,
    },
    getobjprop: {
        id: 'property.get_nested',
        label: 'Get object property',
        args: [
            { name: 'prop', type: 'text' },
            { name: 'key', type: 'text' },
        ],
        exec: ({ prop, key }) => curr()[0][prop][key],
        hide: true,
    },
    setprop: {
        id: 'property.set',
        label: 'Set property',
        args: [
            { name: 'prop', type: 'text' },
            { name: 'val', type: 'text' },
        ],
        exec: async ({ prop, val }) => {
            // must pre-load all fonts before changing ANY font-related property
            // in practice, this permanent check doesn't seem to affect performance
            // ... considering preloading all fonts on plugin start, but concerned about performance
            await preloadSelectedFonts();

            curr().forEach((node) => (node[prop] = val));
        },
        hide: true,
    },
    setobjprop: {
        id: 'property.set_nested',
        label: 'Set object property',
        args: [
            { name: 'prop', type: 'text' },
            { name: 'key', type: 'text' },
            { name: 'val', type: 'text' },
        ],
        exec: async ({ prop, key, val }) => {
            // must pre-load all fonts before changing ANY font-related property
            // in practice, this permanent check doesn't seem to affect performance
            await preloadSelectedFonts();

            curr().forEach((node) => {
                const cl = clone(node[prop]);
                cl[key] = val;
                node[prop] = cl;
            });
        },
        hide: true,
    },
} as CmdGroup;
