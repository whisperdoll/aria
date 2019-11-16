import React from 'react';
import { PlaylistData } from '../utils/datatypes';
import "./ContextMenu.scss";
import ContextMenuItem from './ContextMenuItem';

interface Props
{
    showing: boolean;
    x: number;
    y: number;
}

interface State
{
}

export default class ContextMenu extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }
    
    componentDidMount()
    {
    }

    render()
    {
        return (
            <div
                className="contextMenu"
                style={{
                    display: this.props.showing ? "" : "none",
                    position: "absolute",
                    left: this.props.x + "px",
                    top: this.props.y + "px"
                }}
            >
                {this.props.children}
            </div>
        );
    }
}