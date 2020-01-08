import React from 'react';
import './App.scss';
import Playlist from './components/Playlist';
import { getUserDataPath, endsWith, array_copy, mod, mergeSorted, SortFunction, array_shuffle, array_contains, array_remove, array_ensureOne, array_remove_all, isFile } from './utils/utils';
import { FileCache, FileInfo } from "./utils/cache";
import * as fs from "fs";
import * as path from "path";
import { PlaylistData, Metadata, DefaultMetadata } from './utils/datatypes';
import PlaylistSelect from './components/PlaylistSelect';
import BottomBar from './components/BottomBar';
import * as Electron from "electron";
import PlaylistDialog from './components/PlaylistDialog/PlaylistDialog';
import ContextMenu from './components/ContextMenu';
import ContextMenuItem from './components/ContextMenuItem';
import FilterBox from './components/FilterBox';
import Filter, { FilterInfo } from './components/Filter';
import StatusBar from './components/StatusBar';
import RenameDialog from './components/RenameDialog';

interface Props
{
}

interface ContextMenuInfo
{
    showing: boolean;
    x: number;
    y: number;
    context: any;
}

interface State
{
    filter: FilterInfo;
    itemList: FileInfo[];
    visibleList: FileInfo[];
    selection: FileInfo[];
    playlistDatas: PlaylistData[];
    playing: boolean;
    currentItem: FileInfo | null;
    currentSeconds: number;
    durationSeconds: number;
    shuffled: boolean;
    showingDialogs: Record<string, boolean>;
    contextMenus: Record<string, ContextMenuInfo>;
}

export const AllowedExtensions = [ "mp3", "m4a" ];

export default class App extends React.PureComponent<Props, State>
{
    private playlistData: PlaylistData | null = null;
    private allFileInfos: FileInfo[] = [];
    private contextData: PlaylistData | null = null;
    private bottomBar: React.RefObject<BottomBar>;
    private playOrder: number[] = []; // array of indeces
    private parentPathHavers: Set<FileInfo> = new Set();

    constructor(props: Props)
    {
        super(props);

        if (!fs.existsSync(getUserDataPath()))
        {
            fs.mkdirSync(getUserDataPath());
        }

        this.state = {
            filter: {
                appliedPart: "",
                previewPart: ""
            },
            itemList: [],
            visibleList: [],
            selection: [],
            playlistDatas: [],
            playing: false,
            currentItem: null,
            currentSeconds: 0,
            durationSeconds: 0,
            shuffled: false,
            showingDialogs: {
                playlist: false,
                rename: false
            },
            contextMenus: {
                playlist: {
                    showing: false,
                    x: 0,
                    y: 0,
                    context: null
                },
                itemSelection: {
                    showing: false,
                    x: 0,
                    y: 0,
                    context: null
                }
            }
        };

        this.bottomBar = React.createRef();

        FileCache.onQueueFinished = this.handleCacheQueueFinished.bind(this);

        let ipcRenderer = Electron.ipcRenderer;
        ipcRenderer.on("app-command", this.processAppCommand.bind(this));
    }

    private processAppCommand = (e : any, command : string) =>
    {
        switch (command)
        {
            case "media-nexttrack": this.handleNext(); break;
            case "media-previoustrack": this.handlePrevious(); break;
            case "media-play-pause": this.handlePlayPause(); break;
        }
    }

    private loadPlaylist = (playlistData: PlaylistData) =>
    {
        console.log("loading " + playlistData.name);
        this.playlistData = playlistData;

        const filenameAllowed = (f: string): boolean =>
        {
            return AllowedExtensions.some(e => endsWith(f, "." + e));
        };

        const filenames = [];

        for (const playlistPath of playlistData.paths)
        {
            if (isFile(playlistPath.path))
            {
                filenames.push(playlistPath.path);
            }
            else
            {
                filenames.push(...fs.readdirSync(playlistPath.path));
            }
        }

        this.allFileInfos = filenames.filter(filenameAllowed).map(FileCache.getInfo);

        this.setState(state => ({
            itemList: array_copy(this.allFileInfos),
            visibleList: array_copy(this.allFileInfos)
        }));

        for (const info of this.allFileInfos)
        {
            FileCache.subscribeToFid(info.fid, this.handleMetadataUpdate);
        }
    }

    private handleMetadataUpdate = (fid: string, metadata: Metadata) =>
    {
        this.filterAndSortAll();
    }

    private filterAndSort = (array: FileInfo[], sort: string, filter: FilterInfo): { itemList: FileInfo[], visibleList: FileInfo[] } =>
    {
        let ret: FileInfo[];

        if (sort)
        {
            let sortStrings = sort.split(",");
            ret = mergeSorted(array, this.getSortFunctionByCriteria(sortStrings));
        }
        else
        {
            ret = array_copy(array);
        }

        return Filter.apply(filter, ret);
    }

    private filterAndSortAll = () =>
    {
        if (!this.playlistData) return;

        const filteredLists = this.filterAndSort(this.allFileInfos, this.playlistData.sort, this.state.filter);

        this.setState((state) => {
            return {
                ...state,
                ...filteredLists
            };
        });
    }
    
    componentDidUpdate = (prevProps: Props, prevState: State) =>
    {
        if (prevState.itemList !== this.state.itemList || prevState.shuffled !== this.state.shuffled)
        {
            this.playOrder = this.state.itemList.map((item, i) => i);

            if (this.state.shuffled)
            {
                array_shuffle(this.playOrder);
            }
        }
    }

    handleCacheQueueFinished = () =>
    {
        
    }

    private getSortFunctionByCriteria = (sortStrings : string[]) : SortFunction<FileInfo> =>
    {
        return (a : FileInfo, b : FileInfo) =>
        {    
            for (let i = 0; i < sortStrings.length; i++)
            {
                let criterium = sortStrings[i].split(":")[0];
                let order = sortStrings[i].split(":")[1] || "a";
                let ma = FileCache.metadata.get(a.fid);
                let mb = FileCache.metadata.get(b.fid);

                if (!mb) return true;
                if (!ma) return false;

                let pa = (ma as any)[criterium];
                let pb = (mb as any)[criterium];

                if (pa === pb)
                {
                    continue;
                }
                else
                {
                    return !!(+(pa >= pb) ^ +(order[0] === "a")); // lol huh ???
                }
            }

            return false;
        };
    }
    
    componentDidMount = () =>
    {
        document.addEventListener("click", () =>
        {
            let contextMenus: Record<string, ContextMenuInfo> = {};
            // 400-3334
            for (let key in this.state.contextMenus)
            {
                contextMenus[key] = {
                    showing: false,
                    x: 0,
                    y: 0,
                    context: null
                };
            }

            this.setState((state) =>
            {
                return {
                    ...state,
                    contextMenus
                };
            });
        });

        let playlistPath = "D:\\Electron\\music\\myplaylists\\";
        let filenames = fs.readdirSync(playlistPath);
        let playlistDatas = filenames.filter(f => endsWith(f, ".playlist")).map((f) =>
        {
            return JSON.parse(fs.readFileSync(path.join(playlistPath, f), "utf8")) as PlaylistData;
        }).sort((a, b) => a.created - b.created);
        
        this.setState((state) => {
            return {
                ...state,
                playlistDatas
            };
        });
    }

    handleItemClick = (itemInfo: FileInfo, e: React.MouseEvent) =>
    {
        let s = array_copy(this.state.selection);
        let x = e.clientX;
        let y = e.clientY;

        if (e.button === 0)
        {
            if (s.length === 0)
            {
                s.push(itemInfo);
            }
            else if (e.shiftKey)
            {
                let anchor: FileInfo;
                let i0 = this.state.visibleList.indexOf(itemInfo);
                let dist = (info: FileInfo) =>
                {
                    let i1 = this.state.visibleList.indexOf(info);
                    return Math.abs(i1 - i0);
                };

                if (e.ctrlKey)
                {
                    let min: number = this.state.visibleList.length;
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

                let i1 = this.state.visibleList.indexOf(anchor);
                if (i0 > i1)
                {
                    let tmp = i0;
                    i0 = i1;
                    i1 = tmp;
                }

                for (let i = i0; i <= i1; i++)
                {
                    s.push(this.state.visibleList[i]);
                }
            }
            else if (e.ctrlKey)
            {
                if (!array_remove(this.state.selection, itemInfo).existed)
                {
                    s.push(itemInfo);
                }
            }
            else
            {
                s = [ itemInfo ];
            }
        }
        else if (e.button === 2)
        {
            if (!array_contains(s, itemInfo))
            {
                s = [ itemInfo ];
            }

            this.setState((state) =>
            {
                return {
                    ...state,
                    contextMenus: {
                        ...state.contextMenus,
                        itemSelection: {
                            showing: true,
                            x: x,
                            y: y,
                            context: null
                        }
                    }
                };
            });
        }

        this.setState((state) =>
        {
            return {
                ...state,
                selection: s
            };
        });
    }

    handleItemDoubleClick = (itemInfo: FileInfo, e: React.MouseEvent) =>
    {
        this.setState((state) => {
            return {
                ...state,
                currentItem: itemInfo,
                playing: true
            };
        });
    }

    handlePlaylistSelect = (playlistData: PlaylistData) =>
    {
        this.loadPlaylist(playlistData);
    }

    handleNext = () =>
    {
        this.setState((state) => {
            return {
                ...state,
                currentItem: this.nextItem
            };
        });
    }

    handlePrevious = () =>
    {
        if (this.state.currentSeconds > 2)
        {
            if (this.bottomBar.current)
            {
                this.bottomBar.current.restartSong();
            }
        }
        else
        {
            this.setState((state) => {
                return {
                    ...state,
                    currentItem: this.previousItem
                };
            });
        }
    }

    handlePlayPause = () =>
    {
        if (!this.state.playing)
        {
            if (this.state.currentItem)
            {
                this.setState((state) => {
                    return {
                        ...state,
                        playing: true
                    };
                });
            }
            else
            {
                if (this.state.selection.length > 0)
                {
                    this.setState((state) => {
                        return {
                            ...state,
                            currentItem: this.state.selection[0],
                            playing: true
                        };
                    });
                }
            }
        }
        else
        {
            this.setState((state) => {
                return {
                    ...state,
                    playing: false
                };
            });
        }
    }

    handlePlaybackStart()
    {
        if (!this.state.currentItem) return;

        FileCache.getMetadata(this.state.currentItem, (metadata, fid) => FileCache.writeCache(), true);
    }

    handleTimeChange(currentSeconds: number, durationSeconds: number): void
    {
        this.setState((state) => {
            return {
                ...state,
                currentSeconds,
                durationSeconds
            };
        });
    }

    get previousItem(): FileInfo | null
    {
        if (!this.state.currentItem) return null;

        let index = this.state.itemList.indexOf(this.state.currentItem);
        let orderIndex = this.playOrder.indexOf(index);
        orderIndex = mod(orderIndex - 1, this.state.itemList.length);

        return this.state.itemList[orderIndex];
    }

    get nextItem(): FileInfo | null
    {
        if (!this.state.currentItem) return null;

        let index = this.state.itemList.indexOf(this.state.currentItem);
        let orderIndex = this.playOrder.indexOf(index);
        orderIndex = mod(orderIndex + 1, this.state.itemList.length);

        return this.state.itemList[orderIndex];
    }

    handlePlaybackFinish()
    {
        this.setState((state) => {
            return {
                ...state,
                currentItem: this.nextItem
            };
        });
    }

    handlePlaylistAccept(playlistData: PlaylistData): void
    {

    }

    handleDialogCancel()
    {
        this.setState((state) => {
            return {
                ...state,
                showingDialogs: {
                    ...state.showingDialogs,
                    playlist: false
                }
            };
        });
    }

    handleRenameDialogHide()
    {
        this.setState((state) => {
            return {
                ...state,
                showingDialogs: {
                    ...state.showingDialogs,
                    rename: false
                }
            };
        });
    }

    handleEditPlaylist(): void
    {
        if (!this.contextData) return;
        
        console.log("editing " + this.contextData.name);
    }

    handlePlaylistContextMenu(data: PlaylistData, x: number, y: number): void
    {
        this.contextData = data;
        this.setState((state) => {
            return {
                ...state,
                contextMenus: {
                    ...state.contextMenus,
                    playlist: {
                        showing: true,
                        x,
                        y,
                        context: data
                    }
                }
            };
        });
    }

    handleFilter(filter: FilterInfo): void
    {
        let x = Filter.apply(filter, this.allFileInfos);

        this.setState((state) => {
            return {
                ...state,
                ...x,
                filter,
            };
        });
    }

    handleShuffleToggle(shuffle: boolean): void
    {
        this.setState((state) => {
            return {
                ...state,
                shuffled: shuffle
            };
        });
    }

    handleRenameRequest(): void
    {
        this.setState((state) =>
        {
            return {
                ...state,
                showingDialogs: {
                    ...state.showingDialogs,
                    rename: true
                }
            };
        });
    }

    handleConsolidateModifiedTimes = () =>
    {
        if (!this.playlistData) return;
        const selection = Array.from(this.state.selection);
        let newMTime = selection[0].stats.mtime;

        selection.forEach((song) =>
        {
            fs.utimesSync(song.filename, song.stats.atime, newMTime);
            FileCache.getMetadata(song, (metadata, fid) => FileCache.writeCache(), true);
        });

        // scrolltop doesnt get reset on reload so commenting this out
        /*let scrollTop = this.playlistView.container.scrollTop;
        this.playlistView.once("construct", () =>
        {
            this.playlistView.container.scrollTop = scrollTop;
        });*/
        this.loadPlaylist(this.playlistData);
    }

    render()
    {
        let currentMetadata = DefaultMetadata();

        if (this.state.currentItem && FileCache.metadata.get(this.state.currentItem.fid))
        {
            currentMetadata = FileCache.metadata.get(this.state.currentItem.fid) as Metadata;
        }

        let albumSrc = this.state.currentItem ? currentMetadata.picture: "";

        const selectionArray = Array.from(this.state.selection);
        const playlistLoadedCondition = () => this.playlistData !== null;
        const songSelectedCondition = () => this.state.selection.length > 0;
        const songIsPartOfPathCondition = () => selectionArray.every(fileInfo => this.parentPathHavers.has(fileInfo));
        const songIsAloneCondition = () => selectionArray.every(fileInfo => !this.parentPathHavers.has(fileInfo));
        const songsAreSameAlbumCondition = () => 
        {
            return this.state.selection.length > 0
                && selectionArray.every((fileInfo) =>
                {
                    const md1 = FileCache.metadata.get(fileInfo.fid);
                    const md2 = FileCache.metadata.get(selectionArray[0].fid);
                    return md1 && md2 && md1.album === md2.album;
                });
        };

        return (
            <div id="container">
                <img
                    id="album"
                    className="fullSize"
                    src={albumSrc}
                />
                <div
                    id="albumOverlay"
                    className="fullSize"
                />

                <FilterBox
                    filter={this.state.filter}
                    onFilter={this.handleFilter}
                />

                <Playlist
                    fileInfos={this.state.visibleList}
                    onItemClick={this.handleItemClick}
                    onItemDoubleClick={this.handleItemDoubleClick}
                    selection={this.state.selection}
                    currentItem={this.state.currentItem}
                />

                <PlaylistSelect
                    playlistDatas={this.state.playlistDatas}
                    onSelect={this.handlePlaylistSelect}
                    onContextMenu={this.handlePlaylistContextMenu}
                />

                <BottomBar
                    onPrevious={this.handlePrevious}
                    onPlayPause={this.handlePlayPause}
                    onNext={this.handleNext}
                    playing={this.state.playing}
                    currentItem={this.state.currentItem}
                    onPlaybackStart={this.handlePlaybackStart}
                    onPlaybackFinish={this.handlePlaybackFinish}
                    metadata={currentMetadata}
                    currentSeconds={this.state.currentSeconds}
                    durationSeconds={this.state.durationSeconds}
                    onTimeChange={this.handleTimeChange}
                    shuffled={this.state.shuffled}
                    onShuffleToggle={this.handleShuffleToggle}
                    ref={this.bottomBar}
                />

                <StatusBar
                    selection={this.state.selection}
                />

                <PlaylistDialog
                    onAccept={this.handlePlaylistAccept}
                    playlistDatas={this.state.playlistDatas}
                    operatingIndex={-1}
                    showing={this.state.showingDialogs.playlist}
                    onCancel={this.handleDialogCancel}
                />

                <RenameDialog
                    items={Array.from(this.state.selection)}
                    onHide={this.handleRenameDialogHide}
                    showing={this.state.showingDialogs.rename}
                />

                <ContextMenu
                    showing={this.state.contextMenus.playlist.showing}
                    x={this.state.contextMenus.playlist.x}
                    y={this.state.contextMenus.playlist.y}
                >
                    <ContextMenuItem
                        text="Edit Playlist"
                        key="Edit Playlist"
                        onClick={this.handleEditPlaylist}
                        showing={true}
                    />
                </ContextMenu>

                <ContextMenu
                    showing={this.state.contextMenus.itemSelection.showing}
                    x={this.state.contextMenus.itemSelection.x}
                    y={this.state.contextMenus.itemSelection.y}
                >
                    <ContextMenuItem
                        text="Rename..."
                        key="Rename..."
                        onClick={this.handleRenameRequest}
                        showing={true}
                    />
                    <ContextMenuItem
                        text="Consolidate Modified Times"
                        key="Consolidate Modified Times"
                        onClick={this.handleConsolidateModifiedTimes}
                        showing={songsAreSameAlbumCondition()}
                    />
                </ContextMenu>
            </div>
        );
    }
}
