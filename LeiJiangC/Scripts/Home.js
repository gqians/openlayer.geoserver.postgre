$(function () {
    $("#Hu").click(function GetHuData() {
        HuClick();
    });
    $("#HeLiu").click(function GetHuData1() {
        HeClick();
    });
    $("#Routing").click(function GetHuData2() {
        RoutingClick();
    });
    $("#Drop").click(function GetHuData3() {
        addItem();
    });
    GetHotelItem();
    $("#HotelItem").on("click", "button", function () {
        clickbtn=$(this).html();
        CetCoordinate();
    });
    $("#Clear").click(function GetHuData4() {
        ClearInf();
        
    });
    $("#Pic").click(function GetHuData5() {
        ShowPic();
    });
})
//设置视图11703587.644451478, 3452176.4656847143
var view = new ol.View({
    projection: 'EPSG:4326',
    center: [105.14053344726562, 29.589462296571583],
    zoom: 11
});
//设置比例尺控件
var scaleLineControl = new ol.control.ScaleLine({
    units: "metric"
});
//设置地图
var map = new ol.Map({
    layers: [ ],
    target: 'map',
    view: view
});
//添加控件
var zoomToExent = new ol.control.ZoomToExtent({
    extend: [131000, 42900, 132000, 52100]
});
map.addControl(zoomToExent);
map.addControl(scaleLineControl);
//加载发布的地图图层
var Layer1 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://localhost:8001/geoserver/LeiJiang/wms', //WMS服务地址
        params: { 'LAYERS': 'LeiJiang:LeiJiangGroup', 'TILED': true }, //图层等参数
        serverType: 'geoserver'//服务类型
    })
})
map.addLayer(Layer1);
//设置鹰眼map
var overview = new ol.Map({
    target: 'overview',
    layers: [ ],
    view: new ol.View({
        projection: 'EPSG:4326',
        center: [105.14053344726562, 29.589462296571583],//11703587.644451478, 3452176.4656847143
        zoom: 11,
        maxZoom: 11,
        minZoom: 11
    })
});
overview.addLayer(Layer1);
//在缩略图中加载map的extent框
var extent = map.getView().calculateExtent(map.getSize());
//获取经纬度数组（0,2为纬度，1,3为经度，连接起来刚好为矩形）
var coor = [[[extent[0], extent[1]], [extent[2], extent[1]], [extent[2], extent[3]], [extent[0], extent[3]], [extent[0], extent[1]]]];
var polygonFeature = new ol.Feature(new ol.geom.Polygon(coor));
var vectorSource = new ol.source.Vector({
    features: [polygonFeature]
});

var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.2)' }),//填充样式
        stroke: new ol.style.Stroke({//边界样式
            color: 'red', width: 2
        })
    })
});
//实例化矢量图层作为绘制层
overview.addLayer(vectorLayer);

//设置map和overview联动
map.on('moveend', function () {
    var extent = map.getView().calculateExtent(map.getSize());
    //获取经纬度数组（0,2为纬度，1,3为经度，连接起来刚好为矩形）
    var coor = [[[extent[0], extent[1]], [extent[2], extent[1]], [extent[2], extent[3]], [extent[0], extent[3]], [extent[0], extent[1]]]];
    vectorLayer.getSource().getFeatures()[0].getGeometry().setCoordinates(coor);
    //setTimeOut:等待100ms后执行函数一次
    setTimeout(function () {
        var view = overview.getView();
        //弹性动画
        var pan = ol.animation.pan({
            duration: 300,
            source: (view.getCenter())
        });
        overview.beforeRender(pan);
        overview.getView().setCenter(map.getView().getCenter());
    }, 100);
})
//改编鼠标样式
overview.on('pointermove', function (evt) {
    overview.getTargetElement().style.cursor = 'pointer';
});


//此函数受到分辨率的影响
//overview.on('click', function (e) {
//    var coor = e.coordinate;  
//    map.getView().setCenter(coor);
//    //alert(map.getView().getResolution() +"      "+ overview.getView().getResolution());
//})

//进行wfc条件属性查询
var vectorSource = new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)', width: 2
        })
    })
}); 
//用于湖的面积的请求
//generate a GetFeature request 
var featureRequest = new ol.format.WFS().writeGetFeature({ 
    srsName: 'EPSG:4326', 
    featureNS: 'http://www.metarnet.com/LeiJiang', //命名空间 
    featurePrefix: 'LeiJiang', //工作区域 
    featureTypes: ['Hu'], //图层名 
    outputFormat: 'application/json', 
    filter: ol.format.filter.GreaterThanOrEqualTo('Shape_Area', 0) //todo 条件查询过滤 
});
var features;
var All_area = 0;
var count;
function HuClick() {
    map.addLayer(vector);
    // then post the request and add the received features to a layer 
    //会有跨域问题，所以需要代理
    fetch('/Home1/GeoWfs', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        features = new ol.format.GeoJSON().readFeatures(json);
        vectorSource.addFeatures(features);
        count = vectorSource.getFeatures().length;
        ShowData();
        map.getView().fit(vectorSource.getExtent());
    })
    setTimeout(function () {
        map.removeLayer(vector);
    }, 3000);
}
function ShowData() {
    //此函数为异步，所以要添加计数器
    $.each(features, function (index, feature) {
        All_area += feature.get("Shape_Area");
        if (index == count - 1) {
            layer.msg("湖总面积为" + All_area + "平方米");
            All_area = 0;
        }
    })
}


//用于河流面积的请求
var vectorSource1 = new ol.source.Vector();
var vector1 = new ol.layer.Vector({
    source: vectorSource1,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)', width: 2
        })
    })
});
//generate a GetFeature request 
var featureRequest1 = new ol.format.WFS().writeGetFeature({
    srsName: 'EPSG:4326',
    featureNS: 'http://www.metarnet.com/LeiJiang', //命名空间 
    featurePrefix: 'LeiJiang', //工作区域 
    featureTypes: ['He'], //图层名 
    outputFormat: 'application/json',
    filter: ol.format.filter.GreaterThanOrEqualTo('Shape_Area', 0) //todo 条件查询过滤 
});
var features1;
var All_area1 = 0;
var count1;
function HeClick() {
    map.addLayer(vector1);
    // then post the request and add the received features to a layer 
    //会有跨域问题，所以需要代理
    fetch('/Home1/GeoWfs', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest1)
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        features1 = new ol.format.GeoJSON().readFeatures(json);
        //console.log(features1[0].getGeometry().getType());
        //console.log(features1[0].getGeometry().getLastCoordinate());
        vectorSource1.addFeatures(features1);
        count1 = vectorSource1.getFeatures().length;
        ShowData1();
        map.getView().fit(vectorSource1.getExtent());
    })
    setTimeout(function () {
        map.removeLayer(vector1);
    }, 3000);
}
function ShowData1() {
    //此函数为异步，所以要添加计数器
    $.each(features1, function (index, feature) {
        All_area1 += feature.get("Shape_Area");
        if (index == count1 - 1) {
            layer.msg("河流总面积为" + All_area1 + "平方米");
            All_area1 = 0;
        }
    })
}

//路径分析
var startCoord = [0, 0];
var result;
function RoutingClick() {
    if (startCoord[0] == 0) {
        layer.msg("请选择酒店!");
        return false;
    }
    var params = {
        LAYERS: 'LeiJiang:MySql',
        FORMAT: 'image/png',
    };
    var viewparams = [
        'x1:' + startCoord[0], 'y1:' + startCoord[1]
    ];
    params.viewparams = viewparams.join(';');
    result = new ol.layer.Image({
        source: new ol.source.ImageWMS(
            {
                url: 'http://localhost:8001/geoserver/LeiJiang/wms',
                params: params
            })
    });
    //console.log(result);
    if (result != null) {
        map.addLayer(result);
        addStart(startCoord);
        GetRoadInformation();
    }
    else {
    }
    view.setCenter(startCoord);
    view.setZoom(14);
}

//获取酒店列表
var featureRequest2 = new ol.format.WFS().writeGetFeature({
    srsName: 'EPSG:4326',
    featureNS: 'http://www.metarnet.com/LeiJiang', //命名空间 
    featurePrefix: 'LeiJiang', //工作区域 
    featureTypes: ['LeiJiangBingGuan'], //图层名 
    outputFormat: 'application/json',
});
var features2;
function GetHotelItem() {
    fetch('/Home1/GeoWfs', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest2)
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        features2 = new ol.format.GeoJSON().readFeatures(json);
       
    })
    
};
//添加酒店列表到界面
function addItem() {
    $("#HotelItem").empty();
    $.each(features2, function (index, feature) {
        var hotelname = feature.get("NAME");
        var txt = $("<button></button>").text(hotelname);
        $("#HotelItem").append(txt);        // 追加新元素
        // console.log(feature.getGeometry().getExtent()[0]);
        //console.log(feature.getProperties());
        //console.log(hotelname);
        //console.log(feature.get("NAME"));
    });
    $("#HotelItem button").addClass("layui-btn layui-btn-lg layui-btn-primary layui-btn-radius");
    //console.log(features2[0].get("properties").get("ADDRESS"));
}
//点击酒店按钮获取起点的经纬度
var clickbtn//当前点击对象
function CetCoordinate() {
    map.removeLayer(result);
    map.removeLayer(MarkVectorLayer);
    $.each(features2, function (index, feature) {
        if (clickbtn == feature.get("NAME")) {
            startCoord[0] = feature.getGeometry().getExtent()[0];
            startCoord[1] = feature.getGeometry().getExtent()[1];
            return false;
        };
    });
};

//marker样式
var createLabelStyle = function (feature) {
    return new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 60],
            anchorOrigin: 'top-right',
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            offsetOrigin: 'top-right',
            // offset:[0,10],
            // scale:0.5,  //图标缩放比例
            //opacity: 0.5,  //透明度
            src:"../Content/picture/icon.png" //图标的url
        })),
        text: new ol.style.Text({
            textAlign: 'center', //位置
            textBaseline: 'middle', //基准线
            font: 'normal 14px 微软雅黑',  //文字样式
            text: feature.get('name'),  //文本内容
            fill: new ol.style.Fill({ color: '#aa3300' }), //文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 })
        })
    });
}
//添加起点marker
var start;
var iconFeature;
var vectorSource2;
var MarkVectorLayer;
function addStart(coord) {
    //marker实体
     iconFeature = new ol.Feature({
         geometry: new ol.geom.Point(coord),
        name: '起点' //名称属性
    });
    iconFeature.setStyle(createLabelStyle(iconFeature));
    //矢量标注的数据源
     vectorSource2 = new ol.source.Vector({
        features: [iconFeature]
    });
    //矢量标注图层
     MarkVectorLayer = new ol.layer.Vector({
        source: vectorSource2
    });
    map.addLayer(MarkVectorLayer);
}
//清除请求的图层信息
function ClearInf() {
    map.removeLayer(result);
    map.removeLayer(MarkVectorLayer);
    view.setCenter([105.14053344726562, 29.589462296571583]);
    view.setZoom(11);
}
//展示行政区划图
function ShowPic() {
    layer.open({
        type: 1,
        title: false,
        closeBtn: 0,
        area: '516px',
        skin: 'layui-layer-nobg', //没有背景色
        shadeClose: true,
        content: $('#LeiJiang')
    });
}

var features4;
function GetRoadInformation() {
    var viewparams1 = [
       'x1:' + startCoord[0] + ';y1:' + startCoord[1]
    ];
    ////请求路径相关信息
    //var featureRequest4 = new ol.format.WFS().writeGetFeature({
    //    srsName: 'EPSG:4326',
    //    featureNS: 'http://www.metarnet.com/LeiJiang', //命名空间 
    //    featurePrefix: 'LeiJiang', //工作区域 
    //    featureTypes: ['MySql'], //图层名 
    //    outputFormat: 'application/json'
    //});
   
    // then post the request and add the received features to a layer 
    //会有跨域问题，所以需要代理
    fetch('/Home1/GeoWfs2?viewparams='+viewparams1+'', {
        method: 'POST'
        //body: new XMLSerializer().serializeToString(featureRequest4)
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        features4 = new ol.format.GeoJSON().readFeatures(json);
        GetDataFromRoad();
        //console.log(features1[0].getGeometry().getLastCoordinate());
    })
}
var roadLength=0;
function GetDataFromRoad() {
    $.each(features4, function (index, feature) {
        var linestrings = feature.getGeometry().getLineStrings();
        if (linestrings.length > 0) {
            layer.msg("寻路成功！");
        }
        else {
            layer.msg("寻路失败！");
        }
        $.each(linestrings, function (index2, linestring) {
            console.log(linestring.getProperties());
            linestring = linestring.transform("EPSG:4326", "EPSG:3857");
            roadLength += linestring.getLength();
            //console.log(roadLength);
            if (linestrings.length - 1 == index2) {
                layer.msg("最短路径长度为:" + roadLength + "m");
            }
        });
    });
    
}

