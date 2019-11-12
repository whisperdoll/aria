import React from 'react';
import { PlaylistData } from '../utils/datatypes';
import "./ContextMenu.scss";
import ContextMenuItem from './ContextMenuItem';

interface Props
{
    showing: boolean;
}

interface State
{
}

export default class ContextMenu extends React.Component<Props, State>
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
                    display: this.props.showing ? "" : "none"
                }}
            >
                {this.props.children}
            </div>
        );
    }
}