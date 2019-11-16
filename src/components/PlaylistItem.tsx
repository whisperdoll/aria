import React from 'react';
import "./PlaylistItem.scss";
import { Metadata } from '../utils/datatypes';
import { FileInfo } from "../utils/cache";
const defaultThumbnail = require("../assets/default.png");

interface Props
{
    fileInfo: FileInfo;
    index: number;
    onClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    onDoubleClick: (itemInfo: FileInfo, e: React.MouseEvent) => any;
    selected: boolean;
    playing: boolean;
    metadata: Metadata;
}

interface State
{
}

export default class PlaylistItem extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
        };
    }
    
    componentDidMount()
    {
    }

    getSubtitle(): string
    {
        return this.props.metadata.artist + " — " + this.props.metadata.album +
            (this.props.metadata.track ? "[" + this.props.metadata.track.toString() + "]" : "");
    }

    handleClick(e: React.MouseEvent): void
    {
        this.props.onClick(this.props.fileInfo, e);
    }

    handleDoubleClick(e: React.MouseEvent): void
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
                onClick={this.handleClick.bind(this)}
                onContextMenu={this.handleClick.bind(this)}
                onDoubleClick={this.handleDoubleClick.bind(this)}
            >
                <img
                    className="thumbnail"
                    src={this.props.metadata.picture || defaultThumbnail}
                    alt="thumbnail"
                />
                <div className="shadow"></div>
                <div className="labels">
                    <div className="primaryLabel">{ this.props.metadata.title }</div>
                    <div className="secondaryLabel">{ this.getSubtitle() }</div>
                </div>
            </div>
        );
    }
}