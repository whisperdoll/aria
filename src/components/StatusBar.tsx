import React from 'react';
import { FileInfo, FileCache } from '../utils/cache';
import { Metadata } from '../utils/datatypes';
import { secsToMinSecs } from '../utils/utils';

interface Props
{
    selection: FileInfo[];
    rerenderSwitch: boolean;
}

interface State
{
}

export default class StatusBar extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    render()
    {
        let selection = this.props.selection;
        let infos = [];
        let totalTime = selection.length > 0 ? selection.map(info => FileCache.metadata.get(info.fid) ? FileCache.metadata.get(info.fid)!.length : 0).reduce((l, r) => l + r) : 0;

        infos.push("Selected " + selection.length + " item" + (selection.length === 1 ? "" : "s") +
            " (" + secsToMinSecs(totalTime) + ")");

        const plays = selection.map(info => FileCache.metadata.get(info.fid) ? FileCache.metadata.get(info.fid)!.plays.length : 0);
        if (plays.length > 0)
        {
            infos.push("Total plays: " + (plays.length > 1 ? plays.reduce((l, r) => l + r).toString() : plays[0].toString()));
        }

        return (
            <div id="statusBar">
                {infos.join(" | ")}
            </div>
        )
    }
}