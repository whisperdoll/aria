import React from 'react';
import "./BottomBar.scss";
import WaveBar from "./WaveBar"
import { FileInfo } from '../utils/cache';
import { Metadata } from '../utils/datatypes';
import { secsToMinSecs } from '../utils/utils';

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
    onTimeChange: (currentSeconds: number, durationSeconds: number) => any;
    currentSeconds: number;
    durationSeconds: number;
    shuffled: boolean;
    onShuffleToggle: (shuffled: boolean) => any;
}

interface State
{
    volume: number;
}

export default class BottomBar extends React.PureComponent<Props, State>
{
    private waveBar: React.RefObject<WaveBar>;

    constructor(props: Props)
    {
        super(props);
        this.state = {
            volume: 1
        };

        this.waveBar = React.createRef();

        this.handleNext = this.handleNext.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.handleShuffleToggle = this.handleShuffleToggle.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
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

    handleShuffleToggle(): void
    {
        this.props.onShuffleToggle(!this.props.shuffled);
    }

    public restartSong(): void
    {
        if (!this.waveBar.current) return;
        this.waveBar.current.restartSong();
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
                        onClick={this.handlePrevious}
                    />
                    <button
                        className={"svgButton " + playPause}
                        id="playPause"
                        onClick={this.handlePlayPause}
                    />
                    <button
                        className="svgButton"
                        id="next"
                        onClick={this.handleNext}
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
                        onChange={this.handleVolumeChange}
                    />
                    <button
                        className={"svgButton" + (this.props.shuffled ? " active" : "")}
                        id="shuffle"
                        onClick={this.handleShuffleToggle}
                    />
                </div>
                <div id="songLength">
                    {secsToMinSecs(this.props.currentSeconds) +
                    " / " + 
                    secsToMinSecs(this.props.durationSeconds)}
                </div>
                <WaveBar
                    currentItem={this.props.currentItem}
                    volume={this.state.volume}
                    onPlaybackStart={this.props.onPlaybackStart}
                    onPlaybackFinish={this.props.onPlaybackFinish}
                    playing={this.props.playing}
                    onTimeChange={this.props.onTimeChange}
                    ref={this.waveBar}
                />
            </div>
        );
    }
}