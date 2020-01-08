import React from 'react';
import PlaylistItem from './PlaylistItem';
import "./Playlist.scss";
import { FileInfo } from '../utils/cache';
import { Metadata, DefaultMetadata } from '../utils/datatypes';
import * as path from "path";
import { array_contains } from '../utils/utils';

interface Props
{
    fileInfos: FileInfo[];
    onItemClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    onItemDoubleClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selection: FileInfo[];
    currentItem: FileInfo | null;
}

interface State
{

}

export default class Playlist extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
    }

    handleClick(itemInfo: FileInfo, e: React.MouseEvent)
    {
        this.props.onItemClick(itemInfo, e);
    }

    handleDoubleClick(itemInfo: FileInfo, e: React.MouseEvent)
    {
        this.props.onItemDoubleClick(itemInfo, e);
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
                    onClick={this.handleClick}
                    onDoubleClick={this.handleDoubleClick}
                    selected={array_contains(this.props.selection, fileInfo)}
                    playing={this.props.currentItem === fileInfo}
                />
            );
        });
        

        return <div className="playlist">{list}</div>;
    }
}