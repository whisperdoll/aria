import React from 'react';
import "./FilterBox.scss";
import { FilterInfo } from './Filter';

interface Props
{
    filter: FilterInfo;
    onFilter: (filter: FilterInfo) => any;
}

interface State
{
}

export default class FilterBox extends React.PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
        };
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>)
    {
        this.props.onFilter({
            appliedPart: e.target.value,
            previewPart: ""
        });
    }

    render()
    {
        return (
            <div
                className="filterContainer"
            >
                <input
                    type="text"
                    className="filter"
                    onChange={this.handleChange.bind(this)}
                    value={this.props.filter.appliedPart}
                    placeholder="Filter..."
                />
            </div>
        );
    }
}