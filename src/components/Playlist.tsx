import React from 'react';
import PlaylistItem from './PlaylistItem';
import "./Playlist.scss";
import { FileInfo } from '../utils/cache';

interface Props
{
    fileInfos: FileInfo[];
    filter: string;
}

interface State
{

}

export default class Playlist extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
    }

    render()
    {
        let i = 0;
        let list = this.props.fileInfos.map((fileInfo) =>
        {
            return <PlaylistItem index={i++} key={fileInfo.fid} fileInfo={fileInfo} />;
        });

        return <div className="playlist">{list}</div>;
    }
}