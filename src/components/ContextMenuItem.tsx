import React from 'react';
import { PlaylistData } from '../utils/datatypes';
import "./ContextMenu.scss";

interface Props
{
    showing: boolean;
    text: string;
    onClick: () => any;
}

interface State
{
}

export default class ContextMenuItem extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    handleClick(): void
    {
        this.props.onClick();
    }

    render()
    {
        return (
            <div
                className="contextMenuItem"
                onClick={this.handleClick.bind(this)}
                style={{
                    display: this.props.showing ? "" : "none"
                }}
            >
                {this.props.text}
            </div>
        );
    }
}