import * as React from 'react';
import { useState, useEffect } from 'react';
// import { Text } from 'react-figma-plugin-ds';
import '../styles/ui.css';
import '../styles/util.css';
import commands, { RunCmdFn, Cmd } from '../commands';
import ArgsGetter from './ArgsGetter';

const visibleCmds = commands.filter((cmd) => !cmd.hide);

const useCmds = (parent) => {
    const [cbs, setCbs] = useState({});

    const runCmd: RunCmdFn = React.useCallback(
        (msg) => {
            const id = Math.random();
            return new Promise((resolve, reject) => {
                // set up response chain
                const timeoutMs = 5000;
                const timeout = setTimeout(
                    () => reject('No response received within ' + timeoutMs + 'ms for ' + JSON.stringify(msg)),
                    timeoutMs
                );
                setCbs({
                    ...cbs,
                    [id]: (retVal) => {
                        // clean up handler/timeout
                        clearTimeout(timeout);
                        const newCbs = { ...cbs };
                        delete newCbs[id];
                        setCbs(newCbs);

                        // return response from command
                        resolve(retVal);
                    },
                });

                // run cmd
                parent.postMessage({ pluginMessage: { ...msg, resId: id } }, '*');
            });
        },
        [cbs]
    );

    const respondToMessage = React.useCallback(
        ({ pluginMessage }) => {
            const { resId, retVal } = pluginMessage;
            // console.log({ resId, retVal });
            if (resId && cbs[resId]) cbs[resId](retVal);
        },
        [cbs]
    );

    useEffect(() => {
        onmessage = (msg) => {
            if (msg.data === 'focus') {
                // special command, not part of the set; set up by dropping code into the console (see cmds.fh)
                /* @ts-ignore */
                document.querySelector('#zephyr')?.focus();
                return;
            }
            respondToMessage(msg.data);
        };
    }, [respondToMessage]);

    return runCmd;
};

const App = ({}) => {
    const [inputVal, setInputVal] = useState('');
    const [matches, setMatches] = useState(visibleCmds);
    const [match, setMatch] = useState<Cmd<any>>(null);

    const runCmd = useCmds(window.parent);

    useEffect(() => {
        if (!inputVal.endsWith(' ')) {
            if (inputVal === '') {
                setMatches(visibleCmds);
            } else {
                setMatches(
                    visibleCmds.filter((cmd) => cmd.bind.startsWith(inputVal))
                    // .concat(visibleCmds.filter((cmd) => cmd.bind.match(inputVal)))
                    // .concat(visibleCmds.filter((cmd) => cmd.label.match(inputVal)))
                );
            }
            return;
        }

        const bind = inputVal.replace(' ', '');
        const match = visibleCmds.find((cmd) => cmd.bind === bind);
        if (match) {
            // todo: update typing
            setMatch(match);
            if (!match.args) runCmd({ bind: match.bind }).then(() => setMatch(null));
        } else {
            setMatch(undefined);
        }

        setInputVal('');
    }, [inputVal]);

    const fullRunCmd = React.useCallback(
        (payload) => {
            runCmd({ bind: match.bind, payload }).then(() => setMatch(null));
        },
        [match]
    );

    const reset = React.useCallback(() => {
        setMatch(undefined);
        setInputVal('');
    }, []);

    const maybeEscape = React.useCallback((evt: React.KeyboardEvent) => {
        if (evt.key === 'Escape') {
            runCmd({ bind: 'xz' });
        }
    }, []);

    return (
        <div>
            {match && match.args ? (
                <ArgsGetter args={match.args} onFinish={fullRunCmd} onCancel={reset} runCmd={runCmd} />
            ) : (
                <div className="dfc ais mx2">
                    <div className="df jb px1">
                        <span className="caption">
                            Ⅹ <b>Esc</b>
                        </span>
                        <span className="caption">
                            <b>Space</b> ✔
                        </span>
                    </div>
                    <b className="label">Action sequence</b>
                    <input
                        id="zephyr"
                        value={inputVal}
                        onChange={(event) => setInputVal(event.target.value)}
                        autoFocus
                        onKeyDown={maybeEscape}
                    />
                    <table style={{ paddingLeft: 4 }}>
                        <tbody>
                            {matches.map((cmd) => (
                                <tr key={cmd.bind}>
                                    <td>
                                        <pre>
                                            <b>{cmd.bind}</b>
                                        </pre>
                                    </td>
                                    <td>-</td>
                                    <td style={{ paddingTop: 4, paddingBottom: 4 }}>{cmd.label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;
