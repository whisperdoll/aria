import React from 'react';
import './App.scss';
import Playlist from './components/Playlist';
import { getUserDataPath, endsWith, array_copy, mod } from './utils/utils';
import { FileCache, FileInfo } from "./utils/cache";
import * as fs from "fs";
import * as path from "path";
import { PlaylistData, Metadata } from './utils/datatypes';
import PlaylistSelect from './components/PlaylistSelect';
import BottomBar from './components/BottomBar';

interface Props
{
}

interface State
{
    filter: string;
    fileInfos: FileInfo[];
    selection: Set<FileInfo>;
    playlistDatas: PlaylistData[];
    playing: boolean;
    currentItem: FileInfo | null;
    metadata: Map<string, Metadata>;
}

export default class App extends React.Component<Props, State>
{
    private playlistData: PlaylistData | null = null;
    private allowedExtensions = [ "mp3", "m4a" ];
    private allFileInfos: FileInfo[] = [];

    constructor(props: Props)
    {
        super(props);

        if (!fs.existsSync(getUserDataPath()))
        {
            fs.mkdirSync(getUserDataPath());
        }

        FileCache.loadMetadata();

        this.state = {
            filter: "",
            fileInfos: [],
            selection: new Set(),
            playlistDatas: [],
            playing: false,
            currentItem: null
        };
    }

    loadPlaylist(playlistData: PlaylistData): void
    {
        const filenameAllowed = (f: string): boolean =>
        {
            return this.allowedExtensions.some(e => endsWith(f, "." + e));
        };

        let fileInfos: FileInfo[] = [];

        playlistData.paths.forEach((pathInfo) =>
        {
            let info = FileCache.getInfo(pathInfo.path);
            if (info.stats.isFile())
            {
                if (filenameAllowed(pathInfo.path))
                {
                    fileInfos.push(info);
                }
            }
            else
            {
                fileInfos.push(
                    ...fs.readdirSync(pathInfo.path)
                        .filter(f => filenameAllowed(f))
                        .map(f => FileCache.getInfo(path.join(pathInfo.path, f)))
                );
            }
        });

        this.playlistData = playlistData;

        this.allFileInfos = array_copy(fileInfos);

        this.setState({
            ...this.state,
            fileInfos: array_copy(fileInfos)
        });
    }
    
    componentDidMount()
    {
        let playlistPath = "D:\\Electron\\music\\myplaylists\\";
        let filenames = fs.readdirSync(playlistPath);
        let playlistDatas = filenames.filter(f => endsWith(f, ".playlist")).map((f) =>
        {
            return JSON.parse(fs.readFileSync(path.join(playlistPath, f), "utf8")) as PlaylistData;
        }).sort((a, b) => a.created - b.created);
        
        this.setState({
            ...this.state,
            playlistDatas
        });
    }

    handleItemClick(itemInfo: FileInfo, e: React.MouseEvent)
    {
        let s = new Set(this.state.selection);

        if (e.button === 0)
        {
            if (s.size === 0)
            {
                s.add(itemInfo);
            }
            else if (e.shiftKey)
            {
                let anchor: FileInfo;
                let i0 = this.state.fileInfos.indexOf(itemInfo);
                let dist = (info: FileInfo) =>
                {
                    let i1 = this.state.fileInfos.indexOf(info);
                    return Math.abs(i1 - i0);
                };

                if (e.ctrlKey)
                {
                    let min: number = this.state.fileInfos.length;
                    let minInfo: FileInfo = itemInfo;

                    this.state.selection.forEach((compareInfo) =>
                    {
                        let d = dist(compareInfo);
                        if (d < min)
                        {
                            min = d;
                            minInfo = compareInfo;
                        }
                    });

                    anchor = minInfo;
                }
                else
                {
                    let max: number = 0;
                    let maxInfo: FileInfo = itemInfo;

                    this.state.selection.forEach((compareInfo) =>
                    {
                        let d = dist(compareInfo);
                        if (d > max)
                        {
                            max = d;
                            maxInfo = compareInfo;
                        }
                    });

                    anchor = maxInfo;
                }

                let i1 = this.state.fileInfos.indexOf(anchor);
                if (i0 > i1)
                {
                    let tmp = i0;
                    i0 = i1;
                    i1 = tmp;
                }

                for (let i = i0; i <= i1; i++)
                {
                    s.add(this.state.fileInfos[i]);
                }
            }
            else if (e.ctrlKey)
            {
                if (this.state.selection.has(itemInfo))
                {
                    s.delete(itemInfo);
                }
                else
                {
                    s.add(itemInfo);
                }
            }
            else
            {
                s.clear();
                s.add(itemInfo);
            }
        }
        else if (e.button === 2)
        {
            if (!this.state.selection.has(itemInfo))
            {
                s.clear();
                s.add(itemInfo);
            }

            // TODO: context menu
        }

        this.setState({
            ...this.state,
            selection: s
        });
    }

    handlePlaylistSelect(playlistData: PlaylistData): void
    {
        this.loadPlaylist(playlistData);
    }

    handleNext()
    {
        this.setState({
            ...this.state,
            currentItem: this.nextItem
        });
    }

    handlePrevious()
    {
        this.setState({
            ...this.state,
            currentItem: this.previousItem
        });
    }

    handlePlayPause()
    {
        if (!this.state.playing)
        {
            if (this.state.selection.size > 0)
            {
                let items: FileInfo[] = [];
                this.state.selection.forEach(s => items.push(s));
                this.setState({
                    ...this.state,
                    currentItem: items[0],
                    playing: true
                });
            }
        }
        else
        {
            this.setState({
                ...this.state,
                playing: false
            });
        }
    }

    handlePlaybackStart()
    {
    }

    get previousItem(): FileInfo | null
    {
        if (!this.state.currentItem) return null;

        let index = this.state.fileInfos.indexOf(this.state.currentItem);
        index = mod(index - 1, this.state.fileInfos.length);

        return this.state.fileInfos[index];
    }

    get nextItem(): FileInfo | null
    {
        if (!this.state.currentItem) return null;

        let index = this.state.fileInfos.indexOf(this.state.currentItem);
        index = mod(index + 1, this.state.fileInfos.length);

        return this.state.fileInfos[index];
    }

    handlePlaybackFinish()
    {
        this.setState({
            ...this.state,
            currentItem: this.nextItem
        });
    }

    render()
    {
        return (
            <div id="container">
                <div id="background"></div>
                <Playlist
                    fileInfos={this.state.fileInfos}
                    filter={this.state.filter}
                    onItemClick={this.handleItemClick.bind(this)}
                    selection={this.state.selection}
                />

                <PlaylistSelect
                    playlistDatas={this.state.playlistDatas}
                    onSelect={this.handlePlaylistSelect.bind(this)}
                />

                <BottomBar
                    onPrevious={this.handlePrevious.bind(this)}
                    onPlayPause={this.handlePlayPause.bind(this)}
                    onNext={this.handleNext.bind(this)}
                    playing={this.state.playing}
                    currentItem={this.state.currentItem}
                    onPlaybackStart={this.handlePlaybackStart.bind(this)}
                    onPlaybackFinish={this.handlePlaybackFinish.bind(this)}
                />
            </div>
        );
    }
}
