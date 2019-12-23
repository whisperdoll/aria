import * as path from "path";
import { FileInfo, FileCache } from "./utils/cache";

export class RenameRule
{
    public static getFilenameFor(item: FileInfo, rule: string) : string
    {
        return path.join(path.dirname(item.filename), this.getBasenameFor(item, rule));
    }

    public static getBasenameFor(item: FileInfo, rule: string) : string
    {
        let ogFilename = path.basename(item.filename);
        let ogExt = path.extname(ogFilename);
        let newFilename = "";

        let found = false;
        let foundi = 0;

        for (let i = 0; i < rule.length; i++)
        {
            if (rule[i] === "%")
            {
                if (!found)
                {
                    found = true;
                    foundi = i;
                }
                else
                {
                    found = false;
                    let token = rule.substr(foundi + 1, i - foundi - 1).toLowerCase();
                    if (this.isValidToken(token))
                    {
                        newFilename += this.parseToken(token, item);
                    }
                }
            }
            else if (!found)
            {
                newFilename += rule[i];
            }
        }

        return newFilename.replace(/[/\\?%*:|"<>]/g, "-") + ogExt;
    }

    private static getMetadata(fid: string, prop: string): string | undefined
    {
        let ret = FileCache.metadata.get(fid);
        if (ret === undefined)
        {
            return undefined;
        }

        return (ret as any)[prop];
    }

    private static tokenMap : { [ token: string ]: (item: FileInfo) => string | undefined } =
    {
        "filename": item => path.parse(item.filename).name,
        "title": item => RenameRule.getMetadata(item.fid, "title"),
        "artist": item => RenameRule.getMetadata(item.fid, "artist"),
        "album": item => RenameRule.getMetadata(item.fid, "album")
    };

    private static _tokenList: string[] = Object.keys(RenameRule.tokenMap);

    public static get tokenList(): string[]
    {
        return this._tokenList;
    }

    public static isValidToken(token: string)
    {
        return this.tokenMap.hasOwnProperty(token);
    }

    public static parseToken(token: string, item : FileInfo) : string
    {
        let ret = this.tokenMap[token](item);
        if (ret === undefined)
        {
            throw "ooops";
        }
        return ret;
    }
}