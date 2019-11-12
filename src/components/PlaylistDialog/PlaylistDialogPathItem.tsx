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

export default class PlaylistDialogPathItem extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }
    
    handleRemove(): void
    {
        this.props.onRemove();
    }

    update(key: string, value: string): void
    {
        let pp = copyPlaylistPath(this.props.playlistPath);
        switch (key)
        {
            case "path":
            case "sort":
            case "filter":
                pp[key] = value;
                break;
            case "exclude":
                pp[key] = value.split(";");
                break;
        }

        this.props.onUpdate(this.props.playlistPath, pp);
    }

    handlePathClick(): void
    {
        let path = dialog.showOpenDialogSync({
            title: "Add Path...",
            properties: [ "openDirectory" ]
        });

        if (path)
        {
            this.update("path", path[0]);
        }
    }

    handlePathChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.update("path", e.target.value);
    }

    handleSortChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.update("sort", e.target.value);
    }

    handleFilterChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.update("filter", e.target.value);
    }

    handleExcludeChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.update("exclude", e.target.value);
    }

    render()
    {
        const content = (
            <div>

                <div className="label">Path:</div>
                <input
                    type="text"
                    value={this.props.playlistPath.path}
                    onChange={this.handlePathChange.bind(this)}
                    onClick={this.handlePathClick.bind(this)}
                />

                <div className="label">Sort:</div>
                <input
                    type="text"
                    value={this.props.playlistPath.sort}
                    onChange={this.handleSortChange.bind(this)}
                />

                <div className="label">Filter:</div>
                <input
                    type="text"
                    value={this.props.playlistPath.path}
                    onChange={this.handleFilterChange.bind(this)}
                />

                <div className="label">Exclude:</div>
                <input
                    type="text"
                    value={this.props.playlistPath.path}
                    onChange={this.handleExcludeChange.bind(this)}
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