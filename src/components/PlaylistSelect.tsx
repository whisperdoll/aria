import React from 'react';
import { PlaylistData } from '../utils/datatypes';
import "./PlaylistSelect.scss";

interface Props
{
    playlistDatas: PlaylistData[];
    onSelect: (data: PlaylistData) => any;
    onContextMenu: (data: PlaylistData) => any;
}

interface State
{
}

export default class PlaylistSelect extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }
    
    componentDidMount()
    {
    }
    
    handleClick(data: PlaylistData)
    {
        this.props.onSelect(data);
    }

    handleContextMenu(data: PlaylistData): void
    {
        this.props.onContextMenu(data);
    }

    render()
    {
        let items = this.props.playlistDatas.map((data: PlaylistData) =>
        {
            return (
                <div
                    className="item"
                    key={data.name}
                    onDoubleClick={this.handleClick.bind(this, data)}
                    onContextMenu={this.handleContextMenu.bind(this, data)}
                >
                    {data.name}
                </div>
            );
        });

        return (
            <div className="playlistSelect">
                {items}
            </div>
        );
    }
}