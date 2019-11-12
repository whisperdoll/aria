import * as path from "path";
import * as fs from "fs";
import { getUserDataPath, bigintStatSync, jsonToMap, mapToJson } from "./utils";
import { Metadata } from "./datatypes"
import { SafeWriter } from "./safewriter";
import * as mm from "music-metadata";

export interface FileInfo
{
    filename : string;
    fid : string;
    stats : fs.BigIntStats;
};

export class FileCache
{
    private static cacheFilename = path.join(getUserDataPath(), "songs.cache");
    private static cacheFid : string;
    private static filenameStats = new Map<string, FileInfo>();
    public static metadata : Map<string, Metadata> = new Map();
    private static lastWrite : number = 0;
    private static writeDelay : number = 10000;
    private static writingPic = new Map<string, boolean>();
    private static queue : { filename : string, fid : string, onupdate : (data : Metadata, fid : string) => any }[] = [];
    private static working : number = 0;
    private static workingAllowed : number = 4;

    public static getInfo(filename : string) : FileInfo
    {
        let cached = this.filenameStats.get(filename);
        if (cached === undefined)
        {
            let stats = bigintStatSync(filename);
            let info = {
                filename,
                fid: stats.ino.toString(),
                stats: stats
            };
            this.filenameStats.set(filename, info);
            return info;
        }
        else
        {
            return cached;
        }
    }

    public static getFid(filename : string) : string
    {
        return this.getInfo(filename).fid;
    }

    public static getMetadata(filename : string, fid : string, onupdate : (data : Metadata, fid: string) => any, force: boolean = false) : void
    {
        let cached = this.metadata.get(fid);

        if (cached && !force)
        {
            onupdate(cached, fid);
            return;
        }

        if (this.working === this.workingAllowed)
        {
            this.queue.push({ filename, fid, onupdate });
            return;
        }

        this.working++;

        let ret = () =>
        {
            onupdate(this.metadata.get(fid) as Metadata, fid);
            this.working--;
            if (this.queue.length > 0)
            {
                let item = this.queue.shift();
                if (item !== undefined)
                {
                    setTimeout(this.getMetadata.bind(this, item.filename, item.fid, item.onupdate), 1);
                }
            }
            else
            {
                this.writeCache();
                console.log("done loading...?");
            }
        };

        let updateMetadata = (metadata : mm.IAudioMetadata, callback? : () => any) =>
        {
            if (!this.metadata.get(fid))
            {
                //console.log("creating metadata entry for " + filename);
                this.metadata.set(fid,
                {
                    title: "<unknown title>",
                    artist: "<unknown artist>",
                    album: "<unknown album>",
                    length: 0,
                    picture: "",
                    plays: 0,
                    track: 0
                });
            }
            
            let md = this.metadata.get(fid) as Metadata;

            ////console.log(metadata);

            if (metadata.common.title) md.title = metadata.common.title;
            if (metadata.common.artist) md.artist = metadata.common.artist;
            if (metadata.common.track && metadata.common.track.no) md.track = metadata.common.track.no;
            if (metadata.common.album) md.album = metadata.common.album;
            if (metadata.format.duration) md.length = metadata.format.duration;

            if (metadata.common.picture && metadata.common.picture[0])
            {
                if (!this.writingPic.get(filename))
                {
                    let format = metadata.common.picture[0].format;
                    format = format.substr(format.indexOf("/") + 1);
    
                    let src = path.join(getUserDataPath(), fid + "." + format);

                    //console.log("checking for matching src: \n" + src + "\nvs\n" + this.metadata[fid].picture, src === this.metadata[fid].picture);
                    
                    if (src !== md.picture)
                    {
                        //console.warn("nonmatching for " + filename + " (" + fid + ")\n" + src + "\nvs\n" + this.metadata[fid].picture);
                        this.writingPic.set(filename, true);
                        SafeWriter.write(src, metadata.common.picture[0].data, (err) =>
                        {
                            if (err)
                            {
                                throw err;
                            }
    
                            md.picture = src;
                            //console.log("wrote pic for: " + filename, this.metadata[fid].picture);
                            this.writingPic.set(filename, false);
                            callback && callback();
                        });
                    }
                }
            }
            else
            {
                callback && callback();
            }
        };

        mm.parseFile(filename,
        {
            duration: true
        }).then((metadata : mm.IAudioMetadata) =>
        {
            updateMetadata(metadata, () =>
            {
                ret();
            });
        });
    }

    public static loadMetadata() : Map<string, Metadata>
    {
        let data;

        try
        {
            data = fs.readFileSync(this.cacheFilename, "utf8");
        }
        catch (err)
        {
            if (err.code === "ENOENT")
            {
                data = JSON.stringify({});
                fs.writeFileSync(this.cacheFilename, data, "utf8");
            }
            else
            {
                throw err;
            }
        }

        try
        {
            this.metadata = jsonToMap(JSON.parse(data));
        }
        catch (err)
        {
            this.metadata = new Map();
            fs.writeFileSync(this.cacheFilename, JSON.stringify(mapToJson(this.metadata)), "utf8");
        }

        console.log("loaded metadata", this.metadata);
        this.cacheFid = bigintStatSync(this.cacheFilename).ino.toString();
        return this.metadata;
    }

    public static writeCache(cb? : (err : Error | null) => void) : void
    {
        let now = Date.now();

        if (now - this.lastWrite > this.writeDelay)
        {
            console.log("writing cache...");
            SafeWriter.write(this.cacheFilename, JSON.stringify(mapToJson(this.metadata)), (err) =>
            {
                console.log("wrote cache (" + (Date.now() - now).toString() + "ms)");
                cb && cb(err);
            }, this.cacheFid);
            this.lastWrite = now;
        }
    }
}