import commands from '../app/commands';

figma.showUI(__html__, {themeColors: true, height: 800});

figma.ui.onmessage = async ({bind, payload, resId}) => {
    console.log('command received');
    const cmd = commands.find((cmd) => cmd.bind === bind);
    const retVal = await cmd.exec(payload);
    console.log(cmd, retVal, resId);
    figma.ui.postMessage({resId, retVal});
};
