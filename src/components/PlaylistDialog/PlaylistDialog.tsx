import React from "react";
import Dialog from "../Dialog";
import { PlaylistData, copyPlaylistData, emptyPlaylistData, PlaylistPath } from "../../utils/datatypes";
import PlaylistDialogItems from "./PlaylistDialogItems";
import { array_remove } from "../../utils/utils";

interface Props
{
    onCancel: () => any;
    onAccept: (playlistData: PlaylistData) => any;
    playlistDatas: PlaylistData[];
    operatingIndex: number;
    showing: boolean;
}

interface State
{
    showing: boolean;
    tempData: PlaylistData;
}

export default class PlaylistDialog extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
            showing: false,
            tempData: emptyPlaylistData()
        };
    }

    componentDidMount()
    {
        this.updateStateFromProps(this.props);
    }

    UNSAFE_componentWillReceiveProps(props: Props)
    {
        this.updateStateFromProps(props);
    }

    updateStateFromProps(props: Props)
    {
        if (props.operatingIndex >= 0)
        {
            let operatingData = this.props.playlistDatas[this.props.operatingIndex];

            this.setState({
                ...this.state,
                tempData: copyPlaylistData(operatingData)
            });
        }
        else
        {
            this.setState({
                ...this.state,
                tempData: emptyPlaylistData()
            });
        }
    }

    handleName(e: React.ChangeEvent<HTMLInputElement>)
    {
        let data = copyPlaylistData(this.state.tempData);
        data.name = e.target.value;

        this.setState({
            ...this.state,
            tempData: data
        });
    }

    handleSort(e: React.ChangeEvent<HTMLInputElement>)
    {
        let data = copyPlaylistData(this.state.tempData);
        data.sort = e.target.value;

        this.setState({
            ...this.state,
            tempData: data
        });
    }

    handleFilter(e: React.ChangeEvent<HTMLInputElement>)
    {
        let data = copyPlaylistData(this.state.tempData);
        data.filter = e.target.value;

        this.setState({
            ...this.state,
            tempData: data
        });
    }

    handleUpdate(oldPlaylistPath: PlaylistPath, newPlaylistPath: PlaylistPath): void
    {
        let data = copyPlaylistData(this.state.tempData);
        let index = this.state.tempData.paths.indexOf(oldPlaylistPath);
        data.paths[index] = newPlaylistPath;

        this.setState({
            ...this.state,
            tempData: data
        });
    }

    handlePathRemove(playlistPath: PlaylistPath): void
    {
        let data = copyPlaylistData(this.state.tempData);
        array_remove(data.paths, playlistPath);

        this.setState({
            ...this.state,
            tempData: data
        });
    }
    
    render()
    {

        let content = (
            <div className="playlistEdit">

                <div className="nameLabel">Name:</div>
                <input
                    className="nameInput"
                    onChange={this.handleName.bind(this)}
                />

                <div className="sortLabel">Sort:</div>
                <input
                    className="sortInput"
                    onChange={this.handleSort.bind(this)}
                />

                <div className="filterLabel">Filter:</div>
                <input
                    className="filterInput"
                    onChange={this.handleFilter.bind(this)}
                />

                <PlaylistDialogItems
                    paths={this.state.tempData.paths}
                    onUpdate={this.handleUpdate.bind(this)}
                    onRemove={this.handlePathRemove.bind(this)}
                />
            </div>
        );

        return (
            <Dialog
                onCancel={this.props.onCancel}
                content={content}
                showing={this.props.showing}
            />
        );
    }
}