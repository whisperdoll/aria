import React from 'react';
import "./BottomBar.scss";
import WaveBar from "./WaveBar"
import { FileInfo } from '../utils/cache';
import { Metadata } from '../utils/datatypes';

interface Props
{
    onPrevious: () => any;
    onPlayPause: () => any;
    onNext: () => any;
    playing: boolean;
    currentItem: FileInfo | null;
    onPlaybackStart: () => any;
    onPlaybackFinish: () => any;
    metadata: Metadata;
}

interface State
{
    volume: number;
}

export default class BottomBar extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
            volume: 1
        };
    }

    handlePrevious(): void
    {
        this.props.onPrevious();
    }

    handlePlayPause(): void
    {
        this.props.onPlayPause();
    }

    handleNext(): void
    {
        this.props.onNext();
    }

    handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>): void
    {
        this.setState({
            ...this.state,
            volume: parseFloat(e.target.value)
        });
    }

    render()
    {
        let playPause = this.props.playing ? "pause" : "play";
        return (
            <div id="bottomBar">
                <div id="primaryLabel">{this.props.metadata.title}</div>
                <div id="secondaryLabel">{this.props.metadata.artist + " — " + this.props.metadata.album}</div>
                <div id="playerControls">
                    <button
                        className="svgButton"
                        id="previous"
                        onClick={this.handlePrevious.bind(this)}
                    />
                    <button
                        className={"svgButton " + playPause}
                        id="playPause"
                        onClick={this.handlePlayPause.bind(this)}
                    />
                    <button
                        className="svgButton"
                        id="next"
                        onClick={this.handleNext.bind(this)}
                    />
                </div>
                <div id="miscControls">
                    <input
                        type="range"
                        id="volume"
                        min="0"
                        max="1"
                        step="0.01"
                        value={this.state.volume}
                        onChange={this.handleVolumeChange.bind(this)}
                    />
                    <button
                        className="svgButton"
                        id="shuffle"
                    />
                </div>
                <WaveBar
                    currentItem={this.props.currentItem}
                    volume={this.state.volume}
                    onPlaybackStart={this.props.onPlaybackStart}
                    onPlaybackFinish={this.props.onPlaybackFinish}
                    playing={this.props.playing}
                />
            </div>
        );
    }
}