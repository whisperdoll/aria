import React from 'react';
import "./WaveBar.scss";
import * as path from "path"
import * as fs from "fs"
import { getUserDataPath, fileExists, getRainbowColor } from '../utils/utils';
import { FileInfo } from '../utils/cache';
const WaveSurfer = require("wavesurfer.js");

interface Props
{
    volume: number;
    currentItem: FileInfo | null;
    onPlaybackStart: () => any;
    onPlaybackFinish: () => any;
    playing: boolean;
}

interface State
{
}

export default class WaveBar extends React.Component<Props, State>
{
    private waveSurfer: any;
    private currentItem: FileInfo | null = null;
    private playing: boolean = false;
    private container: React.RefObject<HTMLDivElement>;

    constructor(props: Props)
    {
        super(props);

        if (!fileExists(this.cachePath))
        {
            fs.mkdirSync(this.cachePath);
        }

        this.container = React.createRef();
    }

    private get cachePath() : string
    {
        return path.join(getUserDataPath() + "/pcm/");
    }

    private play(itemInfo: FileInfo | null)
    {
        if (!itemInfo) return;
        
        if (this.currentItem === itemInfo)
        {
            // restart //
            this.waveSurfer.seekTo(0);
        }
        else
        {
            // play //
            this.currentItem = itemInfo;
            this.waveSurfer.load(this.currentItem.filename.replace(/#/g, "%23"));
        }
    }
    
    componentDidMount()
    {
        this.waveSurfer = WaveSurfer.create({
            container: this.container.current,
            waveColor: "#eee",
            progressColor: "#aaa",
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 1,
            height: 76,
            responsive: 0,
            barHeight: 0.8,
            backend: "MediaElement",
            progressColorFn: getRainbowColor
        });

        this.waveSurfer.on("waveform-ready", () =>
        {
            this.waveSurfer.play();
            this.props.onPlaybackStart();
        });

        this.waveSurfer.on("finish", () =>
        {
            this.props.onPlaybackFinish();
        });
    }

    componentWillReceiveProps(props: Props)
    {
        if (props.volume !== this.waveSurfer.volume)
        {
            this.waveSurfer.volume = props.volume;
        }

        if (props.currentItem !== this.currentItem)
        {
            this.play(props.currentItem);
        }

        if (props.playing !== this.playing)
        {
            this.playing = props.playing;
            if (this.playing)
            {
                this.waveSurfer.play();
            }
            else
            {
                this.waveSurfer.pause();
            }
        }
    }

    get mediaElement() : HTMLMediaElement
    {
        return this.waveSurfer.backend.media;
    }

    get trulyPlaying() : boolean
    {
        return this.mediaElement.currentTime > 0 && !this.mediaElement.paused && !this.mediaElement.ended && this.mediaElement.readyState > 2;
    }

    shouldComponentUpdate(): boolean
    {
        return false;
    }

    render()
    {
        console.log("waveform render");
        return (
            <div
                id="waveBar"
                ref={this.container}
            >
            </div>
        );
    }
}