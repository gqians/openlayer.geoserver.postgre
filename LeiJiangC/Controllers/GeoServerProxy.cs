using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace LeiJiangC.Controllers
{
    public abstract class GeoserverBaseProxy : IHttpHandler
    {
        protected abstract string GeoserverUrl
        {
            get;
        }
        public void ProcessRequest(HttpContext context)
        {
           
        }
        public void ProcessRequest1(HttpContextBase context)
        {
            string targetUrl = GeoserverUrl;
            for (int i = 0, count = context.Request.QueryString.Count; i < count; i++)
            {
                targetUrl += context.Request.QueryString.Keys[i] + "=" + context.Request.QueryString.Get(i) + "&";
            }
        //http://localhost:8001/geoserver/wfs?viewparams=x1:105.06493274;y1:29.5874207&
            HttpWebRequest targetRequest = (HttpWebRequest)WebRequest.Create(targetUrl);
            targetRequest.UserAgent = context.Request.UserAgent;
            targetRequest.ContentType = context.Request.ContentType;
            targetRequest.Method = context.Request.HttpMethod;
            byte[] buffer = new byte[8 * 1024];
            int bufferLength = 8 * 1024;
            int ret = 0;
            if (targetRequest.Method.ToUpper() == "POST")
            {
                Stream targetInputStream = targetRequest.GetRequestStream();
                ret = context.Request.InputStream.Read(buffer, 0, bufferLength);
                while (ret > 0)
                {
                    targetInputStream.Write(buffer, 0, ret);
                    ret = context.Request.InputStream.Read(buffer, 0, bufferLength);
                }
                targetInputStream.Close();
            }
            HttpWebResponse targetResponse = (HttpWebResponse)targetRequest.GetResponse();
            context.Response.ContentType = targetResponse.ContentType;
            Stream targetOutputStream = targetResponse.GetResponseStream();
            Stream sourceOutputStream = context.Response.OutputStream;
            ret = targetOutputStream.Read(buffer, 0, bufferLength);
            while (ret > 0)
            {
                sourceOutputStream.Write(buffer, 0, ret);
                ret = targetOutputStream.Read(buffer, 0, bufferLength);
            }
            targetResponse.Close();
        }
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
    public class GeoserverWfsProxy : GeoserverBaseProxy
    {
        const string __geoserverUrl = "http://localhost:8001/geoserver/wfs?";
         protected override string GeoserverUrl
        {
            get
            {
                return __geoserverUrl;
            }
        }
    }
    public class GeoserverWfsProxy2 : GeoserverBaseProxy
    {
        string __geoserverUrl = "http://localhost:8001/geoserver/LeiJiang/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&FORMAT=application/json&typeName=LeiJiang%3AMySql&CRS=EPSG%3A4326&outputFormat=application%2Fjson&maxFeatures=500&";
        protected override string GeoserverUrl
        {
            get
            {
                return __geoserverUrl;
            }
        }
    }





}