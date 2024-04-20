using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FAItMusic4._0.Models
{
    public class PlaylistModel
    {
        public string VideoId { get; set; }
        public string VideoTitle { get; set; }
        public string ChannelName { get; set; }
        public string ThumbnailUrl { get; set; }
        public string playlistItemId { get; set; }
    }
}