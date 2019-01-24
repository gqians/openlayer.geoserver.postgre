using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LeiJiangC.Controllers
{
    public class Home1Controller : Controller
    {
        // GET: Home1
        public ActionResult Index()
        {
            return View();
        }
        public void GeoWfs()
        {
            GeoserverWfsProxy Geo = new GeoserverWfsProxy();
            HttpContextBase context=this.HttpContext;
            Geo.ProcessRequest1(context);
            
        }
        public void GeoWfs2()
        {
            GeoserverWfsProxy2 Geo = new GeoserverWfsProxy2();
            HttpContextBase context = this.HttpContext;
            Geo.ProcessRequest1(context);
        }
    }
}