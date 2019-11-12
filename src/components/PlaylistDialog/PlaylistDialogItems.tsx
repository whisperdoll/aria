import React from "react";
import { FileCache } from "../../utils/cache";
import PlaylistDialogSongItem from "./PlaylistDialogSongItem";
import PlaylistDialogPathItem from "./PlaylistDialogPathItem";
import { PlaylistPath } from "../../utils/datatypes";

interface Props
{
    paths: PlaylistPath[];
    onUpdate: (oldPlaylistPath: PlaylistPath, newPlaylistPath: PlaylistPath) => any;
    onRemove: (playlistPath: PlaylistPath) => any;
}

interface State
{
}

export default class PlaylistDialogItems extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    handleItemRemove(playlistPath: PlaylistPath): void
    {
        this.props.onRemove(playlistPath);
    }

    handleUpdate(oldPlaylistPath: PlaylistPath, newPlaylistPath: PlaylistPath): void
    {
        this.props.onUpdate(oldPlaylistPath, newPlaylistPath);
    }
    
    render()
    {
        let i = 0;
        let list = this.props.paths.map((path) =>
        {
            if (FileCache.getInfo(path.path).stats.isFile())
            {
                return (
                    <PlaylistDialogSongItem
                        onRemove={this.handleItemRemove.bind(this, path)}
                        onUpdate={this.handleUpdate.bind(this)}
                        playlistPath={path}
                        key={i++}
                    />
                );
            }
            else
            {
                return (
                    <PlaylistDialogPathItem
                        onRemove={this.handleItemRemove.bind(this, path)}
                        onUpdate={this.handleUpdate.bind(this)}
                        playlistPath={path}
                        key={i++}
                    />
                );
            }
        });

        return (
            <div
                className="items"
            >
                {list}
            </div>
        );
    }
}