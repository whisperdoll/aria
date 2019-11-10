import React from 'react';
import "./PlaylistItem.scss";
import { Metadata, DefaultMetadata } from '../utils/datatypes';
import { FileCache, FileInfo } from "../utils/cache";
const defaultThumbnail = require("../assets/default.png");

interface Props
{
    fileInfo: FileInfo;
    index: number;
    onClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selected: boolean;
}

interface State
{
    metadata: Metadata
}

export default class PlaylistItem extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
            metadata: DefaultMetadata
        };
    }
    
    componentDidMount()
    {
        FileCache.getMetadata(
            this.props.fileInfo.filename,
            this.props.fileInfo.fid,
            (metadata) =>
            {
                this.setState({
                    ...this.state,
                    metadata
                });
            }
        );
    }

    getSubtitle(): string
    {
        return this.state.metadata.artist + " — " + this.state.metadata.album +
            (this.state.metadata.track ? "[" + this.state.metadata.track.toString() + "]" : "");
    }

    handleClick(e: React.MouseEvent): void
    {
        this.props.onClick(this.props.fileInfo, e);
    }

    render()
    {
        let className = "playlistItem";
        className += (this.props.index % 2 === 0 ? " even" : " odd");
        if (this.props.selected)
        {
            className += " selected";
        }

        return (
            <div
                className={className}
                onClick={this.handleClick.bind(this)}
                onContextMenu={this.handleClick.bind(this)}
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