import React from 'react';
import './App.css';
import Playlist from './components/Playlist';
import { getUserDataPath, endsWith, bigintStatSync } from './utils/utils';
import { FileCache, FileInfo } from "./utils/cache";
import * as fs from "fs";
import * as path from "path";
import { PlaylistData } from './utils/datatypes';

interface Props
{
}

interface State
{
    filter: string,
    fileInfos: FileInfo[]
}

export default class App extends React.Component<Props, State>
{
    private playlistData: PlaylistData | null = null;
    private allowedExtensions = [ "mp3", "m4a" ];

    constructor(props: Props)
    {
        super(props);

        this.state = {
            filter: "",
            fileInfos: []
        };

        if (!fs.existsSync(getUserDataPath()))
        {
            fs.mkdirSync(getUserDataPath());
        }

        FileCache.loadMetadata();
    }

    loadPlaylist(filename: string): void
    {
        const filenameAllowed = (f: string): boolean =>
        {
            return this.allowedExtensions.some(e => endsWith(f, "." + e));
        };

        fs.readFile(filename, "utf8", (err, content) =>
        {
            let playlistData = JSON.parse(content) as PlaylistData;
            let fileInfos: FileInfo[] = [];

            playlistData.paths.forEach((pathInfo) =>
            {
                let stats = bigintStatSync(pathInfo.path);
                if (stats.isFile())
                {
                    if (filenameAllowed(pathInfo.path))
                    {
                        fileInfos.push({
                            filename: pathInfo.path,
                            fid: stats.ino.toString()
                        })
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

            this.setState({
                ...this.state,
                fileInfos
            });
        });
    }
    
    componentDidMount()
    {
        let p = "D:\\Electron\\music\\myplaylists\\MAIN LIBRARY.playlist";
        this.loadPlaylist(p);
    }

    render()
    {
        return <Playlist fileInfos={this.state.fileInfos} filter={this.state.filter} />;
    }
}
