using FAItMusic4._0.Models;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace FAItMusic4._0.Controllers
{
    public class FaitController : Controller
    {


        string apiKey = "AIzaSyC5xyUtINk9c4tUnE32yKb5Lo0IR8NFJw0";
        // GET: FAIt
        public ActionResult Index()
        {
            return View();
        }


        [HttpPost]
        public async Task<ActionResult> PlayMusicAsync(string youtubeUrl)
        {

            string videoId = GetVideoIdFromUrl(youtubeUrl);

            string ApiUrl = $"https://www.googleapis.com/youtube/v3/videos?id={videoId}&key={apiKey}&part=snippet";


            using (HttpClient client = new HttpClient())
            {
                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, ApiUrl);
                HttpResponseMessage response = client.SendAsync(request).Result;
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                string jsonResponse = response.Content.ReadAsStringAsync().Result;

                VideoModel videoResponse = JsonConvert.DeserializeObject<VideoModel>(jsonResponse);

                string highQualityThumbnailUrl = videoResponse.Items[0].Snippet.Thumbnails.High.Url;

                // Pass the high-quality thumbnail URL to the ViewBag
                ViewBag.HighQualityThumbnailUrl = highQualityThumbnailUrl;
                ViewBag.VideoUrl = videoResponse.Items[0].Id;
                ViewBag.Title = videoResponse.Items[0].Snippet.Localized.Title;
                ViewBag.Desc = videoResponse.Items[0].Snippet.Description;
                ViewBag.Channel = videoResponse.Items[0].Snippet.ChannelTitle;
            }



            return Json(new { highQualityThumbnailUrl = ViewBag.HighQualityThumbnailUrl, videoUrl = ViewBag.VideoUrl, videoTitle = ViewBag.Title, videoDesc = ViewBag.Desc, videoChannel = ViewBag.Channel });
        }

        public static string GetVideoIdFromUrl(string videoUrl)
        {
            var uri = new Uri(videoUrl);
            var query = uri.Query;
            var queryParams = System.Web.HttpUtility.ParseQueryString(query);
            return queryParams["v"];
        }


        public async Task<ActionResult> SearchVDO(string SearchTerm)
        {
            string ApiUrl = $"https://www.googleapis.com/youtube/v3/search?key={apiKey}&q={SearchTerm}&part=snippet&type=video&maxResults=12";

            List<SearchResults> SearchList = new List<SearchResults>();
            using (HttpClient client = new HttpClient())
            {
                HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, ApiUrl);
                HttpResponseMessage response = client.SendAsync(request).Result;
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                string jsonResponse = response.Content.ReadAsStringAsync().Result;

                SearchModel videoResponse = JsonConvert.DeserializeObject<SearchModel>(jsonResponse);

                for (int i = 0; i < videoResponse.items.Count; i++)
                {
                    SearchResults smod = new SearchResults();
                    smod.videoTitle = videoResponse.items[i].snippet.title;
                    smod.videoUrl = $"https://www.youtube.com/watch?v={videoResponse.items[i].id.videoId}";
                    smod.videoThumbnail = videoResponse.items[i].snippet.thumbnails.high.url;
                    smod.videoChannel = videoResponse.items[i].snippet.channelTitle;
                    smod.videoID = videoResponse.items[i].id.videoId;

                    SearchList.Add(smod);
                }
            }

            ViewBag.SearchList = SearchList;
            return Json(SearchList, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult playlist(string playlistID)
        {
            var youtubeService = new YouTubeService(new BaseClientService.Initializer()
            {
                ApiKey = apiKey, // You need to replace this with your own API key
                ApplicationName = "YourAppName"
            });

            var videos = new List<PlaylistModel>();
            string nextPageToken = null;

            do
            {
                var listRequest = youtubeService.PlaylistItems.List("snippet");
                listRequest.PlaylistId = playlistID;
                listRequest.MaxResults = 200; // You may adjust this as needed
                listRequest.PageToken = nextPageToken;

                var playlistItemsListResponse = listRequest.Execute();
                var playlistItems = playlistItemsListResponse.Items;

                foreach (var item in playlistItems)
                {
                    var videoId = item.Snippet.ResourceId.VideoId;
                    var videoTitle = item.Snippet.Title;
                    var thumbnailUrl = item.Snippet.Thumbnails?.High?.Url;
                    var channelId = item.Snippet.ChannelId;
                    var channelName = GetChannelName(youtubeService, channelId);
                    var playlistItemID = item.Id;

                    var video = new PlaylistModel
                    {
                        VideoId = videoId,
                        VideoTitle = videoTitle,
                        ChannelName = channelName,
                        ThumbnailUrl = thumbnailUrl,
                        playlistItemId = playlistItemID
                    };

                    videos.Add(video);
                }

                nextPageToken = playlistItemsListResponse.NextPageToken;

            } while (nextPageToken != null);

            return Json(videos, JsonRequestBehavior.AllowGet);
        }



        private string GetChannelName(YouTubeService service, string channelId)
        {
            var channelsListRequest = service.Channels.List("snippet");
            channelsListRequest.Id = channelId;
            var channelsListResponse = channelsListRequest.Execute();
            return channelsListResponse.Items.FirstOrDefault()?.Snippet.Title;
        }

    }
}