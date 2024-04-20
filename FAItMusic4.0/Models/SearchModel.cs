using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


public class Thumbnails
{
    public Thumbnail defaultThumbnail { get; set; }
    public Thumbnail medium { get; set; }
    public Thumbnail high { get; set; }
}

public class Thumbnail
{
    public string url { get; set; }
    public int width { get; set; }
    public int height { get; set; }
}

public class PageInfo
{
    public int totalResults { get; set; }
    public int resultsPerPage { get; set; }
}

public class Id
{
    public string kind { get; set; }
    public string videoId { get; set; }
}

public class Snippet
{
    public string publishedAt { get; set; }
    public string channelId { get; set; }
    public string title { get; set; }
    public string description { get; set; }
    public Thumbnails thumbnails { get; set; }
    public string channelTitle { get; set; }
    public string liveBroadcastContent { get; set; }
    public string publishTime { get; set; }
}

public class Item
{
    public string kind { get; set; }
    public string etag { get; set; }
    public Id id { get; set; }
    public Snippet snippet { get; set; }
}

public class SearchModel
{
    public string kind { get; set; }
    public string etag { get; set; }
    public string nextPageToken { get; set; }
    public string regionCode { get; set; }
    public PageInfo pageInfo { get; set; }
    public List<Item> items { get; set; }
}



public class SearchResults
{
    public string videoTitle { get; set; }
    public string videoUrl { get; set; }
    public string videoThumbnail { get; set; }
    public string videoChannel { get; set; }
    public string videoID { get; set; }
}