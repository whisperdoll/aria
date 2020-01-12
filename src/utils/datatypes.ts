import * as path from "path";
import { getUserDataPath } from './utils';
import { FileInfo } from "./cache";
import { FilterInfo } from "../components/Filter";
const defaultPic = require("../assets/default.png");

export interface Metadata
{
    title: string,
    artist: string,
    album: string,
    length: number,
    picture: string,
    plays: number[], // timestamps
    track: number
    modified: number;
    isPlaceholder: boolean;
}

export function DefaultMetadata(filename?: string): Metadata
{
    return {
        title: filename || "--",
        artist: "--",
        album: "--",
        length: 0,
        picture: defaultPic,
        plays: [],
        track: 0,
        modified: 0,
        isPlaceholder: true
    };
};

export class PlaylistItemInfo
{
    public readonly filename: string;

    constructor(filename: string)
    {
        this.filename = filename;
    }
};

export let PlaylistSavePath: string = path.join(getUserDataPath(), "myplaylists/");

export interface PlaylistPath
{
    path: string;
    exclude?: string[];
    filter?: string;
    sort?: string;
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
    name: string;
    paths: PlaylistPath[];
    filter: string;
    sort: string;
    created: number;
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

export interface PlaylistItemCollection
{
    items: (PlaylistItemCollection | FileInfo)[];
    sort: string;
    filter: string;
    isCollection: true;
}

export function isPlaylistItemCollection(x: any): x is PlaylistItemCollection
{
    return x.isCollection;
}

export function flattenCollection(collection: PlaylistItemCollection): FileInfo[]
{
    const ret: FileInfo[] = [];

    const recurse = (collection: PlaylistItemCollection) =>
    {
        for (const item of collection.items)
        {
            if (isPlaylistItemCollection(item))
            {
                recurse(item);
            }
            else
            {
                ret.push(item);
            }
        }
    };

    return ret;
}