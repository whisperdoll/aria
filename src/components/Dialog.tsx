import React from "react";

interface Props
{
    onCancel: () => any;
    content: JSX.Element;
    showing: boolean;
}

interface State
{
}

export default class Dialog extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    handleBackdropClick(e: React.MouseEvent)
    {
        this.props.onCancel && this.props.onCancel();
    }

    handleDialogClick(e: React.MouseEvent)
    {
        e.stopPropagation();
    }

    render()
    {
        return (
            <div
                className="dialog-backdrop"
                style={{
                    display: this.props.showing ? "" : "none"
                }}
                onClick={this.handleBackdropClick.bind(this)}
            >
                <div
                    className="dialog"
                    onClick={this.handleDialogClick.bind(this)}
                >
                    {this.props.content}
                </div>
            </div>
        );
    }
}