import React from 'react';
import "./PlaylistItem.scss";
import { Metadata, DefaultMetadata } from '../utils/datatypes';
import { FileCache, FileInfo } from "../utils/cache";
const defaultThumbnail = require("../assets/default.png");

interface Props
{
    fileInfo: FileInfo;
    index: number;
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

    render()
    {
        return (
            <div className={"playlistItem" + (this.props.index % 2 === 0 ? " even" : " odd")}>
                <img className="thumbnail" src={this.state.metadata.picture || defaultThumbnail} />
                <div className="shadow"></div>
                <div className="labels">
                    <div className="primaryLabel">{ this.state.metadata.title }</div>
                    <div className="secondaryLabel">{ this.getSubtitle() }</div>
                </div>
            </div>
        );
    }
}