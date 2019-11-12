import React from "react";
import PlaylistDialogItem from "./PlaylistDialogItem";
import { PlaylistPath, copyPlaylistPath } from "../../utils/datatypes";
import { dialog } from "electron";
import { AllowedExtensions } from "../../App";

interface Props
{
    onRemove: () => any;
    onUpdate: (oldPlaylistPath: PlaylistPath, newPlaylistPath: PlaylistPath) => any
    playlistPath: PlaylistPath;
}

interface State
{
}

export default class PlaylistDialogSongItem extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }
    
    handleRemove(): void
    {
        this.props.onRemove();
    }

    updatePath(path: string): void
    {
        let pp = copyPlaylistPath(this.props.playlistPath);
        pp.path = path;
        this.props.onUpdate(this.props.playlistPath, pp);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.updatePath(e.target.value);
    }

    handleClick(): void
    {
        const path = dialog.showOpenDialogSync({
            title: "Add Song...",
            filters:
            [
                {
                    name: "Music file",
                    extensions: AllowedExtensions
                },
                {
                    name: "All Files",
                    extensions: ["*"]
                }
            ],
            properties: [ "openFile" ]
        });

        if (path)
        {
            this.updatePath(path[0]);
        }
    }

    render()
    {
        const content = (
            <div>
                <input
                    type="text"
                    value={this.props.playlistPath.path}
                    onChange={this.handleChange.bind(this)}
                    onClick={this.handleClick.bind(this)}
                />
            </div>
        );

        return (
            <PlaylistDialogItem
                class="song"
                onRemove={this.handleRemove.bind(this)}
                content={content}
            />
        );
    }
}