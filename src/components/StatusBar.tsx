import React from 'react';
import { FileInfo, FileCache } from '../utils/cache';
import { Metadata } from '../utils/datatypes';
import { secsToMinSecs } from '../utils/utils';

interface Props
{
    selection: Set<FileInfo>;
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
        let totalTime = selection.size > 0 ? Array.from(selection).map(info => (FileCache.metadata.get(info.fid) as Metadata).length).reduce((l, r) => l + r) : 0;

        infos.push("Selected " + selection.size + " item" + (selection.size === 1 ? "" : "s") +
            " (" + secsToMinSecs(totalTime) + ")");

        return (
            <div id="statusBar">
                {infos.join(" | ")}
            </div>
        )
    }
}