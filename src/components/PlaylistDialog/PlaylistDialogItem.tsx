import React from "react";

interface Props
{
    class: string;
    content: JSX.Element;
    onRemove: () => any;
}

interface State
{
}

export default class PlaylistDialogItem extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }
    
    handleRemove(): void
    {
        this.props.onRemove();
    }

    render()
    {
        return (
            <div
                className={"item " + this.props.class}
            >
                {this.props.content}
                <button
                    className="remove"
                    onClick={this.handleRemove.bind(this)}
                >
                    Remove
                </button>
            </div>
        );
    }
}