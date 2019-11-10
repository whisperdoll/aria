import React from 'react';
import PlaylistItem from './PlaylistItem';
import "./Playlist.scss";
import { FileInfo } from '../utils/cache';

interface Props
{
    fileInfos: FileInfo[];
    filter: string;
    onItemClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selection: Set<FileInfo>;
}

interface State
{

}

export default class Playlist extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    handleClick(itemInfo: FileInfo, e: React.MouseEvent)
    {
        this.props.onItemClick(itemInfo, e);
    }

    render()
    {
        let i = 0;
        let list = this.props.fileInfos.map((fileInfo) =>
        {
            return (
                <PlaylistItem
                    index={i++}
                    key={fileInfo.fid}
                    fileInfo={fileInfo}
                    onClick={this.handleClick.bind(this)}
                    selected={this.props.selection.has(fileInfo)}
                />
            );
        });

        return <div className="playlist">{list}</div>;
    }
}