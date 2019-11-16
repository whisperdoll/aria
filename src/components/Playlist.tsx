import React from 'react';
import PlaylistItem from './PlaylistItem';
import "./Playlist.scss";
import { FileInfo } from '../utils/cache';
import { Metadata, DefaultMetadata } from '../utils/datatypes';
import * as path from "path";

interface Props
{
    fileInfos: FileInfo[];
    onItemClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    onItemDoubleClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selection: Set<FileInfo>;
    metadata: Map<string, Metadata>;
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
        console.log("playlist render");
        let i = 0;
        let list = this.props.fileInfos.map((fileInfo) =>
        {
            return (
                <PlaylistItem
                    index={i++}
                    key={fileInfo.fid}
                    fileInfo={fileInfo}
                    onClick={this.handleClick.bind(this)}
                    onDoubleClick={this.handleDoubleClick.bind(this)}
                    selected={this.props.selection.has(fileInfo)}
                    playing={this.props.currentItem === fileInfo}
                    metadata={this.props.metadata.get(fileInfo.fid) || (DefaultMetadata(path.basename(fileInfo.filename)))}
                />
            );
        });

        return <div className="playlist">{list}</div>;
    }
}