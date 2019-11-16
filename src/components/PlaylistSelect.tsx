import React from 'react';
import { PlaylistData } from '../utils/datatypes';
import "./PlaylistSelect.scss";

interface Props
{
    playlistDatas: PlaylistData[];
    onSelect: (data: PlaylistData) => any;
    onContextMenu: (data: PlaylistData, x: number, y: number) => any;
}

interface State
{
}

export default class PlaylistSelect extends React.PureComponent<Props, State>
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

    handleContextMenu(data: PlaylistData, e: React.MouseEvent): void
    {
        this.props.onContextMenu(data, e.clientX, e.clientY);
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
                    onContextMenu={(e) => this.handleContextMenu(data, e)}
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