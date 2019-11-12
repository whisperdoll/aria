import * as path from "path";
import { getUserDataPath } from './utils';
const defaultPic = require("../assets/default.png");

export interface Metadata
{
    title : string,
    artist : string,
    album : string,
    length : number,
    picture : string,
    plays : number,
    track : number
}

export const DefaultMetadata: Metadata =
{
    title: "--",
    artist: "--",
    album: "--",
    length: 0,
    picture: defaultPic,
    plays: 0,
    track: 0
};

export class PlaylistItemInfo
{
    public readonly filename : string;

    constructor(filename : string)
    {
        this.filename = filename;
    }
};

export let PlaylistSavePath : string = path.join(getUserDataPath(), "myplaylists/");

export interface PlaylistPath
{
    path : string;
    exclude? : string[];
    filter? : string;
    sort? : string;
};

export function copyPlaylistPath(from: PlaylistPath): PlaylistPath
{
    return {
        path: from.path,
        exclude: from.exclude,
        filter: from.filter,
        sort: from.sort
    };
}

export interface PlaylistData
{
    name : string;
    paths : PlaylistPath[];
    filter : string;
    sort : string;
    created : number;
};

export function emptyPlaylistData(): PlaylistData
{
    return {
        created: Date.now(),
        filter: "",
        name: "",
        paths: [],
        sort: ""
    };
}

export function copyPlaylistData(from: PlaylistData): PlaylistData
{
    let copy: PlaylistData = {
        created: from.created,
        filter: from.filter,
        name: from.name,
        paths: from.paths.map(p => copyPlaylistPath(p)),
        sort: from.sort
    };

    return copy;
}