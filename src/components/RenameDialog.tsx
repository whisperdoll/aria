import React from "react";
import Dialog from "./Dialog";
import { FileInfo, FileCache } from "../utils/cache";
import { RenameRule } from "../RenameRule";
import * as path from "path";
import * as fs from "fs";
import "./RenameDialog.scss";

interface Props
{
    items: FileInfo[];
    showing: boolean;
    onHide: () => any
}

interface State
{
    showing: boolean;
    renameInput: string;
}

export default class RenameDialog extends React.Component<Props, State>
{
    constructor(props: Props, state: State)
    {
        super(props, state);
        this.state = {
            showing: false,
            renameInput: "%artist% - %album% - %title%"
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleAccept = this.handleAccept.bind(this);
    }
    
    handleChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.setState({
            ...this.state,
            renameInput: e.target.value
        });
    }

    handleAccept(): void
    {
        this.props.items.forEach((item) =>
        {
            FileCache.rename(item, RenameRule.getFilenameFor(item, this.state.renameInput));
        });
        this.props.onHide();
    }

    render(): JSX.Element
    {
        let content = (
            <div id="renameDialog">
                <input
                    id="renameInput"
                    value={this.state.renameInput}
                    onChange={this.handleChange}
                />
                <button
                    id="renameAccept"
                    onClick={this.handleAccept}
                >
                    do it
                </button>
                <div
                    id="renameTokens"
                >
                    {"Available tokens: " + RenameRule.tokenList.map(t => "%" + t + "%").join(", ")}
                </div>
                <table id="renamePreview">
                    <tbody>
                        {this.props.items.map((item) =>
                        {
                            return (
                                <tr key={item.fid}>
                                    <td className="original">
                                        {path.basename(item.filename)}
                                    </td>
                                    <td className="preview">
                                        {RenameRule.getBasenameFor(item, this.state.renameInput)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );

        return (
            <Dialog
                onCancel={this.props.onHide}
                content={content}
                showing={this.props.showing}
            />
        )
    }
}
