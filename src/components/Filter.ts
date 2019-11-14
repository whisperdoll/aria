import { FileInfo } from "../utils/cache";
import { Metadata } from "../utils/datatypes";

export interface FilterInfo
{
    appliedPart: string;
    previewPart: string;
}

export default class Filter
{
    public static apply(filter: FilterInfo, itemList: FileInfo[], metadata: Map<string, Metadata>): { itemList: FileInfo[], visibleList: FileInfo[] }
    {
        let ret = itemList.filter(item => this.matchesFilter(filter.appliedPart, metadata.get(item.fid)));
        let visible = ret.filter(item => this.matchesFilter(filter.previewPart, metadata.get(item.fid)));
        return {
            itemList: ret,
            visibleList: visible
        };
    }

    private static matchesFilter(filter: string, metadata: Metadata | undefined): boolean
    {
        if (!metadata) return false;
        if (!filter)
        {
            return true;
        }

        if (filter.length > 1 && filter[0] === '(' && filter[filter.length - 1] === ')')
        {
            filter = filter.substr(1, filter.length - 2);
            return this.matchesFilter(filter, metadata);
        }

        filter = filter.replace(/&/g, " ").trim();
        while (filter.indexOf("  ") !== -1)
        {
            filter = filter.replace(/\s\s+/g, " ");
        }

        let pcounter = 0;
        let quoteSwitch = false;
        for (let i = 0; i < filter.length; i++)
        {
            if (filter[i] === "\\" && filter[i - 1] !== "\\")
            {
                i++;
                continue;
            }

            if (filter[i] === '"')
            {
                quoteSwitch = !quoteSwitch;
            }
            else if (!quoteSwitch)
            {
                if (filter[i] === "(")
                {
                    pcounter++;
                }
                else if (filter[i] === ")" && pcounter > 0)
                {
                    pcounter--;
                }
                else if (filter[i] === "|" && pcounter === 0)
                {
                    let left = filter.substr(0, i);
                    let right = filter.substr(i + 1);
                    return this.matchesFilter(left, metadata) || this.matchesFilter(right, metadata);
                }
            }
        }
        
        pcounter = 0;
        quoteSwitch = false;
        for (let i = 0; i < filter.length; i++)
        {
            if (filter[i] === "\\" && filter[i - 1] !== "\\")
            {
                i++;
                continue;
            }

            if (filter[i] === '"')
            {
                quoteSwitch = !quoteSwitch;
            }
            else if (!quoteSwitch)
            {
                if (filter[i] === "(")
                {
                    pcounter++;
                }
                else if (filter[i] === ")" && pcounter > 0)
                {
                    pcounter--;
                }
                else if ((filter[i] === " ") && pcounter === 0)
                {
                    let left = filter.substr(0, i);
                    let right = filter.substr(i + 1);
                    return this.matchesFilter(left, metadata) && this.matchesFilter(right, metadata);
                }
            }
        }

        if (filter.length > 1 && filter[0] === '"' && filter[filter.length - 1] === '"')
        {
            filter = filter.substr(1, filter.length - 2);
        }

        return this.matchesFilterPart(filter, metadata);
    }

    private static matchesFilterPart(filterPart : string, metadata: Metadata): boolean
    {
        filterPart = filterPart.replace(/\\(.)/g, "$1");
        //console.log("matches part?: " + filterPart);
        if (filterPart.indexOf(":") !== -1)
        {
            let parts = filterPart.split(":");
            switch (parts[0])
            {
                case "artist":
                {
                    return metadata.artist.toLowerCase() === parts[1].toLowerCase();
                }
                case "album":
                {
                    return metadata.album.toLowerCase() === parts[1].toLowerCase();
                }
                case "title":
                {
                    return metadata.title.toLowerCase() === parts[1].toLowerCase();
                }
            }
        }

        return this.filterList(metadata).some(filterListPart =>
        {
            return filterListPart.indexOf(filterPart) !== -1;
        });
    }

    private static filterList(metadata: Metadata): string[]
    {
        let filterList: string[] = [];

        for (let x in metadata)
        {
            if (x === "picture") continue;

            let thing = (metadata as any)[x];
            if (typeof(thing) !== "string")
            {
                thing = thing.toString();
            }

            filterList.push(thing.toLowerCase());
        }

        return filterList;
    }
}