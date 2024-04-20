using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FAItMusic4._0.Models
{
    public class Thumbnails
    {
        public ThumbnailInfo Default { get; set; }
        public ThumbnailInfo Medium { get; set; }
        public ThumbnailInfo High { get; set; }
        public ThumbnailInfo Standard { get; set; }
        public ThumbnailInfo Maxres { get; set; }
    }

    public class ThumbnailInfo
    {
        public string Url { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }

    public class Snippet
    {
        public string PublishedAt { get; set; }
        public string ChannelId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Thumbnails Thumbnails { get; set; }
        public string ChannelTitle { get; set; }
        public List<string> Tags { get; set; }
        public string CategoryId { get; set; }
        public string LiveBroadcastContent { get; set; }
        public Localized Localized { get; set; }
    }

    public class Localized
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }

    public class Item
    {
        public string Kind { get; set; }
        public string Etag { get; set; }
        public string Id { get; set; }
        public Snippet Snippet { get; set; }
    }

    public class PageInfo
    {
        public int TotalResults { get; set; }
        public int ResultsPerPage { get; set; }
    }

    public class VideoModel
    {
        public string Kind { get; set; }
        public string Etag { get; set; }
        public List<Item> Items { get; set; }
        public PageInfo PageInfo { get; set; }
    }


    public class VideoItem
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ThumbnailUrl { get; set; }
    }
}