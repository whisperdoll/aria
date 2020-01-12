import React from 'react';
import "./PlaylistItem.scss";
import { Metadata, DefaultMetadata } from '../utils/datatypes';
import { FileInfo, FileCache } from "../utils/cache";
const defaultThumbnail = require("../assets/default.png");

interface Props
{
    fileInfo: FileInfo;
    index: number;
    onClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    onDoubleClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selected: boolean;
    playing: boolean;
}

interface State
{
    metadata: Metadata;
}

export default class PlaylistItem extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
            metadata: FileCache.metadata.get(this.props.fileInfo.fid) || DefaultMetadata(this.props.fileInfo.filename)
        };

        FileCache.subscribeToFid(this.props.fileInfo.fid, this.handleMetadataUpdate);
    }

    handleMetadataUpdate = (fid: string, metadata: Metadata) =>
    {
        this.setState(state => ({
            ...state,
            metadata
        }));

        this.forceUpdate();
    }
    
    componentDidMount()
    {
    }

    componentWillUnmount = () =>
    {
        FileCache.unsubscribeFromFid(this.props.fileInfo.fid, this.handleMetadataUpdate);
    }

    getSubtitle(): string
    {
        return this.state.metadata.artist + " — " + this.state.metadata.album +
            (this.state.metadata.track ? "[" + this.state.metadata.track.toString() + "]" : "");
    }

    handleClick = (e: React.MouseEvent) =>
    {
        this.props.onClick(this.props.fileInfo, e);
    }

    handleDoubleClick = (e: React.MouseEvent) =>
    {
        this.props.onDoubleClick(this.props.fileInfo, e);
    }

    render()
    {
        let className = "playlistItem";
        className += (this.props.index % 2 === 0 ? " even" : " odd");
        if (this.props.selected)
        {
            className += " selected";
        }
        if (this.props.playing)
        {
            className += " playing";
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                onContextMenu={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
            >
                <img
                    className="thumbnail"
                    src={this.state.metadata.picture || defaultThumbnail}
                    alt="thumbnail"
                />
                <div className="shadow"></div>
                <div className="labels">
                    <div className="primaryLabel">{ this.state.metadata.title }</div>
                    <div className="secondaryLabel">{ this.getSubtitle() }</div>
                </div>
            </div>
        );
    }
}